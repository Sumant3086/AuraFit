import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../footer/Footer';
import { LuSearch, LuStar, LuCalendar } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

const SPECIALIZATIONS = ['All', 'Strength', 'Yoga', 'HIIT', 'Boxing', 'Cardio', 'Nutrition', 'Rehabilitation'];

export default function TrainerDirectory() {
  const { apiClient } = useAuth();
  const [trainers, setTrainers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [spec, setSpec]             = useState('All');
  const [debouncedSearch, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (spec !== 'All') params.append('specialization', spec);
      const res = await apiClient.get(`/trainers?${params}`);
      setTrainers(res.data.data || []);
    } catch {
      setTrainers([]);
    }
    setLoading(false);
  }, [apiClient, debouncedSearch, spec]);

  useEffect(() => { fetchTrainers(); }, [fetchTrainers]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px, 9vw, 88px) 0 clamp(36px, 5vw, 52px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Trainers
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 12px', lineHeight: 1.1 }}>
              Trained by the right person,<br />everything changes.
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 460, margin: '0 0 28px', lineHeight: 1.65 }}>
              Certified coaches with specific expertise. Book a single session for form coaching, programme review, nutrition consultation, or regular personal training.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 420 }}>
              <LuSearch
                size={14}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}
                strokeWidth={2}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or specialisation…"
                className="field-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-6)' }}>

        {/* ── Specialisation filter ──────────────────────── */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-6)', scrollbarWidth: 'none' }}>
          {SPECIALIZATIONS.map(s => (
            <button
              key={s}
              onClick={() => setSpec(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                border: `1px solid ${spec === s ? 'var(--accent-border)' : 'var(--border-2)'}`,
                background: spec === s ? 'var(--accent-dim)' : 'transparent',
                color: spec === s ? 'var(--accent)' : 'var(--text-3)',
                fontSize: 12,
                fontWeight: spec === s ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Count ─────────────────────────────────────── */}
        {!loading && (
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '0 0 var(--sp-5)' }}>
            <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{trainers.length}</span>{' '}
            {trainers.length === 1 ? 'trainer' : 'trainers'} available
            {spec !== 'All' ? ` in ${spec}` : ''}
          </p>
        )}

        {/* ── Grid ──────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 20, height: 260 }} className="skeleton" />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="empty-state">
            <LuSearch size={36} className="empty-state-icon" />
            <p className="empty-state-title">No trainers found</p>
            <p className="empty-state-desc">
              {search ? `No results for "${search}". Try a different name or clear the search.` : 'Try a different specialisation.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {trainers.map((trainer, i) => (
              <TrainerCard key={trainer._id} trainer={trainer} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function TrainerCard({ trainer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pf-card pf-card--interactive"
      style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}
    >
      {/* Card header stripe */}
      <div style={{ height: 6, background: 'var(--accent-dim)', borderBottom: '1px solid var(--accent-border)' }} />

      <div style={{ padding: '18px 20px 20px' }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: trainer.profilePicture ? 'transparent' : 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {trainer.profilePicture
              ? <img src={trainer.profilePicture} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 700 }}>{trainer.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {trainer.name}
            </h3>
            {trainer.specialization && (
              <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {trainer.specialization}
              </p>
            )}
          </div>
          {trainer.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <LuStar size={11} color="var(--amber)" fill="var(--amber)" />
              <span style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 600 }}>{trainer.rating?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {trainer.bio && (
          <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {trainer.bio}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, paddingTop: 12, borderTop: '1px solid var(--border-1)' }}>
          <div>
            <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>{trainer.sessionCount || 0}</p>
            <p style={{ color: 'var(--text-3)', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Sessions</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>{trainer.totalRatings || 0}</p>
            <p style={{ color: 'var(--text-3)', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Reviews</p>
          </div>
          {trainer.certifications?.length > 0 && (
            <div>
              <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14 }}>{trainer.certifications.length}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Certs</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link to={`/trainers/${trainer._id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', gap: 7 }}
          >
            <LuCalendar size={13} strokeWidth={1.8} />
            View profile & book
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
