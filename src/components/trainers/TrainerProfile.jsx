import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuCalendar, LuStar, LuAward, LuMessageSquare } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

function StarRating({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  const display = hover || rating;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <LuStar
          key={i}
          size={interactive ? 24 : 13}
          onClick={() => interactive && onRate(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s', transform: hover === i + 1 && interactive ? 'scale(1.15)' : 'none' }}
          color={i < display ? 'var(--amber)' : 'var(--border-2)'}
          fill={i < display ? 'var(--amber)' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function TrainerProfile() {
  const { id }            = useParams();
  const { apiClient, isAuthenticated } = useAuth();
  const navigate          = useNavigate();
  const [trainer, setTrainer]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [myBookings, setMyBookings] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm]   = useState({ rating: 0, review: '', bookingId: '' });
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    loadTrainer();
    if (isAuthenticated) loadMyBookings();
  }, [id]);

  const loadTrainer = async () => {
    try {
      const res = await apiClient.get(`/trainers/${id}`);
      setTrainer(res.data.data);
    } catch {
      toast.error('Trainer not found');
      navigate('/trainers');
    }
    setLoading(false);
  };

  const loadMyBookings = async () => {
    try {
      const res = await apiClient.get(`/trainer-bookings/my?status=completed`);
      setMyBookings((res.data.data || []).filter(b => String(b.trainerId?._id || b.trainerId) === id && !b.memberRating));
    } catch {}
  };

  const submitReview = async () => {
    if (!reviewForm.rating) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await apiClient.post(`/trainers/${id}/review`, reviewForm);
      toast.success('Review submitted — thank you.');
      setReviewModal(false);
      loadTrainer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner" style={{ animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!trainer) return null;

  const joinedYear = new Date(trainer.createdAt).getFullYear();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(40px, 7vw, 64px) 0 clamp(28px, 4vw, 40px)' }}>
        <div className="container">
          <Link to="/trainers" style={{ color: 'var(--text-3)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <LuArrowLeft size={13} strokeWidth={1.8} />
            All trainers
          </Link>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: 18, flexShrink: 0,
              background: trainer.profilePicture ? 'transparent' : 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {trainer.profilePicture
                ? <img src={trainer.profilePicture} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--accent)', fontSize: 32, fontWeight: 700 }}>{trainer.name?.[0]?.toUpperCase()}</span>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              {trainer.specialization && (
                <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  {trainer.specialization}
                </p>
              )}
              <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                {trainer.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {trainer.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={Math.round(trainer.rating || 0)} />
                    <span style={{ color: 'var(--amber)', fontWeight: 600, fontSize: 13 }}>{trainer.rating?.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>({trainer.totalRatings} reviews)</span>
                  </div>
                )}
                <span style={{ color: 'var(--text-4)', fontSize: 12 }}>Joined {joinedYear}</span>
              </div>
            </div>

            {/* Book CTA */}
            {isAuthenticated ? (
              <Link to="/book-trainer" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary btn-lg">
                  <LuCalendar size={15} strokeWidth={1.8} />
                  Book a session
                </button>
              </Link>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-lg">Sign in to book</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)' }} className="trainer-stats-grid">
          {[
            { label: 'Sessions', value: trainer.sessionCount || 0 },
            { label: 'Rating', value: trainer.rating ? `${trainer.rating.toFixed(1)} / 5` : '—' },
            { label: 'Reviews', value: trainer.totalRatings || 0 },
            { label: 'Certifications', value: trainer.certifications?.length || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-4)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 20, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--sp-5)' }} className="trainer-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

            {/* Bio */}
            {trainer.bio && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
                <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>About</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{trainer.bio}</p>
              </div>
            )}

            {/* Certifications */}
            {trainer.certifications?.length > 0 && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <LuAward size={14} color="var(--amber)" strokeWidth={1.8} />
                  <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: 0 }}>Certifications</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {trainer.certifications.map((cert, i) => (
                    <span key={i} className="pill pill--default">{cert}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LuMessageSquare size={14} color="var(--text-3)" strokeWidth={1.8} />
                  <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: 0 }}>Member reviews</h3>
                </div>
                {myBookings.length > 0 && (
                  <button
                    onClick={() => { setReviewForm(f => ({ ...f, bookingId: myBookings[0]._id })); setReviewModal(true); }}
                    className="btn btn-secondary btn-sm"
                  >
                    Write a review
                  </button>
                )}
              </div>

              {!trainer.reviews?.length ? (
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: 'var(--sp-8) 0' }}>
                  No reviews yet. Book a session and share your experience.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {trainer.reviews.map((r, i) => (
                    <div key={i} style={{ paddingBottom: 16, borderBottom: i < trainer.reviews.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-3)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontWeight: 700, fontSize: 12 }}>
                            {r.memberId?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0, fontSize: 13 }}>{r.memberId?.name || 'Member'}</p>
                            <StarRating rating={r.memberRating} />
                          </div>
                        </div>
                        <span style={{ color: 'var(--text-4)', fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.memberReview && (
                        <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.65, margin: '8px 0 0', paddingLeft: 40 }}>
                          {r.memberReview}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

            {/* Booking card */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)' }}>
              <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Book a session</h3>
              <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>
                Personal training, fitness assessment, nutrition consultation, or group session. Check availability and book from your dashboard.
              </p>
              <Link to="/book-trainer" style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 7 }}>
                  <LuCalendar size={13} strokeWidth={1.8} />
                  Book with {trainer.name?.split(' ')[0]}
                </button>
              </Link>
            </div>

            {/* Availability */}
            {trainer.availability?.length > 0 && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)' }}>
                <h3 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Availability</h3>
                {trainer.availability.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < trainer.availability.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                    <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{slot.day}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Review Modal ──────────────────────────────────── */}
      {reviewModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.88)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setReviewModal(false)}
        >
          <motion.div
            initial={{ y: 280 }} animate={{ y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: '20px 20px 0 0', padding: 28, width: '100%', maxWidth: 540 }}
          >
            <h3 style={{ color: 'var(--text-1)', fontSize: 17, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.015em' }}>
              How was your session with {trainer.name?.split(' ')[0]}?
            </h3>
            <div style={{ marginBottom: 16 }}>
              <StarRating rating={reviewForm.rating} interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
              <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>
                {reviewForm.rating === 1 ? 'Needs improvement'
                  : reviewForm.rating === 2 ? 'Below expectations'
                  : reviewForm.rating === 3 ? 'Good session'
                  : reviewForm.rating === 4 ? 'Very good'
                  : reviewForm.rating === 5 ? 'Excellent session'
                  : 'Select a rating'}
              </p>
            </div>
            <textarea
              value={reviewForm.review}
              onChange={e => setReviewForm(f => ({ ...f, review: e.target.value }))}
              placeholder="What was most useful about the session? (optional)"
              rows={3}
              className="field-input"
              style={{ resize: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setReviewModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >Cancel</button>
              <button
                onClick={submitReview}
                disabled={submitting || !reviewForm.rating}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: 'center', opacity: !reviewForm.rating ? 0.4 : 1 }}
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .trainer-layout { grid-template-columns: 1fr !important; }
          .trainer-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .trainer-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
