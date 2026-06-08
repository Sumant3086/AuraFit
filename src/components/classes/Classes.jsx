import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LuClock, LuUser, LuUsers, LuCalendar, LuArrowRight } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Footer from '../footer/Footer';
import classesByDay from './classesData';

const ease = [0.16, 1, 0.3, 1];

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const CATEGORIES = ['All', 'Yoga', 'HIIT', 'Boxing', 'Strength', 'Cycling', 'Pilates'];

const LEVEL_STYLE = {
  Beginner:     { color: 'var(--green)',  bg: 'var(--green-dim)' },
  Intermediate: { color: 'var(--accent)', bg: 'var(--accent-dim)' },
  Advanced:     { color: 'var(--amber)',  bg: 'var(--amber-dim)' },
};

function classMatchesCategory(cls, category) {
  if (category === 'All') return true;
  const name = (cls.name || '').toLowerCase();
  const desc = (cls.description || '').toLowerCase();
  const cat  = category.toLowerCase();
  return name.includes(cat) || desc.includes(cat);
}

export default function Classes() {
  const navigate  = useNavigate();
  const [day, setDay]           = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    setDay(names[new Date().getDay()]);
  }, []);

  const allClasses = classesByDay[day] || [];

  const filtered = useMemo(
    () => allClasses.filter(c => classMatchesCategory(c, category)),
    [allClasses, category]
  );

  const handleReserve = (cls) => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('redirectAfterLogin', '/classes');
      localStorage.setItem('pendingReservation', JSON.stringify(cls));
      toast.error('Sign in to reserve a spot.');
      navigate('/login');
    } else {
      toast.success(`Spot reserved — ${cls.name}`);
    }
  };

  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px, 9vw, 88px) 0 clamp(36px, 5vw, 52px)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Schedule
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 12px', lineHeight: 1.1 }}>
              The week's classes
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 440, margin: '0 0 28px', lineHeight: 1.65 }}>
              Instructor-led sessions every day of the week — strength, conditioning, yoga, boxing, and cycling. Book your spot from your phone. Show up ready to work.
            </p>
            {/* Platform stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { value: '27+', label: 'classes per week' },
                { value: '6',   label: 'specialist trainers' },
                { value: '7',   label: 'days per week' },
              ].map(s => (
                <div key={s.label}>
                  <span style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '-0.02em' }}>{s.value}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 5 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--sp-8) 0 var(--sp-20)' }}>

        {/* ── Category filter ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.1 }}
          style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-6)', scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                border: `1px solid ${category === cat ? 'var(--accent-border)' : 'var(--border-2)'}`,
                background: category === cat ? 'var(--accent-dim)' : 'transparent',
                color: category === cat ? 'var(--accent)' : 'var(--text-3)',
                fontSize: 12,
                fontWeight: category === cat ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ── Day selector ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.15 }}
          style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 'var(--sp-5)', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border-1)', scrollbarWidth: 'none' }}
        >
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setDay(d)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--r-pill)',
                border: 'none',
                background: day === d ? 'var(--text-1)' : 'transparent',
                color: day === d ? 'var(--bg)' : d === todayName ? 'var(--text-2)' : 'var(--text-3)',
                fontSize: 13,
                fontWeight: day === d ? 600 : d === todayName ? 500 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease, color 0.15s ease',
                position: 'relative',
              }}
            >
              {d === todayName && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 4, height: 4, borderRadius: '50%', background: 'var(--green)', display: day === d ? 'none' : 'block' }} />
              )}
              {d.slice(0, 3)}
            </button>
          ))}
        </motion.div>

        {/* ── Class result count ───────────────────────────── */}
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>
            <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{filtered.length}</span> {filtered.length === 1 ? 'class' : 'classes'} on {day}
            {category !== 'All' && <> in <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{category}</span></>}
          </p>
        </div>

        {/* ── Classes grid ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${day}-${category}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease }}
          >
            {filtered.length === 0 ? (
              <div className="empty-state">
                <LuCalendar size={40} className="empty-state-icon" />
                <p className="empty-state-title">No classes on {day}</p>
                <p className="empty-state-desc">
                  {category !== 'All' ? `No ${category} classes scheduled. Try a different category.` : 'No classes scheduled. Choose another day.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
                {filtered.map((cls, i) => {
                  const level       = LEVEL_STYLE[cls.level] || LEVEL_STYLE.Beginner;
                  const spotsLeft   = cls.spots || 20;
                  const spotsTotal  = 20;
                  const spotsUsed   = spotsTotal - spotsLeft;
                  const pct         = Math.round((spotsUsed / spotsTotal) * 100);
                  return (
                    <motion.div
                      key={`${cls.name}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease }}
                      className="pf-card pf-card--interactive"
                      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ color: 'var(--text-1)', fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cls.name}
                          </h3>
                          {cls.description && (
                            <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {cls.description}
                            </p>
                          )}
                        </div>
                        <span style={{ background: level.bg, color: level.color, borderRadius: 'var(--r-pill)', padding: '3px 9px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                          {cls.level}
                        </span>
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                        {[
                          { icon: LuClock, text: cls.time },
                          { icon: LuUser,  text: cls.trainer },
                        ].filter(d => d.text).map(({ icon: Icon, text }) => (
                          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Icon size={11} color="var(--text-3)" strokeWidth={1.5} />
                            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Capacity */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <LuUsers size={11} color="var(--text-3)" strokeWidth={1.5} />
                            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{spotsLeft} spots left</span>
                          </div>
                          <span style={{ fontSize: 11, color: pct >= 80 ? 'var(--red)' : 'var(--text-3)' }}>
                            {pct}% full
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${pct >= 80 ? 'progress-fill--amber' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => handleReserve(cls)}
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                      >
                        Reserve spot <LuArrowRight size={13} strokeWidth={2} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
