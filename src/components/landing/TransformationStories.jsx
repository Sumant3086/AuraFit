import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORIES = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bengaluru',
    avatar: '👩',
    avatarColor: '#7c3aed',
    result: '−14 kg',
    resultLabel: 'in 4 months',
    metric: 'Body fat: 32% → 22%',
    rating: 5,
    quote: 'As a working professional, I needed a plan that actually fit my schedule. AuraFit\'s AI built a routine around my 6am slots and eating preferences. I didn\'t realize how much I\'d been under-eating protein. Lost 14kg and finally feel strong.',
    tag: 'Weight Loss',
    tagColor: '#10b981',
  },
  {
    name: 'Arjun Patel',
    role: 'Entrepreneur, Mumbai',
    avatar: '👨',
    avatarColor: '#0891b2',
    result: '+7 kg',
    resultLabel: 'lean muscle in 6 months',
    metric: 'Bench press: 60kg → 100kg',
    rating: 5,
    quote: 'I\'d been training for 2 years with zero structure. AuraFit\'s trainer booking feature connected me with Coach Karthik, and the AI nutrition plan revealed I was 40g short on protein daily. The difference has been night and day.',
    tag: 'Muscle Building',
    tagColor: '#9d00ff',
  },
  {
    name: 'Ananya Reddy',
    role: 'Marketing Manager, Hyderabad',
    avatar: '👩',
    avatarColor: '#db2777',
    result: '25%',
    resultLabel: 'body fat reduction in 8 months',
    metric: 'Went from sedentary to 5× weekly',
    rating: 5,
    quote: 'I tried every app before this. What kept me with AuraFit was the streak system — missing a day actually bothered me. The community posts and leaderboard made it feel like a team sport. The body tracker showing slow-but-real progress kept me going.',
    tag: 'Complete Transformation',
    tagColor: '#f59e0b',
  },
];

function Stars({ n }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
      ))}
    </div>
  );
}

export default function TransformationStories() {
  const [active, setActive] = useState(0);
  const story = STORIES[active];

  return (
    <section style={{
      padding: 'clamp(80px,10vw,120px) clamp(20px,4vw,60px)',
      background: 'var(--surface-raised)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}
        >
          <h2 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 clamp(10px,1.5vw,16px)',
          }}>
            Real people.{' '}
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Real results.
            </span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15px,1.6vw,18px)', maxWidth: 440, margin: '0 auto' }}>
            Thousands of members have transformed their lives. Here are three of their stories.
          </p>
        </motion.div>

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(28px,4vw,48px)',
              marginBottom: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Decorative quote mark */}
            <div style={{
              position: 'absolute', top: -16, left: 24,
              fontSize: 120, color: 'rgba(157,0,255,0.05)',
              fontWeight: 900, lineHeight: 1, userSelect: 'none',
              pointerEvents: 'none',
            }}>
              "
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 'clamp(28px,4vw,48px)',
              alignItems: 'start',
            }}
              className="story-grid"
            >
              {/* Result highlight */}
              <div style={{
                background: 'linear-gradient(160deg, var(--surface-raised), var(--surface-high))',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(20px,3vw,28px)',
                textAlign: 'center', minWidth: 160,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                  background: `${story.avatarColor}22`, border: `2px solid ${story.avatarColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                }}>
                  {story.avatar}
                </div>
                <div style={{
                  color: 'var(--text-primary)', fontSize: 'clamp(28px,3vw,36px)',
                  fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
                  background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {story.result}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '4px 0 12px', lineHeight: 1.4 }}>
                  {story.resultLabel}
                </div>
                <div style={{
                  background: 'var(--surface-overlay)', borderRadius: 8,
                  padding: '7px 10px',
                  color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                  borderTop: `2px solid ${story.tagColor}`,
                }}>
                  {story.metric}
                </div>
              </div>

              {/* Quote */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(12px,2vw,16px)' }}>
                  <span style={{
                    background: `${story.tagColor}18`,
                    border: `1px solid ${story.tagColor}44`,
                    borderRadius: 999, padding: '4px 12px',
                    color: story.tagColor, fontSize: 11, fontWeight: 700,
                  }}>
                    {story.tag}
                  </span>
                  <Stars n={story.rating} />
                </div>

                <blockquote style={{
                  color: 'var(--text-primary)', fontSize: 'clamp(15px,1.7vw,18px)',
                  lineHeight: 1.7, fontStyle: 'italic',
                  margin: '0 0 clamp(16px,2.5vw,24px)',
                  fontWeight: 400,
                }}>
                  "{story.quote}"
                </blockquote>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, margin: 0 }}>{story.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '2px 0 0' }}>{story.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Switcher */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          {STORIES.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderRadius: 'var(--radius-pill)',
                border: `1px solid ${i === active ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                background: i === active ? 'var(--brand-purple-dim)' : 'var(--surface-overlay)',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${s.avatarColor}22`, border: `1px solid ${s.avatarColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>
                {s.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: i === active ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, margin: 0 }}>
                  {s.name.split(' ')[0]}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>{s.result}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .story-grid { grid-template-columns: auto 1fr !important; }
        @media (max-width: 600px) {
          .story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
