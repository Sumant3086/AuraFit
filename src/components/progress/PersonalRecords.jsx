import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuPlus, LuTrendingUp, LuMinus, LuCheck, LuX, LuDumbbell } from 'react-icons/lu';
import Footer from '../footer/Footer';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

/* ── Personal Records ─────────────────────────────────────── */
// Stored in localStorage — no backend API required.
// Format: { exerciseName: [{ weight, reps, date, notes }, ...] }
//
// Why PRs matter for retention:
// "I lifted more than I ever have before" is the most powerful
// engagement signal in strength training. Members who log PRs
// are significantly more likely to return in the next 7 days.

const COMMON_EXERCISES = [
  'Squat', 'Deadlift', 'Bench Press', 'Overhead Press',
  'Barbell Row', 'Pull-ups', 'Romanian Deadlift', 'Hip Thrust',
  'Incline Press', 'Leg Press', 'Cable Row', 'Lat Pulldown',
  'Tricep Pushdown', 'Bicep Curl', 'Face Pull', 'Lunges',
];

const STORAGE_KEY = 'aurafit:personal_records';

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function getTopPR(records, exercise) {
  const sets = records[exercise] || [];
  if (!sets.length) return null;
  // Best by weight, then reps
  return sets.reduce((best, cur) =>
    cur.weight > best.weight || (cur.weight === best.weight && cur.reps > best.reps) ? cur : best
  );
}

function getPreviousPR(records, exercise, currentDate) {
  const sets = (records[exercise] || []).filter(s => s.date < currentDate);
  if (!sets.length) return null;
  return sets.reduce((best, cur) =>
    cur.weight > best.weight || (cur.weight === best.weight && cur.reps > best.reps) ? cur : best
  );
}

function oneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export default function PersonalRecords() {
  const [records, setRecords]       = useState({});
  const [adding, setAdding]         = useState(false);
  const [selected, setSelected]     = useState('');
  const [customEx, setCustomEx]     = useState('');
  const [form, setForm]             = useState({ weight: '', reps: '', notes: '' });
  const [expanded, setExpanded]     = useState(null);
  const [searchEx, setSearchEx]     = useState('');

  useEffect(() => { setRecords(loadRecords()); }, []);

  const exercisesLogged = Object.keys(records).sort();

  const handleAdd = () => {
    const exercise = customEx.trim() || selected;
    if (!exercise) { toast.error('Select or type an exercise'); return; }
    const weight = parseFloat(form.weight);
    const reps   = parseInt(form.reps, 10);
    if (!weight || weight <= 0) { toast.error('Enter a valid weight'); return; }
    if (!reps   || reps <= 0)   { toast.error('Enter valid reps');   return; }

    const newRecord = { weight, reps, date: new Date().toISOString(), notes: form.notes.trim() };
    const updated   = { ...records, [exercise]: [...(records[exercise] || []), newRecord] };
    setRecords(updated);
    saveRecords(updated);

    const prev = getPreviousPR(records, exercise, newRecord.date);
    if (prev && weight > prev.weight) {
      toast.success(`New PR on ${exercise}! ${weight}kg × ${reps} beats ${prev.weight}kg.`);
    } else if (prev && weight === prev.weight && reps > prev.reps) {
      toast.success(`More reps at ${weight}kg — new PR for ${exercise}.`);
    } else {
      toast.success(`${exercise} logged. ${weight}kg × ${reps}.`);
    }

    setAdding(false);
    setSelected('');
    setCustomEx('');
    setForm({ weight: '', reps: '', notes: '' });
  };

  const handleDelete = (exercise, index) => {
    const updated = { ...records, [exercise]: records[exercise].filter((_, i) => i !== index) };
    if (!updated[exercise].length) delete updated[exercise];
    setRecords(updated);
    saveRecords(updated);
  };

  const filteredExercises = COMMON_EXERCISES.filter(e =>
    e.toLowerCase().includes(searchEx.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px,9vw,88px) 0 clamp(36px,5vw,52px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Progress
            </p>
            <h1 style={{ fontSize: 'clamp(26px,5vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 12px', lineHeight: 1.1 }}>
              Personal Records
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px,1.5vw,16px)', maxWidth: 460, margin: '0 0 24px', lineHeight: 1.65 }}>
              Log your best lifts. Every new PR means you're stronger than you were before — that's the only metric that matters in strength training.
            </p>
            <button
              onClick={() => setAdding(true)}
              className="btn btn-primary"
              style={{ gap: 7 }}
            >
              <LuPlus size={15} strokeWidth={2.5} />
              Log a new PR
            </button>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-20)' }}>

        {/* ── Log PR modal / panel ────────────────────── */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease }}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)',
                marginBottom: 'var(--sp-6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
                <h3 style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 700, margin: 0 }}>Log a new PR</h3>
                <button onClick={() => setAdding(false)} className="btn btn-ghost btn-sm" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}>
                  <LuX size={14} />
                </button>
              </div>

              {/* Exercise selector */}
              <div className="field" style={{ marginBottom: 'var(--sp-4)' }}>
                <label className="field-label">Exercise</label>
                <input
                  className="field-input"
                  placeholder="Type to search or enter custom…"
                  value={customEx || searchEx}
                  onChange={e => { setSearchEx(e.target.value); setCustomEx(e.target.value); setSelected(''); }}
                  style={{ marginBottom: 8 }}
                />
                {/* Suggestions */}
                {searchEx && filteredExercises.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {filteredExercises.slice(0, 8).map(ex => (
                      <button
                        key={ex}
                        onClick={() => { setSelected(ex); setCustomEx(ex); setSearchEx(''); }}
                        className={`pill ${selected === ex ? 'pill--accent' : 'pill--default'}`}
                        style={{ cursor: 'pointer', border: 'none', background: selected === ex ? 'var(--accent-dim)' : 'var(--surface-3)' }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
                {/* Common exercises quick-pick */}
                {!searchEx && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {COMMON_EXERCISES.slice(0, 6).map(ex => (
                      <button
                        key={ex}
                        onClick={() => { setSelected(ex); setCustomEx(ex); }}
                        className={`pill ${selected === ex ? 'pill--accent' : 'pill--default'}`}
                        style={{ cursor: 'pointer', border: 'none', background: selected === ex ? 'var(--accent-dim)' : 'var(--surface-3)' }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight + reps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--sp-4)' }}>
                <div className="field">
                  <label className="field-label">Weight (kg)</label>
                  <input className="field-input" type="number" min="1" max="500" placeholder="e.g. 100" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Reps</label>
                  <input className="field-input" type="number" min="1" max="100" placeholder="e.g. 5" value={form.reps} onChange={e => setForm(f => ({ ...f, reps: e.target.value }))} />
                </div>
              </div>

              {/* Estimated 1RM */}
              {form.weight && form.reps && (
                <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 10, padding: '8px 12px', marginBottom: 'var(--sp-4)' }}>
                  <p style={{ color: 'var(--accent)', fontSize: 12, margin: 0, fontWeight: 600 }}>
                    Estimated 1RM: {oneRepMax(parseFloat(form.weight), parseInt(form.reps))}kg (Epley formula)
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="field" style={{ marginBottom: 'var(--sp-5)' }}>
                <label className="field-label">Notes (optional)</label>
                <input className="field-input" placeholder="e.g. Competition grip, paused reps" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setAdding(false); setCustomEx(''); setSelected(''); }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', gap: 7 }}>
                  <LuCheck size={14} strokeWidth={2.5} />
                  Save PR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PR list ────────────────────────────────── */}
        {exercisesLogged.length === 0 ? (
          <div className="empty-state">
            <LuDumbbell size={40} className="empty-state-icon" />
            <p className="empty-state-title">No records yet</p>
            <p className="empty-state-desc">
              Log your first PR to start tracking strength progress. Every new best is evidence of improvement.
            </p>
            <button className="btn btn-secondary" onClick={() => setAdding(true)} style={{ marginTop: 12 }}>
              <LuPlus size={13} strokeWidth={2} /> Log your first PR
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {exercisesLogged.map(exercise => {
              const allSets = records[exercise] || [];
              const best    = getTopPR(records, exercise);
              const isOpen  = expanded === exercise;
              const days    = best ? daysSince(best.date) : 0;
              const orm     = best ? oneRepMax(best.weight, best.reps) : 0;

              return (
                <motion.div
                  key={exercise}
                  layout
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}
                >
                  {/* Exercise header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : exercise)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-4) var(--sp-5)', cursor: 'pointer' }}
                  >
                    <div>
                      <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 15, margin: '0 0 3px', letterSpacing: '-0.01em' }}>{exercise}</p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-2)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {best?.weight}kg × {best?.reps}
                        </span>
                        {orm > 0 && (
                          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>est. 1RM: {orm}kg</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 3 }}>
                        <LuTrendingUp size={12} color="var(--green)" strokeWidth={2} />
                        <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600 }}>{allSets.length} set{allSets.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span style={{ color: 'var(--text-4)', fontSize: 11 }}>
                        {days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`}
                      </span>
                    </div>
                  </div>

                  {/* Expanded history */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        transition={{ duration: 0.22, ease }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid var(--border-1)', padding: 'var(--sp-3) var(--sp-5) var(--sp-4)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[...allSets].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, idx) => {
                              const isTop = s.weight === best?.weight && s.reps === best?.reps && s.date === best?.date;
                              return (
                                <div key={idx} style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '8px 10px',
                                  background: isTop ? 'var(--accent-dim)' : 'var(--surface-3)',
                                  border: `1px solid ${isTop ? 'var(--accent-border)' : 'var(--border-1)'}`,
                                  borderRadius: 8,
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {isTop && <span className="pill pill--accent" style={{ fontSize: 9, padding: '1px 6px' }}>PR</span>}
                                    <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                                      {s.weight}kg × {s.reps}
                                    </span>
                                    {s.notes && <span style={{ color: 'var(--text-3)', fontSize: 11 }}>— {s.notes}</span>}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: 'var(--text-4)', fontSize: 11 }}>{formatDate(s.date)}</span>
                                    <button
                                      onClick={() => handleDelete(exercise, allSets.indexOf(s))}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', padding: 2 }}
                                    >
                                      <LuX size={12} strokeWidth={2} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
