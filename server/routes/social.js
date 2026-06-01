const express = require('express');
const router = express.Router();
const SocialPost = require('../models/SocialPost');
const { verifyToken } = require('../middleware/auth');
const { emitToAll, emitToUser } = require('../socket/socketServer');
const { notifySocialLike, notifySocialComment } = require('../services/notificationService');

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

const VALID_POST_TYPES = ['achievement', 'progress', 'motivation', 'question', 'general'];
const VALID_VISIBILITIES = ['public', 'members-only', 'private'];
const MAX_CONTENT_LENGTH = 2000;
const MAX_TAGS = 10;

// Create post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, type = 'general', images = [], tags = [], visibility = 'members-only' } = req.body;

    // Server-side validation
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required.' });
    if (content.trim().length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ success: false, message: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters.` });
    }
    if (!VALID_POST_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid post type.' });
    }
    if (!VALID_VISIBILITIES.includes(visibility)) {
      return res.status(400).json({ success: false, message: 'Invalid visibility setting.' });
    }
    if (!Array.isArray(tags) || tags.length > MAX_TAGS) {
      return res.status(400).json({ success: false, message: `Maximum ${MAX_TAGS} tags allowed.` });
    }
    // Sanitize tags: lowercase, alphanumeric only, max 30 chars each
    const sanitizedTags = tags
      .filter(t => typeof t === 'string')
      .map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30))
      .filter(Boolean);

    const post = await SocialPost.create({
      userId: String(req.user._id),
      userName: req.user.name,
      userAvatar: req.user.profilePicture || null,
      content: content.trim(),
      type,
      images: (images || []).slice(0, 4), // max 4 images
      tags: sanitizedTags,
      visibility,
    });

    const enriched = { ...post.toObject(), likeCount: 0, commentCount: 0, isLiked: false };

    // Broadcast to all connected members in real-time
    emitToAll('community:new-post', enriched);

    res.status(201).json({ success: true, data: enriched });
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

    // Notify post owner about the like (but not if they liked their own post)
    if (liked && String(post.userId) !== String(req.user._id)) {
      notifySocialLike(post.userId, req.user.name, post.content).catch(() => {});
    }

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
    if (text.trim().length > 500) return res.status(400).json({ success: false, message: 'Comment cannot exceed 500 characters.' });

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

    // Notify post owner about the comment
    if (String(post.userId) !== String(req.user._id)) {
      notifySocialComment(post.userId, req.user.name, post.content).catch(() => {});
    }

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
