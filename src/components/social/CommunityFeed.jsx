import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const TYPE_FILTERS = [
  { key: '',            label: 'All' },
  { key: 'achievement', label: 'Achievements' },
  { key: 'progress',    label: 'Progress' },
  { key: 'motivation',  label: 'Motivation' },
  { key: 'question',    label: 'Questions' },
  { key: 'general',     label: 'General' },
];

const TYPE_COLORS = {
  achievement: 'var(--amber)',
  progress:    'var(--accent)',
  motivation:  'var(--orange)',
  question:    'var(--cyan-color)',
  general:     'var(--green)',
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
      ? <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), objectFit: 'cover', flexShrink: 0 }} />
      : <div style={{
          width: size, height: size, borderRadius: Math.round(size * 0.28),
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', fontWeight: 700, fontSize: Math.round(size * 0.36), flexShrink: 0,
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
      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(40px, 7vw, 64px) 0 clamp(24px, 4vw, 32px)', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>
          <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
            Community
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
            What's working for members this week
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
            Share a result, ask a question, or post something useful for other members.
          </p>

          {/* Compose button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCompose(true)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-2)',
              background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: 14, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
          >
            <Avatar name={user?.name} avatar={user?.profilePicture} size={28} />
            <span>What are you working on?</span>
          </motion.button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>
        {/* Type filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: 'var(--sp-4) 0', scrollbarWidth: 'none' }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                border: `1px solid ${filter === f.key ? 'var(--accent-border)' : 'var(--border-2)'}`,
                background: filter === f.key ? 'var(--accent-dim)' : 'transparent',
                color: filter === f.key ? 'var(--accent)' : 'var(--text-3)',
                fontSize: 12,
                fontWeight: filter === f.key ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
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
          <div className="empty-state">
            <p className="empty-state-title">Nothing here yet</p>
            <p className="empty-state-desc">Start the conversation — share a result, ask a training question, or post something useful.</p>
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
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
              >
                Load more posts
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
                  <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0, fontSize: 14 }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>Posting to community</p>
                </div>
              </div>

              <textarea
                ref={composeRef}
                autoFocus
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="A training result, a question, or something useful for other members…"
                className="field-input"
                style={{ minHeight: 120, resize: 'none', marginBottom: 0 }}
              />

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
                {TYPE_FILTERS.slice(1).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setPostType(t.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--r-pill)',
                      border: `1px solid ${postType === t.key ? 'var(--accent-border)' : 'var(--border-2)'}`,
                      background: postType === t.key ? 'var(--accent-dim)' : 'transparent',
                      color: postType === t.key ? 'var(--accent)' : 'var(--text-3)',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      fontWeight: postType === t.key ? 600 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCompose(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting || !newPost.trim()}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center', opacity: !newPost.trim() ? 0.4 : 1 }}
                >
                  {posting ? 'Posting…' : 'Post to community'}
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
                  padding: '7px 14px',
                  background: commentText?.trim() ? 'var(--accent)' : 'var(--surface-3)',
                  border: 'none', borderRadius: 20,
                  color: commentText?.trim() ? '#fff' : 'var(--text-3)',
                  cursor: 'pointer', fontSize: 13,
                  transition: 'background 0.15s, color 0.15s',
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

