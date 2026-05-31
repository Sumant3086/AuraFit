const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const ProgressTracker = require('../models/ProgressTracker');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SYSTEM_CONTEXT = `You are AuraBot, an expert AI fitness assistant for AuraFit gym platform.
You are knowledgeable about:
- Workout programming, exercise form, and progressive overload
- Nutrition, macros, meal timing, and diet plans
- Recovery, sleep, and injury prevention
- Gym equipment and bodyweight alternatives
- Motivation and habit building
- Membership plans and gym services

Respond in a friendly, energetic, concise tone. Use bullet points for lists. Keep responses under 200 words unless the user explicitly asks for detail. Never give medical advice — recommend consulting a doctor for health concerns.`;

router.post('/message', verifyToken, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required.' });

    // Build user context string
    const user = req.user;
    let userCtx = `User: ${user.name}, Membership: ${user.membership || 'None'}, Points: ${user.points || 0}, Streak: ${user.currentStreak || 0} days.`;

    // Fetch latest progress if available
    try {
      const latest = await ProgressTracker.findOne({ userId: user._id }).sort({ date: -1 }).lean();
      if (latest) {
        userCtx += ` Latest weight: ${latest.weight}kg, body fat: ${latest.bodyFat || 'N/A'}%.`;
      }
    } catch {}

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation for Gemini
    const fullPrompt = `${SYSTEM_CONTEXT}\n\n${userCtx}\n\nConversation:\n${
      history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'AuraBot'}: ${m.content}`).join('\n')
    }\nUser: ${message}\nAuraBot:`;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text().trim();

    res.json({ success: true, reply });
  } catch (err) {
    // Fallback if Gemini fails
    const fallbacks = [
      "Great question! I recommend focusing on compound movements like squats, deadlifts, and bench press for maximum muscle growth. 💪",
      "For fat loss, aim for a 300-500 calorie deficit while maintaining protein at 1.6-2.2g/kg of body weight.",
      "Recovery is just as important as training! Aim for 7-9 hours of sleep and stay hydrated with at least 3L of water daily.",
      "Progressive overload is key — try to add 2.5-5kg every 2 weeks on your main lifts.",
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ success: true, reply });
  }
});

// Get weekly AI fitness insight for user
router.get('/weekly-insight', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const streak = user.currentStreak || 0;
    const points = user.points || 0;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `${SYSTEM_CONTEXT}\n\nGenerate a personalized weekly fitness insight for: ${user.name}, streak: ${streak} days, level ${Math.floor(points/100)+1}. Include: 1 workout tip, 1 nutrition tip, 1 motivational insight. Keep it under 120 words total. Format as JSON: {"workoutTip": "...", "nutritionTip": "...", "motivation": "...", "weeklyGoal": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const insight = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      workoutTip: `With your ${streak}-day streak, try adding a new compound exercise this week!`,
      nutritionTip: "Pre-workout: eat complex carbs 1-2 hours before training for sustained energy.",
      motivation: "Every rep counts. Consistency beats perfection — you're building something great.",
      weeklyGoal: "Hit 4 workouts this week and log your meals daily.",
    };

    res.json({ success: true, data: insight });
  } catch (err) {
    res.json({ success: true, data: {
      workoutTip: "Focus on mind-muscle connection this week — slow down your reps.",
      nutritionTip: "Aim to eat protein within 30 minutes of finishing your workout.",
      motivation: "Progress is progress, no matter how small. Keep showing up!",
      weeklyGoal: "Consistency is your superpower. 3+ workouts this week.",
    }});
  }
});

module.exports = router;
