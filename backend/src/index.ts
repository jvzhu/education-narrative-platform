import dotenv from 'dotenv';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { createApp } from './app';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws/collaboration' });

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw.toString());
      }
    }
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on port ${port}`);
});
