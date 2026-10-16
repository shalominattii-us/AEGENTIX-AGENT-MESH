/**
 * AEGENTIX CYBERDAW - OBS STUDIO V5 WEBSOCKET CONTROLLER
 * Full remote broadcast automation for OBS Studio 30+ via obs-websocket v5 protocol.
 */

import WebSocket from 'ws';
import crypto from 'crypto';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const OBS_EXE_PATH = 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe';
export const OBS_WORKING_DIR = 'C:\\Program Files\\obs-studio\\bin\\64bit';
export const OBS_WS_URL = 'ws://127.0.0.1:4455';
export const OBS_PASSWORD = 'trfKcwFieW9cUE8Q2lFgtju1';

export interface ObsStatusSummary {
  processRunning: boolean;
  pid?: number;
  connected: boolean;
  recording: boolean;
  recordTimecode?: string;
  streaming: boolean;
  streamTimecode?: string;
  virtualCamActive: boolean;
  currentProgramScene?: string;
  fps?: number;
  cpuUsage?: number;
  memoryUsageMB?: number;
  availableDiskSpaceMB?: number;
}

/**
 * Checks if obs64.exe is running on Windows
 */
export function getObsProcessStatus(): Promise<{ running: boolean; pid?: number; name?: string }> {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq obs64.exe" /FO CSV /NH', (err, stdout) => {
      if (err || !stdout || stdout.includes('No tasks are running')) {
        resolve({ running: false });
      } else {
        const parts = stdout.trim().split(',');
        const pid = parseInt(parts[1]?.replace(/"/g, ''), 10);
        resolve({ running: !isNaN(pid), pid, name: 'obs64.exe' });
      }
    });
  });
}

/**
 * Launches OBS Studio with safe mode disabled
 */
export function launchObs(): Promise<{ success: boolean; pid?: number; message: string }> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(OBS_EXE_PATH)) {
      return reject(new Error(`OBS Studio executable not found at: ${OBS_EXE_PATH}`));
    }

    // Clean up .sentinel if present to avoid safe mode prompt
    const sentinelPath = path.join(process.env.APPDATA || '', 'obs-studio', '.sentinel');
    try {
      if (fs.existsSync(sentinelPath)) fs.unlinkSync(sentinelPath);
    } catch (_) {}

    const child = spawn(OBS_EXE_PATH, ['--disable-safe-mode'], {
      cwd: OBS_WORKING_DIR,
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    resolve({
      success: true,
      pid: child.pid,
      message: `Launched OBS Studio 32 (PID: ${child.pid})`,
    });
  });
}

/**
 * Executes a single request against OBS WebSocket v5 and returns the responseData
 */
