import { Router } from 'express';
import { LivekitRoomService } from '../services/livekit';
import { z } from 'zod';
import { createValidator } from '../middleware/validation';

const router = Router();

// Create a new streaming room (creator only)
router.post(
  '/create',
  createValidator(
    z.object({
      title: z.string().min(1),
      creatorId: z.string().uuid(),
    })
  ),
  async (req, res) => {
    const { title, creatorId } = req.body;
    try {
      const room = await LivekitRoomService.createRoom({ title, creatorId });
      res.status(201).json({ roomId: room.name, token: room.token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create stream' });
    }
  }
);

// Join an existing room (viewer)
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query as any;
  try {
    const token = await LivekitRoomService.generateToken({ roomId, userId });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join stream' });
  }
});

export default router;
