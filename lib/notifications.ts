import { prisma } from './prisma';
import { pusherServer } from './pusher';

export async function sendNotification({
  userId,
  title,
  message,
  type = 'INFO'
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}) {
  try {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      }
    });

    // 2. Trigger real-time event via Pusher
    // Channel name: user-[userId]
    // Event name: notification-new
    await pusherServer.trigger(`user-${userId}`, 'notification-new', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    // We don't want to crash the main flow if notification fails
    return null;
  }
}
