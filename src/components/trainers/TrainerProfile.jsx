import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  const display = hover || rating;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          onClick={() => interactive && onRate(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: interactive ? 28 : 16, cursor: interactive ? 'pointer' : 'default',
            color: i < display ? '#ffd700' : '#333',
            transition: 'transform 0.1s',
            transform: hover === i + 1 && interactive ? 'scale(1.2)' : 'scale(1)',
          }}
        >★</span>
      ))}
    </div>
  );
};

export default function TrainerProfile() {
  const { id } = useParams();
  const { apiClient, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, review: '', bookingId: '' });
  const [submitting, setSubmitting] = useState(false);

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
      const withThisTrainer = (res.data.data || []).filter(
        b => String(b.trainerId?._id || b.trainerId) === id && !b.memberRating
      );
      setMyBookings(withThisTrainer);
    } catch {}
  };

  const submitReview = async () => {
    if (!reviewForm.rating) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await apiClient.post(`/trainers/${id}/review`, reviewForm);
      toast.success('Review submitted! Thank you 🙏');
      setReviewModal(false);
      loadTrainer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1a1a1a', borderTop: '3px solid #9d00ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!trainer) return null;

  const completedSessions = trainer.sessionCount || 0;
  const joinedYear = new Date(trainer.createdAt).getFullYear();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 100%)', padding: '60px 20px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link to="/trainers" style={{ color: '#9d00ff', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
            ← All Trainers
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', flexShrink: 0,
              border: '3px solid #9d00ff44',
              background: trainer.profilePicture ? 'transparent' : 'linear-gradient(135deg, #9d00ff, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {trainer.profilePicture
                ? <img src={trainer.profilePicture} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: 40, fontWeight: 700 }}>{trainer.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#9d00ff', fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: '0 0 6px', textTransform: 'uppercase' }}>
                {trainer.specialization || 'Certified Trainer'}
              </p>
              <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>{trainer.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {trainer.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={Math.round(trainer.rating || 0)} />
                    <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 15 }}>{trainer.rating?.toFixed(1)}</span>
                    <span style={{ color: '#555', fontSize: 13 }}>({trainer.totalRatings} reviews)</span>
                  </div>
                )}
                <span style={{ color: '#444', fontSize: 12 }}>•</span>
                <span style={{ color: '#555', fontSize: 13 }}>Member since {joinedYear}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link to="/book-trainer" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                    border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer',
                    fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
                  }}
                >
                  📅 Book a Session
                </motion.button>
              </Link>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '14px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                  border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                }}>
                  Login to Book
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '-48px auto 0', padding: '0 16px' }}>
        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Sessions', value: completedSessions, icon: '💪' },
            { label: 'Rating', value: trainer.rating ? `${trainer.rating.toFixed(1)}★` : '—', icon: '⭐' },
            { label: 'Reviews', value: trainer.totalRatings || 0, icon: '📝' },
            { label: 'Certs', value: trainer.certifications?.length || 0, icon: '🏅' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ color: '#9d00ff', fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: '#555', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, flexWrap: 'wrap' }}>
          <div>
            {/* Bio */}
            {trainer.bio && (
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>About</h3>
                <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{trainer.bio}</p>
              </div>
            )}

            {/* Certifications */}
            {trainer.certifications?.length > 0 && (
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Certifications 🏅</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {trainer.certifications.map((cert, i) => (
                    <span key={i} style={{
                      background: '#9d00ff22', border: '1px solid #9d00ff44',
                      borderRadius: 20, padding: '6px 14px', color: '#9d00ff', fontSize: 13,
                    }}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>Member Reviews</h3>
                {myBookings.length > 0 && (
                  <button onClick={() => { setReviewForm(f => ({ ...f, bookingId: myBookings[0]._id })); setReviewModal(true); }}
                    style={{ padding: '7px 14px', background: '#9d00ff22', border: '1px solid #9d00ff44', borderRadius: 10, color: '#9d00ff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    Write Review
                  </button>
                )}
              </div>

              {trainer.reviews?.length === 0 ? (
                <p style={{ color: '#555', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {trainer.reviews?.map((r, i) => (
                    <div key={i} style={{ paddingBottom: 14, borderBottom: i < trainer.reviews.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                          }}>
                            {r.memberId?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: 14 }}>{r.memberId?.name || 'Member'}</p>
                            <StarRating rating={r.memberRating} />
                          </div>
                        </div>
                        <span style={{ color: '#444', fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.memberReview && (
                        <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.6, margin: '8px 0 0', fontStyle: 'italic' }}>
                          "{r.memberReview}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Booking CTA */}
            <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', border: '1px solid #9d00ff33', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>📅 Book a Session</h3>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                Personal training, group sessions, nutrition consultations, and assessments available.
              </p>
              <Link to="/book-trainer" style={{ textDecoration: 'none', display: 'block' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '12px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                    border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                  }}
                >
                  Book Now
                </motion.button>
              </Link>
            </div>

            {/* Availability */}
            {trainer.availability?.length > 0 && (
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
                <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Availability</h3>
                {trainer.availability.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #111' }}>
                    <span style={{ color: '#ccc', fontSize: 13 }}>{slot.day}</span>
                    <span style={{ color: '#9d00ff', fontSize: 13 }}>{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setReviewModal(false)}>
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: 28, width: '100%', maxWidth: 600 }}
          >
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Rate your session with {trainer.name}</h3>
            <div style={{ marginBottom: 20 }}>
              <StarRating rating={reviewForm.rating} interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
              <p style={{ color: '#555', fontSize: 13, marginTop: 8 }}>
                {reviewForm.rating === 1 ? 'Poor' : reviewForm.rating === 2 ? 'Fair' : reviewForm.rating === 3 ? 'Good' : reviewForm.rating === 4 ? 'Very Good' : reviewForm.rating === 5 ? 'Excellent!' : 'Tap a star'}
              </p>
            </div>
            <textarea
              value={reviewForm.review}
              onChange={e => setReviewForm(f => ({ ...f, review: e.target.value }))}
              placeholder="Share your experience (optional)..."
              rows={3}
              style={{ width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReviewModal(false)} style={{ flex: 1, padding: 12, background: '#1a1a1a', border: '1px solid #222', borderRadius: 12, color: '#666', cursor: 'pointer', fontSize: 15 }}>
                Cancel
              </button>
              <button onClick={submitReview} disabled={submitting || !reviewForm.rating} style={{
                flex: 2, padding: 12, background: reviewForm.rating ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
                border: 'none', borderRadius: 12, color: reviewForm.rating ? '#fff' : '#444',
                cursor: reviewForm.rating ? 'pointer' : 'default', fontSize: 15, fontWeight: 700,
              }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
