const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const User = require('../models/User');
const { verifyToken, verifyAdmin, verifyGymAdmin } = require('../middleware/auth');

// GET /api/gyms - List all active gyms (public)
router.get('/', async (req, res) => {
  try {
    const { city, search, page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];

    const gyms = await Gym.find(query)
      .select('name slug description tagline logo coverImage address amenities rating totalMembers')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Gym.countDocuments(query);
    res.json({ success: true, data: gyms, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/gyms/:slug - Public gym landing page data
router.get('/:slug', async (req, res) => {
  try {
    const gym = await Gym.findOne({ slug: req.params.slug, status: 'active' })
      .populate('adminId', 'name email')
      .lean();
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });

    // Get trainer count
    const trainers = await User.find({ gymId: gym._id, role: 'trainer' })
      .select('name specialization profilePicture rating certifications')
      .lean();

    res.json({ success: true, data: { ...gym, trainers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/gyms - Create gym (super admin only)
router.post('/', ...verifyAdmin, async (req, res) => {
  try {
    const { name, slug, email, description, tagline, address, amenities, socialLinks, workingHours } = req.body;

    const existing = await Gym.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Slug already taken' });

    const gym = await Gym.create({
      name, slug, email, description, tagline, address, amenities, socialLinks, workingHours,
      adminId: req.user._id,
    });

    // Assign current user as gym_admin
    await User.findByIdAndUpdate(req.user._id, { gymId: gym._id, role: 'gym_admin' });

    res.status(201).json({ success: true, data: gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/gyms/:id - Update gym info
router.put('/:id', ...verifyGymAdmin, async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });

    // Gym admin can only update their own gym
    if (req.user.role === 'gym_admin' && gym.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowedFields = ['name', 'description', 'tagline', 'logo', 'coverImage', 'images', 'phone',
      'website', 'address', 'mapLink', 'amenities', 'socialLinks', 'testimonials', 'workingHours',
      'metaTitle', 'metaDescription', 'keywords', 'features'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await Gym.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/gyms/:id/testimonial - Add testimonial
router.post('/:id/testimonial', verifyToken, async (req, res) => {
  try {
    const { text, rating } = req.body;
    const gym = await Gym.findByIdAndUpdate(
      req.params.id,
      { $push: { testimonials: { memberName: req.user.name, text, rating } } },
      { new: true }
    );
    res.json({ success: true, data: gym.testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/gyms/:id/stats - Gym stats for admin
router.get('/:id/stats', ...verifyGymAdmin, async (req, res) => {
  try {
    const [totalMembers, totalTrainers] = await Promise.all([
      User.countDocuments({ gymId: req.params.id, role: { $in: ['member', 'user'] } }),
      User.countDocuments({ gymId: req.params.id, role: 'trainer' }),
    ]);

    res.json({ success: true, data: { totalMembers, totalTrainers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
