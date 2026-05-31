const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { notifyMembershipExpiry, createNotification } = require('../services/notificationService');
const { sendEmail, templates } = require('../services/emailService');
const { logger } = require('../middleware/logger');

function initCronJobs() {
  // ── 1. Streak Reminder — Every day at 8:00 AM ──────────────────
  cron.schedule('0 8 * * *', async () => {
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      const yesterday = new Date(Date.now() - 86400000);
      yesterday.setHours(0, 0, 0, 0);

      // Users who had a streak but haven't checked in for 2 days
      const atRisk = await User.find({
        currentStreak: { $gt: 0 },
        lastLogin: { $lt: twoDaysAgo },
        status: 'Active',
        emailNotifications: { $ne: false },
      }).select('_id name email currentStreak').lean();

      for (const user of atRisk) {
        await createNotification({
          userId: user._id,
          type: 'streak',
          title: `Don't break your ${user.currentStreak}-day streak! 🔥`,
          message: 'Come check in today to keep your momentum going. You\'ve worked too hard to lose it!',
          link: '/checkin',
        });

        sendEmail({
          to: user.email,
          subject: `⚠️ Your ${user.currentStreak}-day streak is at risk!`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
              <h1 style="color:#ff6b35;">🔥 ${user.name}, don't lose your streak!</h1>
              <p style="color:#ccc;font-size:16px;line-height:1.6;">
                Your <strong style="color:#ffd700;">${user.currentStreak}-day streak</strong> is about to end.<br>
                Check in today to keep the momentum going!
              </p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/checkin"
                style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d00ff,#00d4ff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">
                Check In Now
              </a>
              <p style="color:#444;font-size:12px;margin-top:24px;">AuraFit — Your AI Fitness Partner</p>
            </div>
          `,
        }).catch(() => {});
      }

      if (atRisk.length > 0) logger.info(`Streak reminders sent to ${atRisk.length} users`);
    } catch (err) {
      logger.error('Streak cron error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // ── 2. Membership Expiry Warning — Every day at 9:00 AM ────────
  cron.schedule('0 9 * * *', async () => {
    try {
      const in3Days = new Date(Date.now() + 3 * 86400000);
      const in7Days = new Date(Date.now() + 7 * 86400000);

      // Users with membership expiring in 3 or 7 days
      const expiring = await User.find({
        membershipEndDate: { $gte: new Date(), $lte: in7Days },
        membership: { $ne: 'None' },
        status: 'Active',
      }).select('_id name email membership membershipEndDate').lean();

      for (const user of expiring) {
        const daysLeft = Math.ceil((new Date(user.membershipEndDate) - Date.now()) / 86400000);
        await notifyMembershipExpiry(user._id, user.membership, daysLeft);

        if (daysLeft <= 3) {
          sendEmail({
            to: user.email,
            subject: `⚠️ Your AuraFit membership expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
                <h1 style="color:#ffd700;">💎 Renew Your Membership</h1>
                <p style="color:#ccc;font-size:16px;line-height:1.6;">
                  Hi ${user.name}, your <strong style="color:#9d00ff;">${user.membership}</strong> membership
                  expires in <strong style="color:#ff4444;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
                </p>
                <p style="color:#ccc;font-size:15px;">Don't lose access to your AI workouts, progress tracking, and trainer bookings!</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing"
                  style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d00ff,#00d4ff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">
                  Renew Now
                </a>
              </div>
            `,
          }).catch(() => {});
        }
      }

      if (expiring.length > 0) logger.info(`Membership expiry alerts sent to ${expiring.length} users`);
    } catch (err) {
      logger.error('Membership expiry cron error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // ── 3. Re-engagement for Inactive Users — Every Monday at 10 AM ─
  cron.schedule('0 10 * * 1', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

      const inactive = await User.find({
        lastLogin: { $lt: sevenDaysAgo, $gte: fourteenDaysAgo },
        status: 'Active',
        role: { $in: ['member', 'user'] },
        emailNotifications: { $ne: false },
      }).select('_id name email points').lean();

      for (const user of inactive) {
        await createNotification({
          userId: user._id,
          type: 'system',
          title: 'We miss you! 👋',
          message: 'Your fitness journey is waiting. Come back and see your AI-personalized workout plan!',
          link: '/dashboard',
        });

        sendEmail({
          to: user.email,
          subject: `${user.name}, your fitness journey is waiting! 💪`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
              <h1 style="color:#00d4ff;">We miss you, ${user.name}!</h1>
              <p style="color:#ccc;font-size:16px;line-height:1.6;">
                You have <strong style="color:#ffd700;">${user.points} points</strong> waiting for you.<br>
                Your community, achievements, and AI trainer are ready when you are.
              </p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard"
                style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d00ff,#00d4ff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">
                Resume Your Journey
              </a>
            </div>
          `,
        }).catch(() => {});
      }

      if (inactive.length > 0) logger.info(`Re-engagement emails sent to ${inactive.length} users`);
    } catch (err) {
      logger.error('Re-engagement cron error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // ── 4. Notification Cleanup — Every day at midnight ─────────────
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const result = await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo }, read: true });
      if (result.deletedCount > 0) logger.info(`Cleaned ${result.deletedCount} old notifications`);
    } catch (err) {
      logger.error('Notification cleanup error:', err.message);
    }
  });

  // ── 5. Expire inactive memberships — Every day at 1 AM ──────────
  cron.schedule('0 1 * * *', async () => {
    try {
      const now = new Date();
      const updated = await User.updateMany(
        { membershipEndDate: { $lt: now }, membership: { $ne: 'None' } },
        { $set: { membership: 'None' } }
      );
      if (updated.modifiedCount > 0) logger.info(`Expired ${updated.modifiedCount} memberships`);
    } catch (err) {
      logger.error('Membership expiry cron error:', err.message);
    }
  });

  logger.info('⏰ Cron jobs initialized: streak-reminder, membership-expiry, re-engagement, cleanup, expire-memberships');
}

module.exports = { initCronJobs };
