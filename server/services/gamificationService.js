const User = require('../models/User');
const { Achievement, UserAchievement } = require('../models/Achievement');
const { sendEmail, templates } = require('./emailService');

// Achievement catalog (seeded on startup)
const ACHIEVEMENTS = [
  { key: 'first_checkin', name: 'First Step', description: 'Complete your first gym check-in', icon: '👣', category: 'attendance', points: 50, tier: 'bronze', criteria: { type: 'attendance_count', value: 1 } },
  { key: 'week_warrior', name: 'Week Warrior', description: 'Check in 7 days in a row', icon: '⚔️', category: 'streak', points: 150, tier: 'silver', criteria: { type: 'streak_days', value: 7 } },
  { key: 'month_master', name: 'Month Master', description: 'Maintain a 30-day streak', icon: '🗓️', category: 'streak', points: 500, tier: 'gold', criteria: { type: 'streak_days', value: 30 } },
  { key: 'century_club', name: 'Century Club', description: 'Check in 100 times total', icon: '💯', category: 'attendance', points: 300, tier: 'gold', criteria: { type: 'attendance_count', value: 100 } },
  { key: 'ai_explorer', name: 'AI Explorer', description: 'Generate your first AI workout plan', icon: '🤖', category: 'workout', points: 75, tier: 'bronze', criteria: { type: 'workout_count', value: 1 } },
  { key: 'nutrition_ninja', name: 'Nutrition Ninja', description: 'Create your first nutrition plan', icon: '🥗', category: 'nutrition', points: 75, tier: 'bronze', criteria: { type: 'nutrition_count', value: 1 } },
  { key: 'social_butterfly', name: 'Social Butterfly', description: 'Refer 3 friends to AuraFit', icon: '🦋', category: 'referral', points: 200, tier: 'silver', criteria: { type: 'referral_count', value: 3 } },
  { key: 'elite_referrer', name: 'Elite Referrer', description: 'Refer 10 friends to AuraFit', icon: '👑', category: 'referral', points: 500, tier: 'gold', criteria: { type: 'referral_count', value: 10 } },
  { key: 'point_pioneer', name: 'Point Pioneer', description: 'Earn 500 total points', icon: '⭐', category: 'milestone', points: 100, tier: 'silver', criteria: { type: 'points_total', value: 500 } },
  { key: 'legend', name: 'AuraFit Legend', description: 'Earn 2000 total points', icon: '🏆', category: 'milestone', points: 500, tier: 'platinum', criteria: { type: 'points_total', value: 2000 } },
  { key: 'fire_starter', name: 'Fire Starter', description: 'Start your fitness journey (complete onboarding)', icon: '🔥', category: 'milestone', points: 100, tier: 'bronze', criteria: { type: 'onboarding', value: 1 } },
  { key: 'ten_checkins', name: 'Regular', description: '10 gym check-ins completed', icon: '🎯', category: 'attendance', points: 100, tier: 'bronze', criteria: { type: 'attendance_count', value: 10 } },
  { key: 'fifty_checkins', name: 'Dedicated', description: '50 gym check-ins completed', icon: '💪', category: 'attendance', points: 200, tier: 'silver', criteria: { type: 'attendance_count', value: 50 } },
];

// Seed achievements on startup
const seedAchievements = async () => {
  try {
    for (const ach of ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate({ key: ach.key }, ach, { upsert: true, new: true });
    }
    console.log('[Gamification] Achievement catalog seeded');
  } catch (error) {
    console.error('[Gamification] Seed error:', error.message);
  }
};

// Award points to user
const awardPoints = async (userId, points, reason) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true }
    );
    console.log(`[Gamification] +${points} points to ${user.email} (${reason})`);
    return user;
  } catch (error) {
    console.error('[Gamification] Award points error:', error.message);
  }
};

