import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createValidator } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

export let io: SocketIOServer | null = null;

// Basic profanity word list (extend in production)
const BLOCKED_WORDS = ['badword', 'offensive'];

function sanitize(text: string): string {
  let clean = text.trim();
  for (const word of BLOCKED_WORDS) {
    clean = clean.replace(new RegExp(word, 'gi'), '****');
  }
  return clean;
}

export const initChat = (httpServer: any) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Chat connected:', socket.id);

    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('chatMessage', (payload: { roomId: string; userId: string; content: string }) => {
      if (!payload?.roomId || !payload?.content) return;
      const message = {
        id: `msg_${Date.now()}`,
        roomId: payload.roomId,
        senderId: socket.id,
        userId: payload.userId,
        content: sanitize(payload.content),
        timestamp: new Date().toISOString(),
      };
      // Broadcast to everyone in the room
      io?.to(payload.roomId).emit('chatMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected:', socket.id);
    });
  });
};

// HTTP fallback — POST /api/chat/message
router.post(
  '/message',
  createValidator(
    z.object({
      roomId: z.string().min(1),
      userId: z.string().min(1),
      content: z.string().min(1).max(500),
    })
  ),
  (req, res) => {
    const { roomId, userId, content } = req.body;
    const message = {
      id: `msg_${Date.now()}`,
      roomId,
      userId,
      content: sanitize(content),
      timestamp: new Date().toISOString(),
    };
    io?.to(roomId).emit('chatMessage', message);
    res.json({ success: true, message });
  }
);

export default router;
