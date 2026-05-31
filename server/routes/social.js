const express = require('express');
const router = express.Router();
const SocialPost = require('../models/SocialPost');
const { verifyToken } = require('../middleware/auth');

// Get feed (members-only + public)
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { visibility: { $in: ['public', 'members-only'] } };
    if (type) query.type = type;

    const posts = await SocialPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await SocialPost.countDocuments(query);

    const enriched = posts.map(p => ({
      ...p,
      likeCount: p.likes?.length || 0,
      commentCount: p.comments?.length || 0,
      isLiked: p.likes?.some(l => l.userId === String(req.user._id)),
    }));

    res.json({ success: true, data: enriched, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, type = 'general', images = [], tags = [], visibility = 'members-only' } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required.' });

    const post = await SocialPost.create({
      userId: String(req.user._id),
      userName: req.user.name,
      userAvatar: req.user.profilePicture || null,
      content: content.trim(),
      type,
      images,
      tags,
      visibility,
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle like
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const uid = String(req.user._id);
    const idx = post.likes.findIndex(l => l.userId === uid);
    let liked;

    if (idx > -1) {
      post.likes.splice(idx, 1);
      liked = false;
    } else {
      post.likes.push({ userId: uid, userName: req.user.name });
      liked = true;
    }

    await post.save();
    res.json({ success: true, liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add comment
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment text required.' });

    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = {
      userId: String(req.user._id),
      userName: req.user.name,
      userAvatar: req.user.profilePicture || null,
      text: text.trim(),
    };
    post.comments.push(comment);
    await post.save();

    res.status(201).json({ success: true, data: comment, commentCount: post.comments.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single post with comments
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete own post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const isOwner = String(post.userId) === String(req.user._id);
    const isAdmin = ['admin', 'super_admin', 'gym_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden.' });

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
