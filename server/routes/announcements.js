const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { verifyToken, verifyGymAdmin } = require('../middleware/auth');

// GET /api/announcements - Get active announcements
router.get('/', async (req, res) => {
  try {
    const { gymId, role } = req.query;
    const now = new Date();

    const query = {
      isActive: true,
      publishAt: { $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (gymId) query.$or = [{ gymId }, { gymId: null }];
    else query.gymId = null; // Platform-wide only

    if (role) {
      query.$or = [
        { targetRoles: 'all' },
        { targetRoles: role },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('authorId', 'name role')
      .sort({ pinned: -1, publishAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/announcements - Create announcement
router.post('/', ...verifyGymAdmin, async (req, res) => {
  try {
    const { title, content, type, targetRoles, gymId, publishAt, expiresAt, pinned, ctaText, ctaLink } = req.body;

    const announcement = await Announcement.create({
      title, content, type, targetRoles: targetRoles || ['all'],
      gymId: gymId || req.user.gymId || null,
      authorId: req.user._id,
      publishAt: publishAt ? new Date(publishAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      pinned: pinned || false,
      ctaText, ctaLink,
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/announcements/:id/read - Mark as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/announcements/:id - Update announcement
router.put('/:id', ...verifyGymAdmin, async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/announcements/:id - Delete announcement
router.delete('/:id', ...verifyGymAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
