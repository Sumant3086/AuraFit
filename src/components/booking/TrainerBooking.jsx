import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SESSION_TYPES = [
  { key: 'personal_training',    label: 'Personal Training',      desc: 'One-on-one session focused on your programme', duration: '60 min' },
  { key: 'assessment',           label: 'Fitness Assessment',      desc: 'Baseline measurements, movement screen, goal review', duration: '45 min' },
  { key: 'nutrition_consultation', label: 'Nutrition Consultation', desc: 'Macro targets, meal structure, and diet review', duration: '30 min' },
  { key: 'group_session',        label: 'Group Session',           desc: 'Small group training with personalised coaching', duration: '60 min' },
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: 'var(--text-1)', fontSize: 28, fontWeight: 800, margin: 0 }}>👨‍💼 Book a Trainer</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Schedule 1-on-1 sessions with certified trainers</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['book', 'my'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-3)', transition: 'all 0.2s',
            }}>
              {t === 'book' ? '📅 Book Session' : `📋 My Bookings (${myBookings.length})`}
            </button>
          ))}
        </div>

        {tab === 'book' && (
          <div>
            {step === 'trainers' && (
              <>
                <h2 style={{ color: 'var(--text-1)', fontSize: 18, marginBottom: 16 }}>Choose a Trainer</h2>
                {trainers.length === 0 ? (
                  <EmptyState icon="👨‍💼" text="No trainers available right now" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {trainers.map(t => (
                      <motion.div key={t._id} whileTap={{ scale: 0.98 }} onClick={() => { setSelected(s => ({ ...s, trainer: t })); setStep('schedule'); }}
                        style={{
                          background: 'var(--surface-2)', border: `1px solid ${selected.trainer?._id === t._id ? 'var(--accent-border)' : 'var(--border-2)'}`,
                          borderRadius: 14, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                        <Avatar name={t.name} url={t.profilePicture} size={52} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 4px' }}>{t.name}</p>
                          <p style={{ color: 'var(--accent)', fontSize: 13, margin: '0 0 4px' }}>{t.specialization || 'General Trainer'}</p>
                          {t.certifications?.length > 0 && (
                            <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{t.certifications.slice(0, 2).join(' · ')}</p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {t.rating > 0 && <p style={{ color: 'var(--amber)', fontWeight: 700, margin: 0 }}>⭐ {t.rating.toFixed(1)}</p>}
                          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '4px 0 0' }}>{t.totalRatings || 0} reviews</p>
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
                  <button onClick={() => setStep('trainers')} style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text-3)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>← Back</button>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>Booking with {selected.trainer?.name}</p>
                </div>

                <FormGroup label="Session Type">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {SESSION_TYPES.map(s => (
                      <div key={s.key} onClick={() => setSelected(x => ({ ...x, sessionType: s.key }))} style={{
                        padding: 12, background: selected.sessionType === s.key ? 'var(--accent-dim)' : 'var(--surface-3)',
                        border: `1px solid ${selected.sessionType === s.key ? 'var(--accent-border)' : 'var(--border-2)'}`,
                        borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 24 }}>{s.icon}</div>
                        <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{s.duration}</div>
                      </div>
                    ))}
                  </div>
                </FormGroup>

                <FormGroup label="Select Date">
                  <input type="date" min={tomorrow} max={maxDate} value={selected.date} onChange={e => handleDateSelect(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 10, color: 'var(--text-1)', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
                </FormGroup>

                {selected.date && (
                  <FormGroup label="Select Time Slot">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button key={slot} onClick={() => !isBooked && setSelected(s => ({ ...s, slot }))} disabled={isBooked}
                            style={{
                              padding: '8px 14px', borderRadius: 8, border: `1px solid ${selected.slot === slot ? 'var(--accent-border)' : 'var(--border-2)'}`,
                              background: selected.slot === slot ? 'var(--accent-dim)' : isBooked ? 'var(--surface-1)' : 'var(--surface-3)',
                              color: isBooked ? 'var(--text-4)' : selected.slot === slot ? 'var(--accent)' : 'var(--text-2)',
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
                    rows={3} style={{ width: '100%', padding: '12px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 10, color: 'var(--text-1)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                </FormGroup>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleBook} disabled={loading || !selected.date || !selected.slot}
                  style={{
                    width: '100%', padding: 16, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                    background: 'var(--accent)', color: '#fff', fontSize: 17, fontWeight: 700,
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
                  <div key={b._id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <Avatar name={b.trainerId?.name} url={b.trainerId?.profilePicture} size={44} />
                      <div>
                        <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0 }}>{b.trainerId?.name}</p>
                        <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>{SESSION_TYPES.find(s => s.key === b.sessionType)?.label}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-3)', fontSize: 13 }}>
                      <span>📅 {b.date}</span>
                      <span>⏰ {b.startTime} - {b.endTime}</span>
                    </div>
                    {b.status === 'pending' && (
                      <button onClick={() => cancelBooking(b._id)} style={{ marginTop: 12, padding: '6px 14px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
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
  const colors = ['#7c3aed', '#0891b2', '#d97706', '#059669'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.4), flexShrink: 0 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { color: 'var(--amber)',  bg: 'var(--amber-dim)',  border: 'rgba(245,158,11,0.25)' },
    confirmed: { color: 'var(--green)',  bg: 'var(--green-dim)',  border: 'rgba(34,197,94,0.25)' },
    cancelled: { color: 'var(--red)',    bg: 'var(--red-dim)',    border: 'rgba(220,38,38,0.25)' },
    completed: { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent-border)' },
  };
  const s = map[status] || { color: 'var(--text-3)', bg: 'var(--surface-3)', border: 'var(--border-2)' };
  return (
    <div style={{ marginLeft: 'auto', padding: '3px 10px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 20, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </div>
  );
};

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
  </div>
);

const EmptyState = ({ icon, text, onAction, actionLabel }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>{icon}</p>
    <p style={{ fontSize: 15, marginBottom: onAction ? 20 : 0, color: 'var(--text-3)' }}>{text}</p>
    {onAction && (
      <button onClick={onAction} className="btn btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

