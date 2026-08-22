import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { config } from 'dotenv';

config();

const livekitHost = process.env.LIVEKIT_HOST ?? '';
const apiKey = process.env.LIVEKIT_API_KEY ?? '';
const apiSecret = process.env.LIVEKIT_API_SECRET ?? '';

// Only warn — don't crash at import time so the server still starts without LiveKit configured
if (!livekitHost || !apiKey || !apiSecret) {
  console.warn('[LiveKit] Warning: LIVEKIT_HOST / LIVEKIT_API_KEY / LIVEKIT_API_SECRET are not set. Streaming will be unavailable.');
}

const roomService = livekitHost
  ? new RoomServiceClient(livekitHost, apiKey, apiSecret)
  : null;

export const LivekitRoomService = {
  async createRoom({ title, creatorId }: { title: string; creatorId: string }) {
    if (!roomService) throw new Error('LiveKit is not configured');

    const roomName = `${creatorId}-${Date.now()}`;
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300,
      maxParticipants: 200,
      metadata: title,
    });

    const token = new AccessToken(apiKey, apiSecret, {
      identity: creatorId,
      name: title,
    });
    token.addGrant({ roomCreate: true, roomJoin: true, room: room.name });

    return { name: room.name, token: await token.toJwt() };
  },

  async generateToken({ roomId, userId }: { roomId: string; userId: string }) {
    if (!apiKey || !apiSecret) throw new Error('LiveKit is not configured');

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: `Viewer-${userId}`,
    });
    token.addGrant({ roomJoin: true, room: roomId });

    return { token: await token.toJwt() };
  },
};
