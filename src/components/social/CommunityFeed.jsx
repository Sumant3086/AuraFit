import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const TYPE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'achievement', label: '🏅 Achievements' },
  { key: 'progress', label: '📊 Progress' },
  { key: 'motivation', label: '🔥 Motivation' },
  { key: 'question', label: '❓ Questions' },
  { key: 'general', label: '💬 General' },
];

const TYPE_COLORS = {
  achievement: '#ffd700',
  progress: '#00d4ff',
  motivation: '#ff6b35',
  question: '#9d00ff',
  general: '#00c853',
};

export default function CommunityFeed() {
  const { apiClient, user } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState('');
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showCompose, setShowCompose] = useState(false);
  const composeRef = useRef(null);

  // Use a ref to track the current page for load-more (avoids stale closure)
  const pageRef = useRef(1);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      const currentPage = reset ? 1 : pageRef.current;
      const res = await apiClient.get(`/social/feed?page=${currentPage}&limit=15${filter ? `&type=${filter}` : ''}`);
      const data = res.data.data || [];
      setPosts(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === 15);
      if (!reset) {
        pageRef.current += 1;
        setPage(pageRef.current);
      } else {
        pageRef.current = 1;
        setPage(1);
      }
    } catch {
      if (reset) setPosts([]);
    }
    setLoading(false);
  }, [apiClient, filter]);

  useEffect(() => {
    setLoading(true);
    fetchPosts(true);
  }, [fetchPosts]);

  // Real-time: receive new posts via WebSocket
  useEffect(() => {
    if (!socket) return;
    const handleNewPost = (post) => {
      // Don't add if it's the current user's post (they already see it)
      if (String(post.userId) === String(user?._id)) return;
      setPosts(prev => {
        if (prev.find(p => p._id === post._id)) return prev;
        return [{ ...post, isLiked: false }, ...prev];
      });
      toast(`${post.userName} posted in the community 💬`, { duration: 3000 });
    };
    socket.on('community:new-post', handleNewPost);
    return () => socket.off('community:new-post', handleNewPost);
  }, [socket, user?._id]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await apiClient.post('/social', { content: newPost.trim(), type: postType });
      const created = {
        ...res.data.data,
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
      };
      setPosts(prev => [created, ...prev]);
      setNewPost('');
      setShowCompose(false);
      toast.success('Posted to the community! 🎉');
    } catch {
      toast.error('Failed to post. Try again.');
    }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await apiClient.post(`/social/${postId}/like`);
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, isLiked: res.data.liked, likeCount: res.data.likeCount }
          : p
      ));
    } catch {}
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      const res = await apiClient.post(`/social/${postId}/comment`, { text: text.trim() });
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const comments = [...(p.comments || []), res.data.data];
        return { ...p, comments, commentCount: res.data.commentCount };
      }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch {
      toast.error('Failed to comment.');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiClient.delete(`/social/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const Avatar = ({ name, avatar, size = 36 }) => (
    avatar
      ? <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
      : <div style={{
          width: size, height: size, borderRadius: '50%',
          background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-1)', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
        }}>
          {name?.[0]?.toUpperCase()}
        </div>
  );

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 100%)', padding: '28px 20px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: 'var(--text-1)', fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>Community 🏋️</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 0 20px' }}>Share your wins, ask questions, motivate others.</p>

          {/* Compose button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCompose(true)}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: 14, border: '1px solid var(--border-2)',
              background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: 15, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <Avatar name={user?.name} avatar={user?.profilePicture} size={30} />
            <span>Share your fitness journey...</span>
          </motion.button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>
        {/* Type filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0', scrollbarWidth: 'none' }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: '1px solid var(--border-2)',
                background: filter === f.key ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#111',
                color: filter === f.key ? '#fff' : '#666', fontSize: 13, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 16, padding: 20, animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '40%', height: 12, background: 'var(--surface-3)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ width: '90%', height: 10, background: 'var(--surface-3)', borderRadius: 6, marginBottom: 6 }} />
                <div style={{ width: '70%', height: 10, background: 'var(--surface-3)', borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
            <h3 style={{ color: 'var(--text-1)', margin: '0 0 8px' }}>Be the first to post!</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Share a win, a tip, or say hello to the community.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence>
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                  commentText={commentText[post._id] || ''}
                  setCommentText={(v) => setCommentText(prev => ({ ...prev, [post._id]: v }))}
                  expanded={expandedComments[post._id]}
                  toggleComments={() => setExpandedComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                  timeAgo={timeAgo}
                  Avatar={Avatar}
                />
              ))}
            </AnimatePresence>

            {hasMore && (
              <button
                onClick={() => fetchPosts(false)}
                style={{
                  padding: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                  borderRadius: 12, color: 'var(--accent)', cursor: 'pointer', fontSize: 14, marginBottom: 16,
                }}
              >
                Load more...
              </button>
            )}
          </div>
        )}
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.88)', zIndex: 1000,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface-2)', borderRadius: '20px 20px 0 0', padding: 24,
                width: '100%', maxWidth: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={user?.name} avatar={user?.profilePicture} />
                <div>
                  <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 15 }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>Posting to community</p>
                </div>
              </div>

              <textarea
                ref={composeRef}
                autoFocus
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share a win, tip, or question..."
                style={{
                  width: '100%', minHeight: 120, background: 'var(--bg)', border: '1px solid var(--border-2)',
                  borderRadius: 12, padding: 14, color: 'var(--text-1)', fontSize: 15, resize: 'none',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                {TYPE_FILTERS.slice(1).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setPostType(t.key)}
                    style={{
                      padding: '5px 12px', borderRadius: 16,
                      border: `1px solid ${postType === t.key ? TYPE_COLORS[t.key] : '#222'}`,
                      background: postType === t.key ? `${TYPE_COLORS[t.key]}22` : 'transparent',
                      color: postType === t.key ? TYPE_COLORS[t.key] : '#555',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCompose(false)} style={{
                  flex: 1, padding: '12px', background: 'var(--surface-3)', border: '1px solid var(--border-2)',
                  borderRadius: 12, color: 'var(--text-3)', cursor: 'pointer', fontSize: 15,
                }}>
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting || !newPost.trim()}
                  style={{
                    flex: 2, padding: '12px', background: newPost.trim() ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
                    border: 'none', borderRadius: 12, color: newPost.trim() ? '#fff' : '#444',
                    cursor: newPost.trim() ? 'pointer' : 'default', fontSize: 15, fontWeight: 700,
                  }}
                >
                  {posting ? 'Posting...' : 'Post 🚀'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, currentUser, onLike, onDelete, onComment, commentText, setCommentText, expanded, toggleComments, timeAgo, Avatar }) {
  const isOwn = String(post.userId) === String(currentUser?._id);
  const typeColor = TYPE_COLORS[post.type] || '#666';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 16, overflow: 'hidden',
      }}
    >
      {/* Post header */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name={post.userName} avatar={post.userAvatar} size={38} />
            <div>
              <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>{post.userName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: typeColor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  {post.type}
                </span>
                <span style={{ color: '#444', fontSize: 11 }}>• {timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
          {isOwn && (
            <button onClick={() => onDelete(post._id)} style={{
              background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: 4,
            }}>✕</button>
          )}
        </div>

        {/* Content */}
        <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6, margin: '12px 0 0', wordBreak: 'break-word' }}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ color: 'var(--accent)', fontSize: 12 }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 16, borderTop: '1px solid var(--border-1)' }}>
        <button
          onClick={() => onLike(post._id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: post.isLiked ? '#ff1493' : '#555', fontSize: 14, transition: 'color 0.15s',
          }}
        >
          {post.isLiked ? '❤️' : '🤍'} {post.likeCount || 0}
        </button>
        <button
          onClick={toggleComments}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}
        >
          💬 {post.commentCount || 0}
        </button>
        <button
          onClick={() => {
            navigator.share?.({ title: 'AuraFit Community', text: post.content });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14, marginLeft: 'auto' }}
        >
          ↗
        </button>
      </div>

      {/* Comments section */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-1)' }}>
          {/* Existing comments */}
          {post.comments?.slice(-5).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'flex-start' }}>
              <Avatar name={c.userName} avatar={c.userAvatar} size={28} />
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '8px 12px' }}>
                <p style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, margin: '0 0 3px' }}>{c.userName}</p>
                <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0 }}>{c.text}</p>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Avatar name={currentUser?.name} avatar={currentUser?.profilePicture} size={28} />
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onComment(post._id)}
                placeholder="Write a comment..."
                style={{
                  flex: 1, background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: 20,
                  padding: '7px 14px', color: 'var(--text-1)', fontSize: 13, fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => onComment(post._id)}
                disabled={!commentText?.trim()}
                style={{
                  padding: '7px 14px', background: commentText?.trim() ? '#9d00ff' : '#1a1a1a',
                  border: 'none', borderRadius: 20, color: 'var(--text-1)', cursor: 'pointer', fontSize: 13,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

