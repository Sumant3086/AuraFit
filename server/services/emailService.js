const nodemailer = require('nodemailer');

// Gmail SMTP (free tier) - uses app password
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not account password)
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('[Email] Email credentials not configured. Skipping email send.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"AuraFit" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Send error:', error.message);
    return { success: false, error: error.message };
  }
};

const templates = {
  welcome: (name, gymName = 'AuraFit') => ({
    subject: `Welcome to ${gymName}! Your fitness journey starts now 🏋️`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9d00ff, #00d4ff); padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 800;">AURA FIT</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">AI-Powered Fitness Platform</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #9d00ff;">Welcome, ${name}! 🎉</h2>
          <p style="color: #ccc; line-height: 1.6;">You've just taken the first step toward your best self. Here's what awaits you:</p>
          <ul style="color: #ccc; line-height: 2;">
            <li>🤖 AI-Generated Workout Plans</li>
            <li>🥗 Personalized Nutrition Plans</li>
            <li>📊 Progress Tracking & Analytics</li>
            <li>🏆 Achievements, Streaks & Leaderboards</li>
            <li>👨‍💼 Trainer Booking System</li>
          </ul>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/onboarding" style="display: inline-block; background: linear-gradient(135deg, #9d00ff, #00d4ff); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px;">Complete Your Profile</a>
        </div>
        <div style="padding: 20px 40px; border-top: 1px solid #222; color: #666; font-size: 12px;">
          <p>You're receiving this because you signed up at AuraFit. <a href="#" style="color: #9d00ff;">Unsubscribe</a></p>
        </div>
      </div>
    `,
  }),

  achievementEarned: (name, achievement) => ({
    subject: `🏆 You earned the "${achievement.name}" badge!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9d00ff, #00d4ff); padding: 40px; text-align: center;">
          <div style="font-size: 64px;">${achievement.icon}</div>
          <h2 style="margin: 12px 0 0;">Achievement Unlocked!</h2>
        </div>
        <div style="padding: 40px; text-align: center;">
          <h3 style="color: #9d00ff; font-size: 24px;">${achievement.name}</h3>
          <p style="color: #ccc;">${achievement.description}</p>
          <p style="color: #ffd700; font-size: 18px;">+${achievement.points} points earned</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/achievements" style="display: inline-block; background: linear-gradient(135deg, #9d00ff, #00d4ff); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px;">View Your Achievements</a>
        </div>
      </div>
    `,
  }),

  bookingConfirmed: (memberName, trainerName, date, time) => ({
    subject: `Booking Confirmed: Session with ${trainerName} on ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9d00ff, #00d4ff); padding: 40px; text-align: center;">
          <h2 style="margin: 0;">Session Confirmed ✅</h2>
        </div>
        <div style="padding: 40px;">
          <h3 style="color: #9d00ff;">Hi ${memberName},</h3>
          <p style="color: #ccc;">Your training session has been confirmed:</p>
          <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0; color: #fff;"><strong>Trainer:</strong> ${trainerName}</p>
            <p style="margin: 8px 0; color: #fff;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0; color: #fff;"><strong>Time:</strong> ${time}</p>
          </div>
        </div>
      </div>
    `,
  }),

  streakMilestone: (name, days) => ({
    subject: `🔥 ${days}-Day Streak! You're on fire, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b35, #f7c59f); padding: 40px; text-align: center;">
          <div style="font-size: 64px;">🔥</div>
          <h2 style="margin: 12px 0 0; color: #0a0a0a;">${days}-Day Streak!</h2>
        </div>
        <div style="padding: 40px; text-align: center;">
          <h3 style="color: #ff6b35;">You're unstoppable, ${name}!</h3>
          <p style="color: #ccc;">You've checked in for ${days} days in a row. Keep going!</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff6b35, #f7c59f); color: #0a0a0a; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px;">View Dashboard</a>
        </div>
      </div>
    `,
  }),

  referralReward: (name, referredName, points) => ({
    subject: `🎁 You earned ${points} points! ${referredName} just joined using your referral`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #00c853, #b9f6ca); padding: 40px; text-align: center;">
          <div style="font-size: 64px;">🎁</div>
          <h2 style="margin: 12px 0 0; color: #0a0a0a;">Referral Bonus!</h2>
        </div>
        <div style="padding: 40px; text-align: center;">
          <h3 style="color: #00c853;">Great news, ${name}!</h3>
          <p style="color: #ccc;">${referredName} just joined AuraFit using your referral code.</p>
          <p style="color: #ffd700; font-size: 24px; font-weight: bold;">+${points} points added to your account</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