export function callObs(requestType: string, requestData: any = {}, timeoutMs = 3500): Promise<any> {
  return new Promise((resolve, reject) => {
    let ws: WebSocket | null = null;
    let isDone = false;

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        if (ws) ws.terminate();
        reject(new Error(`OBS WebSocket call '${requestType}' timed out after ${timeoutMs}ms (OBS Studio may be closed)`));
      }
    }, timeoutMs);

    try {
      ws = new WebSocket(OBS_WS_URL);
    } catch (err: any) {
      clearTimeout(timer);
      return reject(err);
    }

    const reqId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Op 0: Hello -> Identify
        if (msg.op === 0) {
          const authReq = msg.d.authentication;
          let authString: string | undefined;

          if (authReq) {
            const { challenge, salt } = authReq;
            const secret = crypto
              .createHash('sha256')
              .update(OBS_PASSWORD + salt)
              .digest('base64');
            authString = crypto
              .createHash('sha256')
              .update(secret + challenge)
              .digest('base64');
          }

          ws?.send(
            JSON.stringify({
              op: 1,
              d: {
                rpcVersion: 1,
                authentication: authString,
                eventSubscriptions: 33,
              },
            })
          );
        }

        // Op 2: Identified -> Send Request
        else if (msg.op === 2) {
          ws?.send(
            JSON.stringify({
              op: 6,
              d: {
                requestType,
                requestId: reqId,
                requestData,
              },
            })
          );
        }

        // Op 7: RequestResponse
        else if (msg.op === 7) {
          if (msg.d.requestId === reqId) {
            isDone = true;
            clearTimeout(timer);
            ws?.close();
            if (msg.d.requestStatus?.result) {
              resolve(msg.d.responseData || {});
            } else {
              reject(new Error(`OBS Error [${requestType}]: ${msg.d.requestStatus?.comment || 'Request failed'}`));
            }
          }
        }
      } catch (err: any) {
        isDone = true;
        clearTimeout(timer);
        ws?.close();
        reject(err);
      }
    });

    ws.on('error', (err) => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

/**
 * Aggregates full real-time status of OBS Studio (Process, WebSocket, Record, Stream, VirtualCam, Stats)
 */
export async function getObsStatus(): Promise<ObsStatusSummary> {
  const proc = await getObsProcessStatus();
  if (!proc.running) {
    return {
      processRunning: false,
      connected: false,
      recording: false,
      streaming: false,
      virtualCamActive: false,
    };
  }

  try {
    // Query stats and status in parallel
    const [stats, recordStatus, streamStatus, camStatus, sceneData] = await Promise.all([
      callObs('GetStats').catch(() => null),
      callObs('GetRecordStatus').catch(() => null),
      callObs('GetStreamStatus').catch(() => null),
      callObs('GetVirtualCamStatus').catch(() => null),
      callObs('GetCurrentProgramScene').catch(() => null),
    ]);

    return {
      processRunning: true,
      pid: proc.pid,
      connected: true,
      recording: Boolean(recordStatus?.outputActive),
      recordTimecode: recordStatus?.outputTimecode || '00:00:00',
      streaming: Boolean(streamStatus?.outputActive),
      streamTimecode: streamStatus?.outputTimecode || '00:00:00',
      virtualCamActive: Boolean(camStatus?.outputActive),
      currentProgramScene: sceneData?.currentProgramSceneName || 'Scene',
      fps: stats?.activeFps ? Math.round(stats.activeFps) : undefined,
      cpuUsage: stats?.cpuUsage ? Math.round(stats.cpuUsage * 10) / 10 : undefined,
      memoryUsageMB: stats?.memoryUsage ? Math.round(stats.memoryUsage) : undefined,
      availableDiskSpaceMB: stats?.availableDiskSpace ? Math.round(stats.availableDiskSpace) : undefined,
    };
  } catch (_) {
    return {
      processRunning: true,
      pid: proc.pid,
      connected: false,
      recording: false,
      streaming: false,
      virtualCamActive: false,
    };
  }
}

export interface ObsAudioInputDetail {
  inputName: string;
  inputKind: string;
  inputVolumeDb: number;
  inputVolumeMul: number;
  inputMuted: boolean;
  filters: Array<{ filterName: string; filterKind: string; filterEnabled: boolean }>;
}

/**
 * Returns all audio inputs in OBS with their real-time volume, mute state, and installed filters
 */
export async function getObsAudioMixer(): Promise<ObsAudioInputDetail[]> {
  const proc = await getObsProcessStatus();
  if (!proc.running) return [];

  try {
    const listData = await callObs('GetInputList');
    const allInputs = listData?.inputs || [];

    // Filter to audio inputs
    const audioInputs = allInputs.filter((i: any) =>
      i.inputKind.includes('audio') ||
      i.inputKind.includes('wasapi') ||
      i.inputKind.includes('mic')
    );

    const details = await Promise.all(
      audioInputs.map(async (inp: any) => {
        const [vol, mute, filters] = await Promise.all([
          callObs('GetInputVolume', { inputName: inp.inputName }).catch(() => ({ inputVolumeDb: 0, inputVolumeMul: 1 })),
          callObs('GetInputMute', { inputName: inp.inputName }).catch(() => ({ inputMuted: false })),
          callObs('GetSourceFilterList', { sourceName: inp.inputName }).catch(() => ({ filters: [] })),
        ]);

        return {
          inputName: inp.inputName,
          inputKind: inp.inputKind,
          inputVolumeDb: vol.inputVolumeDb ?? 0,
          inputVolumeMul: vol.inputVolumeMul ?? 1,
          inputMuted: Boolean(mute.inputMuted),
          filters: (filters.filters || []).map((f: any) => ({
            filterName: f.filterName,
            filterKind: f.filterKind,
            filterEnabled: Boolean(f.filterEnabled),
          })),
        };
      })
    );

    return details;
  } catch (err) {
    return [];
  }
}

/**
 * Sets input volume in dB
 */
export async function setObsAudioInputVolume(inputName: string, inputVolumeDb: number) {
  return callObs('SetInputVolume', { inputName, inputVolumeDb });
}

/**
 * Toggles or sets input mute state
 */
export async function setObsAudioInputMute(inputName: string, inputMuted: boolean) {
  return callObs('SetInputMute', { inputName, inputMuted });
}

/**
 * Applies a professional 3-tier Studio DSP Rack to an OBS audio input:
 * 1. AI Noise Suppression (RNNoise)
 * 2. Studio Master Compressor (3:1, 6ms attack, 60ms release)
 * 3. True Peak Brickwall Limiter (-1.0 dBTP ceiling protection)
 */
export async function applyStudioDspRackToSource(sourceName: string) {
  const existingFilters = await callObs('GetSourceFilterList', { sourceName }).catch(() => ({ filters: [] }));
  const filterNames = new Set((existingFilters.filters || []).map((f: any) => f.filterName));
  const results = [];

  // 1. RNNoise AI Noise Suppression (if mic or voice)
  if (!filterNames.has('Studio AI Noise Suppression') && (sourceName.toLowerCase().includes('mic') || sourceName.toLowerCase().includes('aux'))) {
    try {
      await callObs('CreateSourceFilter', {
        sourceName,
        filterName: 'Studio AI Noise Suppression',
        filterKind: 'noise_suppress_filter',
        filterSettings: {
          method: 'rnnoise', // RNNoise neural network
        },
      });
      results.push('RNNoise AI Noise Suppression installed');
    } catch (_) {}
  }

  // 2. Studio Compressor
  if (!filterNames.has('Studio Leveler Compressor')) {
    try {
      await callObs('CreateSourceFilter', {
        sourceName,
        filterName: 'Studio Leveler Compressor',
        filterKind: 'compressor_filter',
        filterSettings: {
          ratio: 3.0,
          threshold: -18.0,
          attack_time: 6,
          release_time: 60,
          output_gain: 2.0,
        },
      });
      results.push('Studio Leveler Compressor installed');
    } catch (_) {}
  }

  // 3. True Peak Brickwall Limiter (-1.0 dB)
  if (!filterNames.has('Studio True Peak Limiter')) {
    try {
      await callObs('CreateSourceFilter', {
        sourceName,
        filterName: 'Studio True Peak Limiter',
        filterKind: 'limiter_filter',
        filterSettings: {
          threshold: -1.0,
          release_time: 60,
        },
      });
      results.push('Studio True Peak Limiter installed');
    } catch (_) {}
  }

  return {
    sourceName,
    applied: results,
    totalFiltersNow: (existingFilters.filters?.length || 0) + results.length,
  };
}
