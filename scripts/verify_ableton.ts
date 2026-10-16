import http from 'http';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

interface TestTrack {
  id: string;
  name: string;
  role: string;
  colorIndex: number;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  baseMidiNote: number;
  soundType: 'SYNTH_LEAD' | 'SUB_BASS' | 'PERCUSSION' | 'PAD' | 'METALLIC' | 'ACID_PLUCK';
  steps: boolean[];
}

const SAMPLE_TRACKS: TestTrack[] = [
  {
    id: 'agent_sentinel',
    name: 'Sentinel Sub-Bass',
    role: 'Cybernetic 808 Sub-Bass & Low-End Anchor',
    colorIndex: 12,
    volume: 0.85,
    pan: 0.0,
    muted: false,
    soloed: false,
    baseMidiNote: 36, // C2
    soundType: 'SUB_BASS',
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  {
    id: 'agent_nexus',
    name: 'Nexus Acid Lead',
    role: '303 Acid Pluck Arpeggiator',
    colorIndex: 45,
    volume: 0.78,
    pan: -0.2,
    muted: false,
    soloed: false,
    baseMidiNote: 60, // C4
    soundType: 'ACID_PLUCK',
    steps: [true, false, true, false, true, true, false, true, false, true, true, false, true, false, true, false],
  },
  {
    id: 'agent_aegis',
    name: 'Aegis Percussion',
    role: 'Industrial Tech-Glitch & Shaker Core',
    colorIndex: 3,
    volume: 0.82,
    pan: 0.15,
    muted: false,
    soloed: false,
    baseMidiNote: 42, // F#2 (Closed Hat)
    soundType: 'PERCUSSION',
    steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  },
  {
    id: 'agent_chronos',
    name: 'Chronos Granular Pad',
    role: 'Atmospheric Granular Drone & Stereo Ambience',
    colorIndex: 60,
    volume: 0.70,
    pan: 0.3,
    muted: false,
    soloed: false,
    baseMidiNote: 48, // C3
    soundType: 'PAD',
    steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  {
    id: 'agent_valkyrie',
    name: 'Valkyrie Resonant Lead',
    role: 'Dual Saw Peak Lead & Harmonic Top-End',
    colorIndex: 22,
    volume: 0.80,
    pan: -0.1,
    muted: false,
    soloed: false,
    baseMidiNote: 72, // C5
    soundType: 'SYNTH_LEAD',
    steps: [false, true, false, false, true, false, false, true, false, false, true, false, false, true, false, true],
  },
  {
    id: 'agent_cipher',
    name: 'Cipher Metallic Perc',
    role: 'FM Modulated Metallic Percussion & Clank',
    colorIndex: 9,
    volume: 0.75,
    pan: 0.25,
    muted: false,
    soloed: false,
    baseMidiNote: 54, // F#3
    soundType: 'METALLIC',
    steps: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, true, false],
  },
];

function postJson(pathUrl: string, data: any): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: pathUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            buffer: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(pathUrl: string): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 3000, path: pathUrl }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        }
      });
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('🤖 AEGENTIX CYBERDAW - ABLETON LIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: ABLETON LIVE SET (.als) EXPORT & GZIP VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 1. Testing Ableton Live Set (.als) Export ---');
  try {
    const alsRes = await postJson('/api/cyberdaw/ableton/export-als', {
      projectName: 'OmniCyberDAW_Live_Master',
      bpm: 138,
      tracks: SAMPLE_TRACKS,
      includeMasterChain: true,
      masteringStyle: 'HIGH_ENERGY_MASTER',
    });

    assert(alsRes.statusCode === 200, 'HTTP 200 Response for .als export', `Status: ${alsRes.statusCode}`);
    assert(alsRes.headers['content-type'] === 'application/x-gzip', 'Content-Type is application/x-gzip', `Type: ${alsRes.headers['content-type']}`);
    assert(
      alsRes.headers['content-disposition']?.includes('OmniCyberDAW_Live_Master.als') ?? false,
      'Content-Disposition has .als filename',
      alsRes.headers['content-disposition'] as string
    );

    // Verify gzip magic bytes 0x1F 0x8B
    const isGzipMagic = alsRes.buffer[0] === 0x1f && alsRes.buffer[1] === 0x8b;
    assert(isGzipMagic, 'Buffer begins with RFC 1952 GZIP magic bytes (0x1F 0x8B)');

    // Decompress with zlib.gunzipSync
    const unzippedXml = zlib.gunzipSync(alsRes.buffer).toString('utf-8');
    assert(unzippedXml.length > 500, 'Decompressed XML has substantial content', `${unzippedXml.length} bytes uncompressed`);

    // Verify Root XML Elements
    assert(unzippedXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Valid XML declaration header present');
    assert(unzippedXml.includes('<Ableton MajorVersion="5" MinorVersion="11.0_11300"'), 'Ableton root tag with MajorVersion 5 and MinorVersion 11/12');
    assert(unzippedXml.includes('<LiveSet>'), 'Contains <LiveSet> container tag');
    assert(unzippedXml.includes('<Tracks>'), 'Contains <Tracks> element');
    assert(unzippedXml.includes('<MasterTrack Id="9999">'), 'Contains <MasterTrack> element with master bus routing');
    assert(unzippedXml.includes('<Manual Value="138.00"/>'), 'Project BPM (138.00) properly written to <Tempo>');

    // Check all 6 tracks exist
    const trackMatches = unzippedXml.match(/<MidiTrack Id="\d+">/g) || [];
    assert(trackMatches.length === 6, 'All 6 Agent MIDI Tracks present in XML', `Found ${trackMatches.length} tracks`);

    // Check notes exist
    const noteMatches = unzippedXml.match(/<MidiNote /g) || [];
    assert(noteMatches.length > 20, 'Clips contain populated MidiNote events', `Found ${noteMatches.length} MidiNotes`);

    // Save test .als file
    const outputAlsPath = path.join(process.cwd(), 'OmniCyberDAW_Live_Master.als');
    fs.writeFileSync(outputAlsPath, alsRes.buffer);
    console.log(`   📁 Saved test Ableton Set to: ${outputAlsPath}`);
  } catch (err: any) {
    assert(false, 'Ableton Live Set Export Exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: STANDARD MIDI FILE (.mid) BINARY SPEC VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Standard MIDI File (.mid) Export ---');
  try {
    const midRes = await postJson('/api/cyberdaw/midi/export-mid', {
      projectName: 'OmniCyberDAW_MIDI_Stems',
      bpm: 138,
      tracks: SAMPLE_TRACKS,
    });

    assert(midRes.statusCode === 200, 'HTTP 200 Response for .mid export', `Status: ${midRes.statusCode}`);
    assert(midRes.headers['content-type'] === 'audio/midi', 'Content-Type is audio/midi', `Type: ${midRes.headers['content-type']}`);

    const buf = midRes.buffer;

    // Check MThd Chunk
    const mthdTag = buf.slice(0, 4).toString('ascii');
    assert(mthdTag === 'MThd', 'MIDI Header Chunk begins with "MThd"', `Header tag: ${mthdTag}`);

    const headerLength = buf.readUInt32BE(4);
    assert(headerLength === 6, 'Header length is 6 bytes', `Length: ${headerLength}`);

    const format = buf.readUInt16BE(8);
    assert(format === 1, 'MIDI Format is 1 (synchronous multi-track)', `Format: ${format}`);

    const numTracks = buf.readUInt16BE(10);
    assert(numTracks === 7, 'Number of tracks is 7 (1 Conductor + 6 Agent Stems)', `Tracks: ${numTracks}`);

    const division = buf.readUInt16BE(12);
    assert(division === 480, 'Time division is 480 ticks per quarter note', `Division: ${division}`);

    // Count MTrk chunks
    let mtrkCount = 0;
    let offset = 14;
    while (offset < buf.length) {
      if (buf.slice(offset, offset + 4).toString('ascii') === 'MTrk') {
        mtrkCount++;
        const chunkLen = buf.readUInt32BE(offset + 4);
        offset += 8 + chunkLen;
      } else {
        offset++;
      }
    }
    assert(mtrkCount === 7, 'All 7 MTrk chunks properly structured and framed', `Counted: ${mtrkCount} MTrk chunks`);

    // Save test .mid file
    const outputMidPath = path.join(process.cwd(), 'OmniCyberDAW_MIDI_Stems.mid');
    fs.writeFileSync(outputMidPath, buf);
    console.log(`   📁 Saved test MIDI file to: ${outputMidPath}`);
  } catch (err: any) {
    assert(false, 'MIDI File Export Exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: PYTHON REMOTE SCRIPT & OSC PROTOCOL ENDPOINT
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Python Remote Script & OSC Endpoints ---');
  try {
    const scriptRes = await getJson('/api/cyberdaw/ableton/remote-script');
    assert(scriptRes.statusCode === 200, 'HTTP 200 Response for /api/cyberdaw/ableton/remote-script');
    assert(scriptRes.body.controllerName === 'Aegentix_CyberDAW', 'Controller name is Aegentix_CyberDAW');
    assert(scriptRes.body.pythonScript && scriptRes.body.pythonScript.length > 500, 'Python remote script code returned (>500 bytes)');
    assert(scriptRes.body.pythonScript.includes('class Aegentix_CyberDAW'), 'Python script defines Aegentix_CyberDAW class');
    assert(scriptRes.body.targetLiveVersions?.includes('Ableton Live 12'), 'Supports Ableton Live 12');

    // Test OSC Trigger endpoint
    const oscRes = await postJson('/api/cyberdaw/ableton/osc-trigger', {
      command: '/live/tempo',
      args: [138.0],
    });
    assert(oscRes.statusCode === 200, 'HTTP 200 Response for /api/cyberdaw/ableton/osc-trigger');
    const oscBody = JSON.parse(oscRes.buffer.toString('utf-8'));
    assert(oscBody.sentCommand === '/live/tempo', 'OSC command dispatched successfully', `Command: ${oscBody.sentCommand}`);
  } catch (err: any) {
    assert(false, 'Remote Script / OSC Exception', err.message);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passedTests} / ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
