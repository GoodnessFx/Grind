import { supabase, supabaseAdmin } from './supabase';
import { io } from '../routes/chat';

const db = () => supabaseAdmin ?? supabase;

/**
 * Create a notification record and push it to the user's Socket.io room.
 * Non-blocking — never throws, only logs errors.
 */
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string,
  refId?: string
): Promise<void> {
  try {
    const { data: notif } = await db()
      .from('notifications')
      .insert({ user_id: userId, title, body, type, ref_id: refId ?? null })
      .select()
      .single();

    // Push via Socket.io if the user is connected
    if (notif && io) {
      io.to(`user:${userId}`).emit('notification', notif);
    }
  } catch (err: any) {
    console.error('[notify] Failed to notify user:', err.message);
  }
}
