import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory active rooms for private 1-on-1 connections
interface ClientConnection {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId: string;
}

const rooms = new Map<string, Set<ClientConnection>>();

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  let currentConn: ClientConnection | null = null;

  ws.on('message', (messageRaw: string) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type, roomId, userId, userName, payload } = data;

      if (type === 'join_room') {
        if (!roomId || !userId) return;

        // Leave previous room if any
        if (currentConn && rooms.has(currentConn.roomId)) {
          rooms.get(currentConn.roomId)?.delete(currentConn);
        }

        currentConn = { ws, userId, userName: userName || 'Partner', roomId };

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        const roomClients = rooms.get(roomId)!;
        roomClients.add(currentConn);

        // Notify room members of presence
        const members = Array.from(roomClients).map(c => ({ userId: c.userId, userName: c.userName }));
        broadcastToRoom(roomId, {
          type: 'presence_update',
          members,
          connectedCount: roomClients.size,
        });

        // Reply to current socket that join succeeded
        ws.send(JSON.stringify({
          type: 'joined_room_ack',
          roomId,
          connectedCount: roomClients.size,
        }));
      } else if (type === 'message' || type === 'snap' || type === 'typing' || type === 'reaction' || type === 'mood_update' || type === 'call_signal' || type === 'customization_update') {
        if (!currentConn) return;
        // Broadcast to all other peers in the same room
        broadcastToRoom(currentConn.roomId, {
          type,
          senderId: currentConn.userId,
          senderName: currentConn.userName,
          payload,
          timestamp: Date.now(),
        }, currentConn.userId);
      }
    } catch (err) {
      console.error('Error processing ws message:', err);
    }
  });

  ws.on('close', () => {
    if (currentConn && rooms.has(currentConn.roomId)) {
      const roomClients = rooms.get(currentConn.roomId)!;
      roomClients.delete(currentConn);

      if (roomClients.size === 0) {
        rooms.delete(currentConn.roomId);
      } else {
        const members = Array.from(roomClients).map(c => ({ userId: c.userId, userName: c.userName }));
        broadcastToRoom(currentConn.roomId, {
          type: 'presence_update',
          members,
          connectedCount: roomClients.size,
        });
      }
    }
  });
});

function broadcastToRoom(roomId: string, data: any, excludeUserId?: string) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;

  const payload = JSON.stringify(data);
  for (const client of roomClients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (!excludeUserId || client.userId !== excludeUserId) {
        client.ws.send(payload);
      }
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Meow',
    activeRooms: rooms.size,
    timestamp: Date.now(),
  });
});

// Room validation endpoint
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  res.json({
    roomId,
    active: !!room,
    peersCount: room ? room.size : 0,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🐱 Meow server running smoothly on http://localhost:${PORT}`);
  });
}

startServer();
