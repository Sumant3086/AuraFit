import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TYPE_LABELS = {
  checkin:       'checked in',
  achievement:   'earned an achievement',
  workout:       'logged a workout',
  community_post:'posted',
  level_up:      'levelled up',
  referral:      'referred a member',
  streak:        'hit a streak milestone',
  membership:    'upgraded membership',
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
        <p style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.03em' }}>Community</p>
        <div style={{
          padding: '20px 16px', textAlign: 'center',
          background: 'var(--surface-3)', borderRadius: 10,
          border: '1px solid var(--border-1)',
        }}>
          <p style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>
            No community activity yet
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            Post a training update or question to connect with other members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.03em' }}>
        Community
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
              background: post.isMe ? 'var(--accent-dim)' : 'transparent',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: post.isMe ? 'var(--accent-dim)' : 'var(--surface-3)',
              border: `1px solid ${post.isMe ? 'var(--accent-border)' : 'var(--border-1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: post.isMe ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 11, fontWeight: 700,
            }}>
              {post.user?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: 'var(--text-2)', fontSize: 13, margin: 0,
                lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: post.isMe ? 'var(--accent)' : 'var(--text-1)', fontWeight: 600 }}>
                  {post.isMe ? 'You' : post.user?.split(' ')[0]}
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
