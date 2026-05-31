import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = ['All', 'Strength', 'Yoga', 'HIIT', 'Boxing', 'Cardio', 'Nutrition', 'Rehabilitation'];

const StarRating = ({ rating, size = 14 }) => {
  const stars = Math.round(rating || 0);
  return (
    <span style={{ fontSize: size }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < stars ? '#ffd700' : '#333' }}>★</span>
      ))}
    </span>
  );
};

export default function TrainerDirectory() {
  const { apiClient } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchTrainers();
  }, [debouncedSearch, spec]);

  const fetchTrainers = async () => {
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
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 100%)', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9d00ff', fontSize: 13, fontWeight: 700, letterSpacing: 3, margin: '0 0 12px', textTransform: 'uppercase' }}>Expert Guidance</p>
          <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
            Meet Your <span style={{ background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trainers</span>
          </h1>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 32px' }}>World-class coaches to guide your transformation</p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trainers by name or specialty..."
              style={{
                width: '100%', padding: '14px 48px 14px 18px', borderRadius: 14,
                border: '1px solid #333', background: '#111', color: '#fff',
                fontSize: 15, fontFamily: 'inherit',
              }}
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 18 }}>🔍</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-48px auto 0', padding: '0 16px' }}>
        {/* Specialization filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 0 16px', scrollbarWidth: 'none', marginBottom: 8 }}>
          {SPECIALIZATIONS.map(s => (
            <button key={s} onClick={() => setSpec(s)} style={{
              padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: spec === s ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#111',
              color: spec === s ? '#fff' : '#555', fontSize: 13, transition: 'all 0.2s',
            }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#111', borderRadius: 20, height: 280, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>No trainers found</h3>
            <p style={{ color: '#555', fontSize: 14 }}>Try a different search or specialization.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>{trainers.length} trainer{trainers.length !== 1 ? 's' : ''} available</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {trainers.map((trainer, i) => (
                <TrainerCard key={trainer._id} trainer={trainer} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TrainerCard({ trainer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: '#111', border: '1px solid #1a1a1a', borderRadius: 20,
        overflow: 'hidden', transition: 'border 0.2s, transform 0.2s',
      }}
      whileHover={{ y: -4, borderColor: '#9d00ff44' }}
    >
      {/* Cover + Avatar */}
      <div style={{ height: 80, background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -32, left: 20,
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid #111',
          background: trainer.profilePicture ? 'transparent' : 'linear-gradient(135deg, #9d00ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {trainer.profilePicture
            ? <img src={trainer.profilePicture} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{trainer.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        {trainer.rating > 0 && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: '#ffd70022', border: '1px solid #ffd70044',
            borderRadius: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ color: '#ffd700', fontSize: 13, fontWeight: 700 }}>★ {trainer.rating?.toFixed(1)}</span>
            <span style={{ color: '#666', fontSize: 11 }}>({trainer.totalRatings})</span>
          </div>
        )}
      </div>

      <div style={{ padding: '42px 20px 20px' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 2px' }}>{trainer.name}</h3>
        {trainer.specialization && (
          <p style={{ color: '#9d00ff', fontSize: 12, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
            {trainer.specialization}
          </p>
        )}
        {trainer.bio && (
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {trainer.bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: 15 }}>{trainer.sessionCount || 0}</p>
            <p style={{ color: '#555', fontSize: 10, margin: 0 }}>Sessions</p>
          </div>
          <div style={{ width: 1, background: '#1a1a1a' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: 15 }}>{trainer.totalRatings || 0}</p>
            <p style={{ color: '#555', fontSize: 10, margin: 0 }}>Reviews</p>
          </div>
          {trainer.certifications?.length > 0 && (
            <>
              <div style={{ width: 1, background: '#1a1a1a' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: 15 }}>{trainer.certifications.length}</p>
                <p style={{ color: '#555', fontSize: 10, margin: 0 }}>Certs</p>
              </div>
            </>
          )}
        </div>

        <Link to={`/trainers/${trainer._id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '11px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
              border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}
          >
            View Profile & Book
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
