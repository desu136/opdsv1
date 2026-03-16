import { prisma } from './prisma';
import { pusherServer } from './pusher';
import { sendNotificationEmail } from './email';

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
    await pusherServer.trigger(`user-${userId}`, 'notification-new', notification);

    // 3. (Optional but requested) Send email notification
    // We do this non-fatally
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      if (user?.email) {
        await sendNotificationEmail(user.email, title, message);
      }
    } catch (emailErr) {
      console.error('Failed to send mirroring email notification:', emailErr);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    // We don't want to crash the main flow if notification fails
    return null;
  }
}
