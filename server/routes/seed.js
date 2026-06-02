// Demo data seeder — only available in development OR with admin token
// Seeds realistic data for investor demos and onboarding showcases
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SocialPost = require('../models/SocialPost');
const Attendance = require('../models/Attendance');
const TrainerBooking = require('../models/TrainerBooking');
const Notification = require('../models/Notification');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

const DEMO_USERS = [
  { name: 'Priya Sharma', email: 'priya@demo.aurafit.com', role: 'member', membership: 'Premium', points: 2840, currentStreak: 14, badges: ['🔥', '💪', '🏅'], onboardingCompleted: true, fitnessGoal: 'weight-loss', gender: 'female', bio: 'Yoga enthusiast & marathon runner' },
  { name: 'Rahul Mehta', email: 'rahul@demo.aurafit.com', role: 'member', membership: 'Pro', points: 1520, currentStreak: 7, badges: ['💪', '🏅'], onboardingCompleted: true, fitnessGoal: 'muscle-gain', gender: 'male', bio: 'Powerlifting enthusiast, 3-year gym veteran' },
  { name: 'Ananya Kumar', email: 'ananya@demo.aurafit.com', role: 'member', membership: 'Basic', points: 680, currentStreak: 3, onboardingCompleted: true, fitnessGoal: 'general', gender: 'female' },
  { name: 'Vikram Joshi', email: 'vikram@demo.aurafit.com', role: 'member', membership: 'Premium', points: 3200, currentStreak: 21, badges: ['🔥', '💪', '🏆', '🏅'], onboardingCompleted: true, fitnessGoal: 'endurance', gender: 'male', bio: 'Triathlete. HIIT fanatic. Always in the zone.' },
  { name: 'Meera Patel', email: 'meera@demo.aurafit.com', role: 'member', membership: 'Pro', points: 940, currentStreak: 5, onboardingCompleted: true, fitnessGoal: 'flexibility', gender: 'female', bio: 'Certified yoga instructor and wellness coach' },
  { name: 'Arjun Desai', email: 'arjun@demo.aurafit.com', role: 'member', membership: 'None', points: 120, currentStreak: 1, onboardingCompleted: true, fitnessGoal: 'weight-loss', gender: 'male' },
  { name: 'Sneha Iyer', email: 'sneha@demo.aurafit.com', role: 'member', membership: 'Basic', points: 450, currentStreak: 2, onboardingCompleted: true, fitnessGoal: 'general', gender: 'female' },
  { name: 'Karthik Rao', email: 'karthik@demo.aurafit.com', role: 'trainer', membership: 'None', points: 1800, currentStreak: 30, onboardingCompleted: true, specialization: 'Strength & Conditioning', certifications: ['ACE', 'NSCA-CSCS'], rating: 4.8, totalRatings: 24, bio: 'Certified strength coach with 8 years experience. Specializes in Olympic lifting and powerlifting programs.' },
  { name: 'Pooja Nair', email: 'pooja@demo.aurafit.com', role: 'trainer', membership: 'None', points: 1200, currentStreak: 15, onboardingCompleted: true, specialization: 'Yoga & Mindfulness', certifications: ['RYT-500', 'ISSA'], rating: 4.9, totalRatings: 38, bio: '500-hour certified yoga teacher. Specializes in Vinyasa flow, Yin yoga, and stress-relief programs.' },
];

const DEMO_POSTS = [
  { content: 'Just hit a new PR on deadlifts — 140kg! 💪 The AI workout plan has been incredible. Week 8 and I\'ve never been stronger!', type: 'achievement', tags: ['deadlift', 'PR', 'strength'] },
  { content: 'Day 21 of my yoga journey here at AuraFit. The transformation has been unreal — both physically and mentally. If you\'re on the fence about booking Pooja, just DO IT. 🧘‍♀️', type: 'motivation', tags: ['yoga', 'transformation', 'wellness'] },
  { content: 'Anyone else using the AI Nutrition Calculator? It recommended a meal plan that actually fits my budget and taste. Down 4kg in 5 weeks!', type: 'progress', tags: ['nutrition', 'weightloss', 'results'] },
  { content: 'Streak hits 14 days today! 🔥 Remember — motivation gets you started, consistency keeps you going. See you all in the gym tomorrow!', type: 'motivation', tags: ['streak', 'consistency', 'motivation'] },
  { content: 'Question for the community: best pre-workout snack for a 6am session? I\'ve been going with a banana and black coffee but wondering if there\'s better?', type: 'question', tags: ['nutrition', 'preworkout', 'morning'] },
  { content: 'Completed the "30 Check-Ins" achievement! 🏅 Never thought I\'d be a "gym person" but here we are. This app makes it addictive in the best way.', type: 'achievement', tags: ['achievement', 'milestone', 'consistent'] },
  { content: 'Transformation post! Left: Day 1 (nervous, confused, unfit). Right: 90 days later (still learning, but STRONG). The journey is everything. 🙌', type: 'progress', tags: ['transformation', '90days', 'progress'] },
];

