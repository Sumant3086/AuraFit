const express = require('express');
const router = express.Router();
const UserSession = require('../models/UserSession');
const { verifyToken } = require('../middleware/auth');
const { parseUserAgent } = require('../middleware/audit');

// GET /api/sessions — Get all active sessions for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const sessions = await UserSession.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ lastActive: -1 }).lean();

    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/sessions/:id — Revoke a specific session
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const session = await UserSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    await UserSession.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Session revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/sessions — Revoke all sessions except current
router.delete('/', verifyToken, async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');

    // Find the current session to exclude it
    const currentSession = await UserSession.findOne({
      userId: req.user._id,
      isActive: true,
    }).sort({ lastActive: -1 }).lean();

    await UserSession.updateMany(
      {
        userId: req.user._id,
        isActive: true,
        ...(currentSession ? { _id: { $ne: currentSession._id } } : {}),
      },
      { isActive: false }
    );

    res.json({ success: true, message: 'All other sessions revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Middleware to record session on login (called from auth route)
async function recordSession(userId, refreshToken, req) {
  try {
    const ua = req.headers['user-agent'] || '';
    const { browser, os, deviceType } = parseUserAgent(ua);

    await UserSession.create({
      userId,
      refreshToken,
      browser,
      os,
      deviceType,
      deviceName: `${browser} on ${os}`,
      ip: req.ip || req.connection?.remoteAddress || 'Unknown',
      lastActive: new Date(),
    });
  } catch (err) {
    console.error('Session record error:', err.message);
  }
}

module.exports = router;
module.exports.recordSession = recordSession;
