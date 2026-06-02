import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICONS = {
  checkin: '📍',
  achievement: '🏅',
  workout: '💪',
  community_post: '💬',
  level_up: '⬆️',
  referral: '🎁',
  streak: '🔥',
  membership: '💎',
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const { apiClient, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/social/feed?limit=8');
      const data = (res.data.data || []).map(p => ({
        id: p._id,
        type: p.type === 'achievement' ? 'achievement' : 'community_post',
        user: p.userName,
        message: p.content.slice(0, 65) + (p.content.length > 65 ? '…' : ''),
        time: p.createdAt,
        isMe: String(p.userId) === String(user?._id),
      }));
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient, user?._id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Community activity</p>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-high)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '65%', height: 10, background: 'var(--surface-high)', borderRadius: 4, marginBottom: 5, animation: 'pulse 1.5s infinite' }} />
              <div style={{ width: '35%', height: 8, background: 'var(--surface-high)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Community activity</p>
        <div style={{
          padding: '24px 16px', textAlign: 'center',
          background: 'var(--surface-overlay)', borderRadius: 12,
          border: '1px dashed var(--border-default)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 4px' }}>No activity yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
            Post in the community to appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>
        Community activity
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '9px 10px', borderRadius: 10,
              background: post.isMe ? 'var(--brand-purple-dim)' : 'transparent',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: post.isMe ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : 'var(--surface-overlay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, border: '1px solid var(--border-subtle)',
            }}>
              {TYPE_ICONS[post.type] || '💬'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: 'var(--text-secondary)', fontSize: 13, margin: 0,
                lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: post.isMe ? 'var(--brand-purple)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {post.isMe ? 'You' : post.user}
                </span>
                {' '}{post.message}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '2px 0 0' }}>{timeAgo(post.time)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