router.post('/', verifyToken, requireRole('admin', 'super_admin'), async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const { force = false } = req.body;

  if (isProd && !force) {
    return res.status(403).json({
      success: false,
      message: 'Seeding is disabled in production. Pass force: true to override (CAUTION: will add test data).',
    });
  }

  try {
    const results = { users: 0, posts: 0, attendance: 0, notifications: 0 };
    const demoPass = process.env.SEED_DEMO_PASSWORD || 'AuraFit_Demo_2024';
    const password = await bcrypt.hash(demoPass, 10);
    const createdUsers = [];

    // Create demo users (skip if email already exists)
    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const referralCode = userData.name.split(' ')[0].toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
        const user = await User.create({
          ...userData, password,
          status: 'Active',
          referralCode,
          membershipStartDate: new Date(),
          membershipEndDate: new Date(Date.now() + 60 * 86400000),
        });
        createdUsers.push(user);
        results.users++;
      } else {
        createdUsers.push(exists);
      }
    }

    const members = createdUsers.filter(u => u.role === 'member');

    // Create social posts
    for (let i = 0; i < DEMO_POSTS.length; i++) {
      const author = members[i % members.length];
      const postData = DEMO_POSTS[i];
      const exists = await SocialPost.findOne({ userId: String(author._id), content: postData.content });
      if (!exists) {
        const post = await SocialPost.create({
          userId: String(author._id),
          userName: author.name,
          ...postData,
          visibility: 'members-only',
          createdAt: new Date(Date.now() - (DEMO_POSTS.length - i) * 3600000 * 8),
          likes: members.slice(0, 3).map(m => ({ userId: String(m._id), userName: m.name })),
        });
        results.posts++;
      }
    }

    // Create attendance records for members (last 21 days)
    for (const member of members.slice(0, 5)) {
      const streakDays = member.currentStreak || 3;
      for (let d = 0; d < Math.min(streakDays, 21); d++) {
        const date = new Date(Date.now() - d * 86400000);
        const dateStr = date.toISOString().split('T')[0];
        const exists = await Attendance.findOne({ userId: member._id, date: dateStr });
        if (!exists) {
          await Attendance.create({
            userId: member._id,
            userName: member.name,
            date: dateStr,
            checkInTime: new Date(date.setHours(7, Math.floor(Math.random() * 60), 0, 0)),
            checkInMethod: 'app',
            pointsEarned: 10,
            streak: streakDays - d,
          });
          results.attendance++;
        }
      }
    }

    // Seed notifications for the requesting admin
    const welcomeNotifs = [
      { type: 'achievement', title: '🏅 Demo Data Seeded!', message: `Created ${results.users} users, ${results.posts} posts, ${results.attendance} check-ins.`, link: '/admin/dashboard' },
      { type: 'system', title: '🚀 Platform Ready for Demo', message: 'Realistic data has been seeded. Share demo credentials with investors!', link: '/admin/dashboard' },
    ];

    for (const n of welcomeNotifs) {
      await Notification.create({ userId: req.user._id, ...n });
      results.notifications++;
    }

    logger.info(`Demo seed completed by ${req.user.email}: ${JSON.stringify(results)}`);

    res.json({
      success: true,
      message: 'Demo data seeded successfully!',
      results,
      demoCredentials: DEMO_USERS.map(u => ({ name: u.name, email: u.email, password: demoPass, role: u.role })),
    });
  } catch (err) {
    logger.error('Seed error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/seed/status — Check if demo data exists
router.get('/status', verifyToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const demoUserCount = await User.countDocuments({ email: /demo\.aurafit\.com$/ });
    const totalUsers = await User.countDocuments();
    const totalPosts = await SocialPost.countDocuments();
    const totalAttendance = await Attendance.countDocuments();

    res.json({
      success: true,
      data: {
        hasDemoData: demoUserCount > 0,
        demoUsers: demoUserCount,
        totalUsers,
        totalPosts,
        totalAttendance,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
