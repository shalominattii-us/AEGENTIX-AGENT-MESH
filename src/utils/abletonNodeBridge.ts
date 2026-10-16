/**
 * AEGENTIX CYBERDAW - ABLETON LIVE NODE BRIDGE
 * Backend-only module for IPC, process management, and TCP JSON-RPC socket connection to Ableton Live.
 */

import net from 'net';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const ABLETON_EXE_PATH = 'C:\\ProgramData\\Ableton\\Live 12 Trial\\Program\\Ableton Live 12 Trial.exe';

/**
 * Dispatches a JSON-RPC method to the running Ableton Live instance over TCP 11000
 */
export function sendLiveCommand(method: string, params: any = {}, timeoutMs = 2500): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = '';
    let isDone = false;

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        client.destroy();
        reject(new Error(`Ableton Live API call '${method}' timed out after ${timeoutMs}ms (Ableton Live may not be running or remote script not active)`));
      }
    }, timeoutMs);

    client.connect(11000, '127.0.0.1', () => {
      const payload = JSON.stringify({ id: Date.now(), method, params }) + '\n';
      client.write(payload);
    });

    client.on('data', (chunk) => {
      responseData += chunk.toString('utf-8');
      if (responseData.includes('\n')) {
        isDone = true;
        clearTimeout(timer);
        client.destroy();
        try {
          const parsed = JSON.parse(responseData.trim());
          if (parsed.error) {
            reject(new Error(parsed.error));
          } else {
            resolve(parsed.result);
          }
        } catch (e: any) {
          reject(new Error('Failed to parse response from Ableton Live: ' + e.message));
        }
      }
    });

    client.on('error', (err) => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

/**
 * Checks whether Ableton Live 12 process is running on Windows
 */
export function getAbletonProcessStatus(): Promise<{ running: boolean; pid?: number; name?: string }> {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq Ableton Live 12 Trial.exe" /FO CSV /NH', (err, stdout) => {
      if (err || !stdout || stdout.includes('No tasks are running')) {
        resolve({ running: false });
      } else {
        const parts = stdout.trim().split(',');
        const pid = parseInt(parts[1]?.replace(/"/g, ''), 10);
        resolve({ running: !isNaN(pid), pid, name: 'Ableton Live 12 Trial.exe' });
      }
    });
  });
}

/**
 * Launches the Ableton Live 12 process on Windows with an optional .als file
 */
export function launchAbleton(alsFilePath?: string): Promise<{ success: boolean; pid?: number; message: string }> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(ABLETON_EXE_PATH)) {
      return reject(new Error(`Ableton Live 12 executable not found at: ${ABLETON_EXE_PATH}`));
    }

    const args = alsFilePath && fs.existsSync(alsFilePath) ? [path.resolve(alsFilePath)] : [];
    const child = spawn(ABLETON_EXE_PATH, args, { detached: true, stdio: 'ignore' });
    child.unref();

    resolve({
      success: true,
      pid: child.pid,
      message: `Launched Ableton Live 12 Trial (PID: ${child.pid})` + (args.length ? ` with project: ${args[0]}` : ''),
    });
  });
}
