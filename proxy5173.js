import http from 'http';

const targetPort = 3000;
const listenPort = 5173;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${targetPort}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy Error: Could not connect to internal server on port ${targetPort}`);
  });

  req.pipe(proxyReq, { end: true });
});

// Support WebSockets proxying for live HMR and telemetry streams
server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}\r\n`)
        .join('') +
      '\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(listenPort, '0.0.0.0', () => {
  console.log(`[AEGENTIX DUAL-PORT BRIDGE] Port 5173 seamlessly forward-routed to Port ${targetPort}`);
});
