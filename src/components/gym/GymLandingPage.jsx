import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#ffd700' : '#333', fontSize: 16 }}>★</span>
      ))}
    </div>
  );
};

export default function GymLandingPage() {
  const { slug } = useParams();
  const { apiClient, isAuthenticated } = useAuth();
  const [gym, setGym] = useState(null);
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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Arial, sans-serif' }}>
      {/* Hero */}
      <div style={{
        height: 380, background: gym.coverImage
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(10,10,10,1)), url(${gym.coverImage}) center/cover`
          : 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 20px 32px',
        position: 'relative',
      }}>
        {gym.logo && <img src={gym.logo} alt={gym.name} style={{ position: 'absolute', top: 24, left: 24, height: 60, borderRadius: 12 }} />}
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#fff', fontSize: 40, fontWeight: 900, margin: '0 0 8px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {gym.name}
          </motion.h1>
          <p style={{ color: '#ccc', fontSize: 18, margin: '0 0 16px' }}>{gym.tagline}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {gym.address?.city && <Chip icon="📍">{gym.address.city}, {gym.address.state}</Chip>}
            <Chip icon="👥">{gym.totalMembers}+ Members</Chip>
            {gym.workingHours?.weekdays && <Chip icon="🕐">{gym.workingHours.weekdays.open} - {gym.workingHours.weekdays.close}</Chip>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        {/* CTA */}
        {!isAuthenticated && (
          <div style={{ background: 'linear-gradient(135deg, rgba(157,0,255,0.15), rgba(0,212,255,0.05))', border: '1px solid #9d00ff', borderRadius: 16, padding: '24px 20px', marginBottom: 28, textAlign: 'center' }}>
            <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: 20 }}>Join {gym.name} Today</h3>
            <p style={{ color: '#888', margin: '0 0 20px' }}>Get AI workouts, trainer sessions, QR check-ins, and more.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                  Get Started Free
                </button>
              </Link>
              <Link to="/pricing" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '12px 28px', background: 'transparent', border: '1px solid #333', borderRadius: 10, color: '#888', cursor: 'pointer', fontSize: 15 }}>
                  View Plans
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#111', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: activeTab === t ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : 'transparent',
              color: activeTab === t ? '#fff' : '#666', transition: 'all 0.2s', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ color: '#ccc', lineHeight: 1.7, marginBottom: 24 }}>{gym.description}</p>

            {gym.amenities?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#fff', marginBottom: 12 }}>🏋️ Amenities</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {gym.amenities.map(a => (
                    <span key={a} style={{ background: '#111', border: '1px solid #222', borderRadius: 20, padding: '6px 14px', color: '#ccc', fontSize: 13 }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Working hours */}
            {gym.workingHours && (
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20, marginBottom: 24 }}>
                <h3 style={{ color: '#fff', margin: '0 0 12px' }}>🕐 Working Hours</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: 14 }}>
                  <div>
                    <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>Weekdays</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{gym.workingHours.weekdays?.open} – {gym.workingHours.weekdays?.close}</p>
                  </div>
                  <div>
                    <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>Weekends</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{gym.workingHours.weekends?.open} – {gym.workingHours.weekends?.close}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20 }}>
              <h3 style={{ color: '#fff', margin: '0 0 12px' }}>📞 Contact</h3>
              {gym.phone && <p style={{ color: '#ccc', margin: '0 0 6px' }}>📱 {gym.phone}</p>}
              {gym.email && <p style={{ color: '#ccc', margin: '0 0 6px' }}>✉️ {gym.email}</p>}
              {gym.address && (
                <p style={{ color: '#ccc', margin: 0 }}>
                  📍 {[gym.address.street, gym.address.city, gym.address.state, gym.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              {gym.mapLink && (
                <a href={gym.mapLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, color: '#9d00ff', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
                  View on Map →
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {gym.trainers?.length === 0 ? (
              <EmptyState icon="👨‍💼" text="No trainers listed yet" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {gym.trainers?.map(t => (
                  <div key={t._id} style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                    <Avatar name={t.name} url={t.profilePicture} size={64} style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 16 }}>{t.name}</h3>
                    <p style={{ color: '#9d00ff', fontSize: 13, margin: '0 0 8px' }}>{t.specialization || 'Trainer'}</p>
                    {t.rating > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
                        <StarRating rating={t.rating} />
                        <span style={{ color: '#666', fontSize: 12 }}>({t.totalRatings})</span>
                      </div>
                    )}
                    {isAuthenticated && (
                      <Link to="/book-trainer" style={{ textDecoration: 'none' }}>
                        <button style={{ marginTop: 12, width: '100%', padding: '8px', background: 'transparent', border: '1px solid #9d00ff', borderRadius: 8, color: '#9d00ff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                          Book Session
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {gym.testimonials?.length === 0 ? (
              <EmptyState icon="⭐" text="No reviews yet. Be the first!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {gym.testimonials?.map((t, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        {t.memberName?.[0]}
                      </div>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: 14 }}>{t.memberName}</p>
                        <StarRating rating={t.rating} />
                      </div>
                      <p style={{ color: '#555', fontSize: 12, margin: '0 0 0 auto' }}>{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <p style={{ color: '#ccc', lineHeight: 1.6, margin: 0, fontSize: 14 }}>"{t.text}"</p>
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

const Avatar = ({ name, url, size = 40, style = {} }) => (
  url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', ...style }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.4, ...style }}>
      {name?.[0]?.toUpperCase()}
    </div>
  )
);

const Chip = ({ icon, children }) => (
  <span style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 12px', color: '#ccc', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
    {icon} {children}
  </span>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
    <p style={{ fontSize: 48, marginBottom: 12 }}>{icon}</p>
    <p style={{ fontSize: 16 }}>{text}</p>
  </div>
);

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: '#9d00ff', fontSize: 18 }}>Loading gym profile...</div>
  </div>
);

const NotFound = () => (
  <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <p style={{ fontSize: 64, marginBottom: 16 }}>😔</p>
    <h2 style={{ color: '#fff', fontSize: 24 }}>Gym not found</h2>
    <Link to="/" style={{ color: '#9d00ff', textDecoration: 'none', marginTop: 16 }}>← Go Home</Link>
  </div>
);
