import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LuClock, LuUser, LuUsers, LuBarChart2 } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Footer from '../footer/Footer';
import classesByDay from './classesData';
import Reveal, { RevealItem } from '../common/Reveal';
import { ease, dur, staggerContainer } from '../../lib/motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LEVEL_STYLE = {
  Beginner:     { color: 'var(--green)',  bg: 'var(--green-dim)' },
  Intermediate: { color: 'var(--accent)', bg: 'var(--accent-dim)' },
  Advanced:     { color: 'var(--amber)',  bg: 'var(--amber-dim)' },
};

export default function Classes() {
  const navigate = useNavigate();
  const [day, setDay] = useState('');

  useEffect(() => {
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    setDay(names[new Date().getDay()]);
  }, []);

  const handleReserve = (classItem) => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('redirectAfterLogin', '/classes');
      localStorage.setItem('pendingReservation', JSON.stringify(classItem));
      toast.error('Sign in to reserve a spot.');
      navigate('/login');
    } else {
      toast.success(`Reserved — ${classItem.name}`);
    }
  };

  const classes = classesByDay[day] || [];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-1)',
        padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,60px) clamp(32px,5vw,48px)',
      }}>
        <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, ease: ease.out }}
            style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 var(--sp-4)' }}
          >
            Schedule
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.slow, delay: 0.06, ease: ease.out }}
            style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 var(--sp-3)', lineHeight: 1.1 }}
          >
            Weekly classes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, delay: 0.15, ease: ease.out }}
            style={{ color: 'var(--text-2)', fontSize: 'clamp(15px,1.6vw,17px)', maxWidth: 420, margin: 0, lineHeight: 'var(--leading-normal)' }}
          >
            Expert-led sessions for every fitness level. Book your spot in advance.
          </motion.p>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--max-wide)', margin: '0 auto', padding: 'var(--sp-8) clamp(20px,5vw,60px) var(--sp-20)' }}>

        {/* Day selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.base, delay: 0.2, ease: ease.out }}
          style={{
            display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4,
            marginBottom: 'var(--sp-8)', scrollbarWidth: 'none',
            borderBottom: '1px solid var(--border-1)', paddingBottom: 'var(--sp-4)',
          }}
        >
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-pill)',
                border: 'none',
                background: day === d ? 'var(--text-1)' : 'transparent',
                color: day === d ? 'var(--bg)' : 'var(--text-3)',
                fontSize: 'var(--text-sm)',
                fontWeight: day === d ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 120ms ease, color 120ms ease',
              }}
            >
              {d}
            </button>
          ))}
        </motion.div>

        {/* Classes grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: ease.out }}
          >
            {classes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-24) 0' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-base)', margin: 0 }}>
                  No classes scheduled for {day}.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--sp-3)',
              }}>
                {classes.map((cls, i) => {
                  const level = LEVEL_STYLE[cls.level] || LEVEL_STYLE.Beginner;
                  return (
                    <motion.div
                      key={`${cls.name}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: dur.base, ease: ease.out }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-1)',
                        borderRadius: 'var(--r-xl)',
                        padding: 'var(--sp-5)',
                        display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                      }}
                    >
                      {/* Class header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{
                          color: 'var(--text-1)', fontSize: 'var(--text-md)',
                          fontWeight: 700, letterSpacing: '-0.02em', margin: 0,
                        }}>
                          {cls.name}
                        </h3>
                        <span style={{
                          background: level.bg, color: level.color,
                          borderRadius: 'var(--r-pill)', padding: '3px 10px',
                          fontSize: 'var(--text-xs)', fontWeight: 600, flexShrink: 0,
                          marginLeft: 'var(--sp-2)',
                        }}>
                          {cls.level}
                        </span>
                      </div>

                      {/* Description */}
                      {cls.description && (
                        <p style={{
                          color: 'var(--text-2)', fontSize: 'var(--text-sm)',
                          lineHeight: 'var(--leading-snug)', margin: 0,
                        }}>
                          {cls.description}
                        </p>
                      )}

                      {/* Details row */}
                      <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                        {[
                          { icon: LuClock, text: cls.time },
                          { icon: LuUser,  text: cls.trainer },
                          { icon: LuUsers, text: `${cls.spots} spots` },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Icon size={12} color="var(--text-3)" strokeWidth={1.5} />
                            <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>{text}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.button
                        whileHover={{ opacity: 0.88 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleReserve(cls)}
                        style={{
                          padding: '10px', background: 'var(--surface-3)',
                          border: '1px solid var(--border-2)',
                          borderRadius: 'var(--r-md)', color: 'var(--text-1)',
                          fontSize: 'var(--text-sm)', fontWeight: 600,
                          cursor: 'pointer', marginTop: 'auto',
                          transition: 'border-color 120ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                      >
                        Reserve spot
                      </motion.button>
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
