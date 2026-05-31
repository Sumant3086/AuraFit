const Notification = require('../models/Notification');
const { emitToUser } = require('../socket/socketServer');

const ICONS = {
  achievement: '🏅',
  checkin: '📍',
  social: '💬',
  booking: '📅',
  membership: '💎',
  streak: '🔥',
  system: 'ℹ️',
  referral: '🎁',
  level_up: '⬆️',
};

async function createNotification({ userId, type = 'system', title, message, link = null, data = {} }) {
  try {
    const notification = await Notification.create({ userId, type, title, message, link, data });

    // Push to user via WebSocket if online
    emitToUser(String(userId), 'notification', {
      _id: notification._id,
      type,
      title,
      message,
      link,
      icon: ICONS[type] || 'ℹ️',
      createdAt: notification.createdAt,
      read: false,
    });

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

async function notifyAchievement(userId, achievementName, points) {
  return createNotification({
    userId,
    type: 'achievement',
    title: `Achievement Unlocked! 🏅`,
    message: `You earned "${achievementName}" and ${points} points!`,
    link: '/achievements',
    data: { achievementName, points },
  });
}

async function notifyStreak(userId, streak) {
  return createNotification({
    userId,
    type: 'streak',
    title: `${streak}-Day Streak! 🔥`,
    message: `Incredible consistency! You've been training ${streak} days in a row.`,
    link: '/dashboard',
    data: { streak },
  });
}

async function notifyLevelUp(userId, level) {
  return createNotification({
    userId,
    type: 'level_up',
    title: `Level Up! ⬆️`,
    message: `You've reached Level ${level}! Keep pushing your limits.`,
    link: '/dashboard',
    data: { level },
  });
}

async function notifyCheckin(userId, pointsEarned, streak) {
  return createNotification({
    userId,
    type: 'checkin',
    title: 'Check-In Successful! 📍',
    message: `You earned ${pointsEarned} points. Current streak: ${streak} days.`,
    link: '/dashboard',
    data: { pointsEarned, streak },
  });
}

async function notifyBooking(userId, trainerName, date, startTime) {
  return createNotification({
    userId,
    type: 'booking',
    title: 'Session Booked! 📅',
    message: `Your session with ${trainerName} is confirmed for ${date} at ${startTime}.`,
    link: '/book-trainer',
    data: { trainerName, date, startTime },
  });
}

async function notifyMembership(userId, plan, endDate) {
  return createNotification({
    userId,
    type: 'membership',
    title: 'Membership Activated! 💎',
    message: `Your ${plan} membership is now active until ${new Date(endDate).toLocaleDateString()}.`,
    link: '/dashboard',
    data: { plan, endDate },
  });
}

async function notifyMembershipExpiry(userId, plan, daysLeft) {
  return createNotification({
    userId,
    type: 'membership',
    title: `Membership Expiring Soon ⚠️`,
    message: `Your ${plan} membership expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew to keep your progress!`,
    link: '/pricing',
    data: { plan, daysLeft },
  });
}

async function notifySocialLike(userId, likerName, postSnippet) {
  return createNotification({
    userId,
    type: 'social',
    title: `${likerName} liked your post 👍`,
    message: `"${postSnippet.slice(0, 60)}${postSnippet.length > 60 ? '...' : ''}"`,
    link: '/community',
    data: { likerName },
  });
}

async function notifySocialComment(userId, commenterName, postSnippet) {
  return createNotification({
    userId,
    type: 'social',
    title: `${commenterName} commented on your post 💬`,
    message: `"${postSnippet.slice(0, 60)}${postSnippet.length > 60 ? '...' : ''}"`,
    link: '/community',
    data: { commenterName },
  });
}

module.exports = {
  createNotification,
  notifyAchievement,
  notifyStreak,
  notifyLevelUp,
  notifyCheckin,
  notifyBooking,
  notifyMembership,
  notifyMembershipExpiry,
  notifySocialLike,
  notifySocialComment,
};
