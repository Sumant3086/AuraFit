import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? 'var(--amber)' : 'var(--border-3)', fontSize: 14 }}>★</span>
    ))}
  </div>
);

export default function GymLandingPage() {
  const { slug } = useParams();
  const { apiClient, isAuthenticated } = useAuth();
  const [gym, setGym]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (!slug) return;
    apiClient.get(`/gyms/${slug}`)
      .then(r => { setGym(r.data.data); document.title = `${r.data.data.name} | AuraFit`; })
      .catch(() => toast.error('Gym not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (!gym) return <NotFound />;

  const TABS = ['about', 'trainers', 'reviews'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      {/* Hero */}
      <div style={{
        height: 340,
        background: gym.coverImage
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg)), url(${gym.coverImage}) center/cover`
          : 'linear-gradient(135deg, var(--accent-dim), var(--surface-2))',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 20px 28px', position: 'relative',
      }}>
        {gym.logo && <img src={gym.logo} alt={gym.name} style={{ position: 'absolute', top: 24, left: 24, height: 56, borderRadius: 12 }} />}
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--text-1)', fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.025em' }}
          >
            {gym.name}
          </motion.h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, margin: '0 0 14px' }}>{gym.tagline}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {gym.address?.city && <Chip icon="📍">{gym.address.city}, {gym.address.state}</Chip>}
            <Chip icon="👥">{gym.totalMembers}+ Members</Chip>
            {gym.workingHours?.weekdays && <Chip icon="🕐">{gym.workingHours.weekdays.open} - {gym.workingHours.weekdays.close}</Chip>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

        {/* CTA */}
        {!isAuthenticated && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-xl)', padding: '24px 20px', marginBottom: 28, textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-1)', margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Join {gym.name} Today</h3>
            <p style={{ color: 'var(--text-3)', margin: '0 0 20px' }}>Get AI workouts, trainer sessions, QR check-ins, and more.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Get Started Free
              </Link>
              <Link to="/pricing" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                View Plans
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-lg)', padding: 4, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: activeTab === t ? 'var(--accent)' : 'transparent',
              color: activeTab === t ? '#fff' : 'var(--text-3)',
              transition: 'all 0.15s', textTransform: 'capitalize', fontFamily: 'var(--font-sans)',
            }}>{t}</button>
          ))}
        </div>

        {/* About */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>{gym.description}</p>

            {gym.amenities?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: 'var(--text-1)', marginBottom: 12, fontSize: 15, fontWeight: 700 }}>🏋️ Amenities</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {gym.amenities.map(a => (
                    <span key={a} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 20, padding: '5px 12px', color: 'var(--text-2)', fontSize: 13 }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {gym.workingHours && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
                <h3 style={{ color: 'var(--text-1)', margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>🕐 Working Hours</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <div>
                    <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Weekdays</p>
                    <p style={{ color: 'var(--text-1)', margin: 0, fontWeight: 600 }}>{gym.workingHours.weekdays?.open} – {gym.workingHours.weekdays?.close}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Weekends</p>
                    <p style={{ color: 'var(--text-1)', margin: 0, fontWeight: 600 }}>{gym.workingHours.weekends?.open} – {gym.workingHours.weekends?.close}</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <h3 style={{ color: 'var(--text-1)', margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>📞 Contact</h3>
              {gym.phone && <p style={{ color: 'var(--text-2)', margin: '0 0 6px', fontSize: 14 }}>📱 {gym.phone}</p>}
              {gym.email && <p style={{ color: 'var(--text-2)', margin: '0 0 6px', fontSize: 14 }}>✉️ {gym.email}</p>}
              {gym.address && (
                <p style={{ color: 'var(--text-2)', margin: 0, fontSize: 14 }}>
                  📍 {[gym.address.street, gym.address.city, gym.address.state, gym.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              {gym.mapLink && (
                <a href={gym.mapLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, color: 'var(--accent)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  View on Map →
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Trainers */}
        {activeTab === 'trainers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {gym.trainers?.length === 0 ? (
              <EmptyState icon="👨‍💼" text="No trainers listed yet" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {gym.trainers?.map(t => (
                  <div key={t._id} className="pf-card" style={{ textAlign: 'center' }}>
                    <Avatar name={t.name} url={t.profilePicture} size={60} style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ color: 'var(--text-1)', margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{t.name}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>{t.specialization || 'Trainer'}</p>
                    {t.rating > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                        <StarRating rating={t.rating} />
                        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>({t.totalRatings})</span>
                      </div>
                    )}
                    {isAuthenticated && (
                      <Link to="/book-trainer" className="btn btn-secondary" style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', fontSize: 12, marginTop: 4 }}>
                        Book Session
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {gym.testimonials?.length === 0 ? (
              <EmptyState icon="⭐" text="No reviews yet. Be the first!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {gym.testimonials?.map((t, i) => (
                  <div key={i} className="pf-card">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                        {t.memberName?.[0]}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: '0 0 3px', fontSize: 14 }}>{t.memberName}</p>
                        <StarRating rating={t.rating} />
                      </div>
                      <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '0 0 0 auto' }}>{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <p style={{ color: 'var(--text-2)', lineHeight: 1.6, margin: 0, fontSize: 14 }}>"{t.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const Avatar = ({ name, url, size = 40, style: extraStyle = {} }) => (
  url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', ...extraStyle }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.4), ...extraStyle }}>
      {name?.[0]?.toUpperCase()}
    </div>
  )
);

const Chip = ({ icon, children }) => (
  <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 20, padding: '5px 11px', color: 'var(--text-2)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    {icon} {children}
  </span>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>{icon}</p>
    <p style={{ fontSize: 15, color: 'var(--text-3)', margin: 0 }}>{text}</p>
  </div>
);

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: 'var(--accent)', fontSize: 16, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Loading gym profile…</div>
  </div>
);

const NotFound = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <p style={{ fontSize: 56, margin: 0 }}>😔</p>
    <h2 style={{ color: 'var(--text-1)', fontSize: 22, margin: 0 }}>Gym not found</h2>
    <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Go Home</Link>
  </div>
);
