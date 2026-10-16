/**
 * AEGENTIX CYBERDAW - STANDARD MIDI FILE (.MID) GENERATOR
 * Generates pure binary Standard MIDI Files (SMF Format 1) with zero external dependencies.
 * Fully compatible with Ableton Live 10/11/12, Logic Pro, Pro Tools, and hardware sequencers.
 */

export interface MidiTrackConfig {
  name: string;
  channel: number; // 0 to 15
  baseNote: number; // 0 to 127
  steps: boolean[]; // 16 steps
}

export function generateStandardMidiFile(
  bpm: number,
  tracks: MidiTrackConfig[],
  ticksPerQuarterNote = 480
): Uint8Array {
  const numTracks = tracks.length + 1; // Track 0 = Conductor/Tempo track, Tracks 1..N = Channels
  const fileChunks: number[][] = [];

  // 1. HEADER CHUNK (MThd)
  const header = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // length = 6
    0x00, 0x01,             // Format 1 (multi-track synchronous)
    (numTracks >> 8) & 0xff, numTracks & 0xff,
    (ticksPerQuarterNote >> 8) & 0xff, ticksPerQuarterNote & 0xff,
  ];
  fileChunks.push(header);

  // 2. CONDUCTOR / TEMPO TRACK (Track 0)
  const tempoTrackEvents: number[] = [];
  // Track Name: "Aegentix CyberDAW Conductor"
  writeMetaEvent(tempoTrackEvents, 0, 0x03, stringToBytes("Aegentix CyberDAW Conductor"));

  // Set Tempo: Microseconds per quarter note = 60,000,000 / BPM
  const usPerQuarter = Math.round(60_000_000 / bpm);
  writeMetaEvent(tempoTrackEvents, 0, 0x51, [
    (usPerQuarter >> 16) & 0xff,
    (usPerQuarter >> 8) & 0xff,
    usPerQuarter & 0xff,
  ]);

  // Time Signature: 4/4 (numerator: 4, denominator exponent: 2 = 2^2 = 4, clocks/click: 24, 32nd notes/crotchet: 8)
  writeMetaEvent(tempoTrackEvents, 0, 0x58, [0x04, 0x02, 0x18, 0x08]);

  // End of Track
  writeMetaEvent(tempoTrackEvents, 0, 0x2f, []);
  fileChunks.push(wrapMTrkChunk(tempoTrackEvents));

  // 3. AGENT MIDI DATA TRACKS
  tracks.forEach((track, trackIdx) => {
    const trackEvents: number[] = [];
    const ch = track.channel & 0x0f;

    // Track Name
    writeMetaEvent(trackEvents, 0, 0x03, stringToBytes(track.name));

    // Each 16th note in 480 ticks/beat = 480 / 4 = 120 ticks
    const stepTicks = Math.round(ticksPerQuarterNote / 4);
    const gateTicks = Math.round(stepTicks * 0.8); // 80% gate length

    let accumulatedDelta = 0;

    track.steps.forEach((active, stepIdx) => {
      if (active) {
        const notePitch = Math.max(0, Math.min(127, track.baseNote));
        const velocity = stepIdx % 4 === 0 ? 115 : 100;

        // Note On (0x90 | ch)
        writeVlq(trackEvents, accumulatedDelta);
        trackEvents.push(0x90 | ch, notePitch, velocity);

        // Note Off (0x80 | ch) after gate length
        writeVlq(trackEvents, gateTicks);
        trackEvents.push(0x80 | ch, notePitch, 0x00);

        // Remaining delta time until next step starts
        accumulatedDelta = stepTicks - gateTicks;
      } else {
        accumulatedDelta += stepTicks;
      }
    });

    // End of Track
    writeMetaEvent(trackEvents, accumulatedDelta, 0x2f, []);
    fileChunks.push(wrapMTrkChunk(trackEvents));
  });

  // Flatten into a single Uint8Array
  const totalLength = fileChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of fileChunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }

  return out;
}

function wrapMTrkChunk(events: number[]): number[] {
  const len = events.length;
  return [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (len >> 24) & 0xff,
    (len >> 16) & 0xff,
    (len >> 8) & 0xff,
    len & 0xff,
    ...events,
  ];
}

function writeMetaEvent(buf: number[], deltaTime: number, metaType: number, data: number[]): void {
  writeVlq(buf, deltaTime);
  buf.push(0xff, metaType);
  writeVlq(buf, data.length);
  for (const byte of data) buf.push(byte);
}

function writeVlq(buf: number[], value: number): void {
  const bytes: number[] = [];
  bytes.push(value & 0x7f);
  let v = value >> 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v = v >> 7;
  }
  for (const b of bytes) buf.push(b);
}

function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) & 0xff);
  }
  return bytes;
}
