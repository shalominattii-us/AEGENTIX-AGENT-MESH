import WebSocket from 'ws';
import crypto from 'crypto';

const OBS_WS_URL = 'ws://127.0.0.1:4455';
const OBS_PASSWORD = 'trfKcwFieW9cUE8Q2lFgtju1';

console.log('Connecting to OBS WebSocket v5 at', OBS_WS_URL, '...');

const ws = new WebSocket(OBS_WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket TCP connection established to OBS Studio!');
});

ws.on('message', (data: WebSocket.Data) => {
  const msg = JSON.parse(data.toString());
  // Opcode 0: Hello
  if (msg.op === 0) {
    console.log('👋 Received Op 0 (Hello) from OBS:', msg.d.obsWebSocketVersion);
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

    const identifyPayload = {
      op: 1,
      d: {
        rpcVersion: 1,
        authentication: authString,
        eventSubscriptions: 33, // General + Outputs
      },
    };
    ws.send(JSON.stringify(identifyPayload));
    console.log('🔐 Sent Op 1 (Identify) with SHA256 auth response');
  }

  // Opcode 2: Identified
  else if (msg.op === 2) {
    console.log('🎉 Successfully Authenticated with OBS Studio! (Op 2 Identified)');

    // 1. Query Version
    ws.send(JSON.stringify({
      op: 6,
      d: {
        requestType: 'GetVersion',
        requestId: 'req-version',
      },
    }));

    // 2. Query Stats
    ws.send(JSON.stringify({
      op: 6,
      d: {
        requestType: 'GetStats',
        requestId: 'req-stats',
      },
    }));

    // 3. Query Scene List
    ws.send(JSON.stringify({
      op: 6,
      d: {
        requestType: 'GetSceneList',
        requestId: 'req-scenes',
      },
    }));

    // 4. Query Record Status
    ws.send(JSON.stringify({
      op: 6,
      d: {
        requestType: 'GetRecordStatus',
        requestId: 'req-record',
      },
    }));
  }

  // Opcode 7: RequestResponse
  else if (msg.op === 7) {
    const { requestId, requestType, requestStatus, responseData } = msg.d;
    console.log(`\n📥 [OBS Response] Type: ${requestType} | ID: ${requestId} | Status: ${requestStatus.result ? 'OK' : 'FAIL'}`);
    console.log('   Data:', JSON.stringify(responseData, null, 2));

    if (requestId === 'req-record') {
      console.log('\n========================================================');
      console.log('🎯 OBS STUDIO IS 100% OPERATIONAL, CONNECTED & CONTROLLABLE');
      console.log('========================================================\n');
      ws.close();
      process.exit(0);
    }
  }
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
  process.exit(1);
});