// Check and unlock achievements
const checkAchievements = async (userId, context = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const allAchievements = await Achievement.find({ isActive: true });
    const unlocked = [];

    for (const ach of allAchievements) {
      // Skip if already earned
      const alreadyEarned = await UserAchievement.findOne({ userId, achievementKey: ach.key });
      if (alreadyEarned) continue;

      let shouldUnlock = false;
      const { type, value } = ach.criteria || {};

      switch (type) {
        case 'attendance_count':
          shouldUnlock = (context.attendanceCount || 0) >= value;
          break;
        case 'streak_days':
          shouldUnlock = user.currentStreak >= value;
          break;
        case 'workout_count':
          shouldUnlock = (context.workoutCount || 0) >= value;
          break;
        case 'nutrition_count':
          shouldUnlock = (context.nutritionCount || 0) >= value;
          break;
        case 'referral_count':
          shouldUnlock = user.referralCount >= value;
          break;
        case 'points_total':
          shouldUnlock = user.points >= value;
          break;
        case 'onboarding':
          shouldUnlock = user.onboardingCompleted;
          break;
      }

      if (shouldUnlock) {
        await UserAchievement.create({ userId, achievementKey: ach.key });
        await User.findByIdAndUpdate(userId, { $addToSet: { badges: ach.key } });
        await awardPoints(userId, ach.points, `Achievement: ${ach.name}`);
        unlocked.push(ach);

        // Email notification
        if (user.emailNotifications) {
          sendEmail({
            to: user.email,
            ...templates.achievementEarned(user.name, ach),
          }).catch(() => {});
        }
      }
    }

    return unlocked;
  } catch (error) {
    console.error('[Gamification] Check achievements error:', error.message);
    return [];
  }
};

// Update streak after check-in
const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = now.toDateString();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : null;
    const yesterday = new Date(now - 86400000).toDateString();

    if (lastCheckIn === today) return user; // Already checked in today

    let newStreak = user.currentStreak;
    if (lastCheckIn === yesterday) {
      newStreak += 1;
    } else if (lastCheckIn !== today) {
      newStreak = 1; // Reset streak
    }

    const longestStreak = Math.max(newStreak, user.longestStreak || 0);
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        currentStreak: newStreak,
        longestStreak,
        lastCheckIn: now,
        $inc: { points: 10 }, // 10 points per check-in
      },
      { new: true }
    );

    // Email for streak milestones
    if ([7, 14, 30, 60, 100].includes(newStreak) && updated.emailNotifications) {
      sendEmail({
        to: updated.email,
        ...templates.streakMilestone(updated.name, newStreak),
      }).catch(() => {});
    }

    return updated;
  } catch (error) {
    console.error('[Gamification] Update streak error:', error.message);
  }
};

// Process referral reward
const processReferral = async (referralCode, newUserId) => {
  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return;

    await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
    await awardPoints(referrer._id, 100, 'Referral bonus');

    const newUser = await User.findById(newUserId);
    if (referrer.emailNotifications) {
      sendEmail({
        to: referrer.email,
        ...templates.referralReward(referrer.name, newUser?.name || 'A friend', 100),
      }).catch(() => {});
    }

    // Check referral achievements
    const updatedReferrer = await User.findById(referrer._id);
    await checkAchievements(referrer._id, { referralCount: updatedReferrer.referralCount });

    return referrer;
  } catch (error) {
    console.error('[Gamification] Process referral error:', error.message);
  }
};

// Get leaderboard
const getLeaderboard = async (gymId, period = 'all', limit = 20) => {
  try {
    const query = { role: { $in: ['member', 'user', 'trainer'] } };
    if (gymId) query.gymId = gymId;

    const users = await User.find(query)
      .select('name profilePicture points currentStreak badges level')
      .sort({ points: -1 })
      .limit(limit)
      .lean();

    return users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      avatar: u.profilePicture || '',
      points: u.points,
      streak: u.currentStreak,
      badges: u.badges?.length || 0,
      level: Math.floor(u.points / 100) + 1,
    }));
  } catch (error) {
    console.error('[Gamification] Leaderboard error:', error.message);
    return [];
  }
};

module.exports = { seedAchievements, awardPoints, checkAchievements, updateStreak, processReferral, getLeaderboard };
