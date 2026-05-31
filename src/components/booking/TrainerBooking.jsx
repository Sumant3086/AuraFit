import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SESSION_TYPES = [
  { key: 'personal_training', label: 'Personal Training', icon: '🏋️', duration: '60 min' },
  { key: 'assessment', label: 'Fitness Assessment', icon: '📊', duration: '45 min' },
  { key: 'nutrition_consultation', label: 'Nutrition Consultation', icon: '🥗', duration: '30 min' },
  { key: 'group_session', label: 'Group Session', icon: '👥', duration: '60 min' },
];

const SLOTS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '17:00', '18:00', '19:00', '20:00'];

export default function TrainerBooking() {
  const { apiClient, user } = useAuth();
  const [step, setStep] = useState('trainers');
  const [trainers, setTrainers] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selected, setSelected] = useState({ trainer: null, date: '', slot: '', sessionType: 'personal_training', notes: '' });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('book');

  useEffect(() => {
    apiClient.get('/trainer-bookings/trainers').then(r => setTrainers(r.data.data)).catch(() => {});
    apiClient.get('/trainer-bookings/my?upcoming=true').then(r => setMyBookings(r.data.data)).catch(() => {});
  }, []);

  const fetchAvailability = async (trainerId, date) => {
    try {
      const res = await apiClient.get(`/trainer-bookings/trainer/${trainerId}/availability?date=${date}`);
      setBookedSlots(res.data.data.bookedSlots?.map(s => s.startTime) || []);
    } catch {}
  };

  const handleDateSelect = (date) => {
    setSelected(s => ({ ...s, date, slot: '' }));
    if (selected.trainer) fetchAvailability(selected.trainer._id, date);
  };

  const handleBook = async () => {
    if (!selected.trainer || !selected.date || !selected.slot) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const endHour = String(parseInt(selected.slot.split(':')[0]) + 1).padStart(2, '0');
      await apiClient.post('/trainer-bookings', {
        trainerId: selected.trainer._id,
        date: selected.date,
        startTime: selected.slot,
        endTime: `${endHour}:00`,
        sessionType: selected.sessionType,
        notes: selected.notes,
      });
      toast.success('Session booked successfully!');
      setStep('trainers');
      setSelected({ trainer: null, date: '', slot: '', sessionType: 'personal_training', notes: '' });
      const res = await apiClient.get('/trainer-bookings/my?upcoming=true');
      setMyBookings(res.data.data);
      setTab('my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await apiClient.patch(`/trainer-bookings/${id}/status`, { status: 'cancelled' });
      setMyBookings(b => b.filter(x => x._id !== id));
      toast.success('Booking cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '20px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>👨‍💼 Book a Trainer</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Schedule 1-on-1 sessions with certified trainers</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#111', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['book', 'my'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: tab === t ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : 'transparent',
              color: tab === t ? '#fff' : '#666', transition: 'all 0.2s',
            }}>
              {t === 'book' ? '📅 Book Session' : `📋 My Bookings (${myBookings.length})`}
            </button>
          ))}
        </div>

        {tab === 'book' && (
          <div>
            {step === 'trainers' && (
              <>
                <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>Choose a Trainer</h2>
                {trainers.length === 0 ? (
                  <EmptyState icon="👨‍💼" text="No trainers available right now" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {trainers.map(t => (
                      <motion.div key={t._id} whileTap={{ scale: 0.98 }} onClick={() => { setSelected(s => ({ ...s, trainer: t })); setStep('schedule'); }}
                        style={{
                          background: '#111', border: `1px solid ${selected.trainer?._id === t._id ? '#9d00ff' : '#222'}`,
                          borderRadius: 14, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                        <Avatar name={t.name} url={t.profilePicture} size={52} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 4px' }}>{t.name}</p>
                          <p style={{ color: '#9d00ff', fontSize: 13, margin: '0 0 4px' }}>{t.specialization || 'General Trainer'}</p>
                          {t.certifications?.length > 0 && (
                            <p style={{ color: '#555', fontSize: 12, margin: 0 }}>{t.certifications.slice(0, 2).join(' · ')}</p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {t.rating > 0 && <p style={{ color: '#ffd700', fontWeight: 700, margin: 0 }}>⭐ {t.rating.toFixed(1)}</p>}
                          <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>{t.totalRatings || 0} reviews</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 'schedule' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep('trainers')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>← Back</button>
                  <p style={{ color: '#9d00ff', fontWeight: 600, margin: 0 }}>Booking with {selected.trainer?.name}</p>
                </div>

                <FormGroup label="Session Type">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {SESSION_TYPES.map(s => (
                      <div key={s.key} onClick={() => setSelected(x => ({ ...x, sessionType: s.key }))} style={{
                        padding: 12, background: selected.sessionType === s.key ? 'rgba(157,0,255,0.15)' : '#1a1a1a',
                        border: `1px solid ${selected.sessionType === s.key ? '#9d00ff' : '#333'}`,
                        borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 24 }}>{s.icon}</div>
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                        <div style={{ color: '#555', fontSize: 11 }}>{s.duration}</div>
                      </div>
                    ))}
                  </div>
                </FormGroup>

                <FormGroup label="Select Date">
                  <input type="date" min={tomorrow} max={maxDate} value={selected.date} onChange={e => handleDateSelect(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
                </FormGroup>

                {selected.date && (
                  <FormGroup label="Select Time Slot">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button key={slot} onClick={() => !isBooked && setSelected(s => ({ ...s, slot }))} disabled={isBooked}
                            style={{
                              padding: '8px 14px', borderRadius: 8, border: `1px solid ${selected.slot === slot ? '#9d00ff' : '#333'}`,
                              background: selected.slot === slot ? 'rgba(157,0,255,0.2)' : isBooked ? '#0d0d0d' : '#1a1a1a',
                              color: isBooked ? '#333' : selected.slot === slot ? '#9d00ff' : '#ccc',
                              cursor: isBooked ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600,
                            }}>
                            {slot} {isBooked && '×'}
                          </button>
                        );
                      })}
                    </div>
                  </FormGroup>
                )}

                <FormGroup label="Notes (optional)">
                  <textarea value={selected.notes} onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))} placeholder="Any specific focus areas or health concerns..."
                    rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                </FormGroup>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleBook} disabled={loading || !selected.date || !selected.slot}
                  style={{
                    width: '100%', padding: 16, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                    background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', color: '#fff', fontSize: 17, fontWeight: 700,
                    opacity: (!selected.date || !selected.slot) ? 0.5 : 1,
                  }}>
                  {loading ? 'Booking...' : 'Confirm Booking ✓'}
                </motion.button>
              </>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div>
            {myBookings.length === 0 ? (
              <EmptyState icon="📅" text="No upcoming bookings. Book your first session!" onAction={() => setTab('book')} actionLabel="Book Now" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myBookings.map(b => (
                  <div key={b._id} style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <Avatar name={b.trainerId?.name} url={b.trainerId?.profilePicture} size={44} />
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, margin: 0 }}>{b.trainerId?.name}</p>
                        <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{SESSION_TYPES.find(s => s.key === b.sessionType)?.label}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: '#888', fontSize: 13 }}>
                      <span>📅 {b.date}</span>
                      <span>⏰ {b.startTime} - {b.endTime}</span>
                    </div>
                    {b.status === 'pending' && (
                      <button onClick={() => cancelBooking(b._id)} style={{ marginTop: 12, padding: '6px 14px', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Avatar = ({ name, url, size = 40 }) => {
  const colors = ['#9d00ff', '#00d4ff', '#ff6b35', '#ffd700'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = { pending: ['#ffd700', '#2a2000'], confirmed: ['#00c853', '#001a00'], cancelled: ['#ff4444', '#1a0000'], completed: ['#9d00ff', '#1a0028'] };
  const [color, bg] = map[status] || ['#888', '#111'];
  return (
    <div style={{ marginLeft: 'auto', padding: '3px 10px', background: bg, border: `1px solid ${color}`, borderRadius: 20, color, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </div>
  );
};

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: '#888', fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
  </div>
);

const EmptyState = ({ icon, text, onAction, actionLabel }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
    <p style={{ fontSize: 48, marginBottom: 12 }}>{icon}</p>
    <p style={{ fontSize: 16, marginBottom: onAction ? 20 : 0 }}>{text}</p>
    {onAction && (
      <button onClick={onAction} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
        {actionLabel}
      </button>
    )}
  </div>
);
