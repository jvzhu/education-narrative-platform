import dotenv from 'dotenv';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { createApp } from './app';
import { verifyToken } from './middleware/auth';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws/collaboration' });
const clientNarratives = new Map<WebSocket, string>();

wss.on('connection', (socket, request) => {
  try {
    const url = new URL(request.url || '/ws/collaboration', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const narrativeId = url.searchParams.get('narrativeId');
    if (!token || !narrativeId) {
      socket.close(1008, 'Missing token or narrativeId');
      return;
    }
    verifyToken(token);
    clientNarratives.set(socket, narrativeId);
  } catch (error) {
    socket.close(1008, 'Invalid token');
    return;
  }

  socket.on('message', (raw) => {
    const narrativeId = clientNarratives.get(socket);
    if (!narrativeId) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN && clientNarratives.get(client as WebSocket) === narrativeId) {
        client.send(raw.toString());
      }
    }
  });

  socket.on('close', () => {
    clientNarratives.delete(socket);
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on port ${port}`);
});
