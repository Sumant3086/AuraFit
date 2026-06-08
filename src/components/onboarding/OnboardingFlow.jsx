import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '../../assets/logos/aurafit-logo.svg';
import { LuArrowLeft, LuArrowRight, LuCheck, LuCalendar, LuDumbbell } from 'react-icons/lu';

/* ── Step definitions ─────────────────────────────────────── */
// Referral step is intentionally removed from primary flow — it belongs
// on the profile page after the member has seen value in the platform.
// Schedule + body data added because the workout generator and nutrition
// calculator need them to produce personalised output on first use.
const STEPS = [
  { id: 'welcome',    title: "Let's get you started",     sub: 'Two minutes. Then your plan is ready.' },
  { id: 'basics',     title: 'About you',                  sub: 'Used to calibrate your plan' },
  { id: 'goals',      title: 'What are you training for?', sub: 'This shapes your entire programme' },
  { id: 'level',      title: 'Where are you right now?',   sub: 'Honest answer builds a better plan' },
  { id: 'schedule',   title: 'How many days a week?',      sub: 'Your availability determines the programme structure' },
  { id: 'numbers',    title: 'Current stats',              sub: 'Used for your nutrition targets — you can skip this' },
  { id: 'ready',      title: "Your plan is ready",         sub: "Here's what to do first" },
];

const GOALS = [
  { key: 'weight_loss',    label: 'Lose body fat',     desc: 'Reduce body fat while maintaining muscle mass' },
  { key: 'muscle_gain',    label: 'Build muscle',      desc: 'Progressive strength training to add size and strength' },
  { key: 'endurance',      label: 'Improve fitness',   desc: 'Cardiovascular capacity, stamina, and general conditioning' },
  { key: 'flexibility',    label: 'Mobility & recovery', desc: 'Movement quality, flexibility, and injury prevention' },
  { key: 'general_fitness', label: 'General health',   desc: 'Balanced fitness — energy, strength, and wellbeing' },
];

const LEVELS = [
  { key: 'beginner',     label: 'Getting started',  desc: "Training fewer than 3 months, or returning after a long break" },
  { key: 'intermediate', label: 'Training regularly', desc: '3–18 months of consistent training' },
  { key: 'advanced',     label: 'Experienced',       desc: 'Over 18 months of structured training' },
];

const TRAINING_DAYS = [2, 3, 4, 5, 6];

const EQUIPMENT = [
  { key: 'full_gym',         label: 'Full gym access',        desc: 'Barbells, cables, machines, and free weights' },
  { key: 'dumbbells',        label: 'Dumbbells only',         desc: 'Adjustable or fixed dumbbells at home or gym' },
  { key: 'bodyweight',       label: 'Bodyweight',             desc: 'No equipment — bodyweight training only' },
  { key: 'resistance_bands', label: 'Resistance bands',       desc: 'Bands with or without additional weights' },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

export default function OnboardingFlow() {
  const { user, updateUser, apiClient } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);
  const [loading, setLoading] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [data, setData] = useState({
    gender: '',
    dateOfBirth: '',
    fitnessGoal: '',
    experienceLevel: '',
    trainingDaysPerWeek: 3,
    equipment: 'full_gym',
    weight: '',
    height: '',
    phone: user?.phone || '',
  });

  const totalInputSteps = STEPS.length - 2; // exclude welcome + ready
  const inputStep = Math.max(0, step - 1);
  const progress = step === 0 ? 0 : Math.round((inputStep / totalInputSteps) * 100);

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));
  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const payload = {
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        fitnessGoal: data.fitnessGoal,
        experienceLevel: data.experienceLevel,
        trainingDaysPerWeek: data.trainingDaysPerWeek,
        equipment: data.equipment,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        phone: data.phone,
      };
      const res = await apiClient.post('/onboarding/complete', payload);
      updateUser({ onboardingCompleted: true, ...res.data.data });
      setEarnedBadges(res.data.achievements || []);
      toast.success(`Profile complete. +${res.data.pointsEarned || 100} points.`);
      goNext();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(16px, 4vw, 40px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}
      >
        <img src={logoImg} alt="AuraFit" style={{ height: 40, width: 40, borderRadius: 10, display: 'inline-block' }} />
      </motion.div>

      {/* Progress bar */}
      {step > 0 && step < STEPS.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ width: '100%', maxWidth: 480, marginBottom: 'var(--sp-5)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600 }}>
              Step {step} of {totalInputSteps}
            </span>
            <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 2, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #6366F1)', borderRadius: 99 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--surface-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 20,
        overflow: 'hidden', minHeight: 400,
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: 'clamp(24px, 5vw, 40px)' }}
          >
            {/* Step header */}
            {step < STEPS.length - 1 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                  {STEPS[step].sub}
                </p>
                <h2 style={{ color: 'var(--text-1)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  {STEPS[step].title}
                </h2>
              </motion.div>
            )}

            {step === 0 && <WelcomeStep name={user?.name} onNext={goNext} />}
            {step === 1 && <BasicsStep data={data} set={set} onNext={goNext} onBack={goPrev} />}
            {step === 2 && <GoalsStep goals={GOALS} selected={data.fitnessGoal} onSelect={v => set('fitnessGoal', v)} onNext={goNext} onBack={goPrev} />}
            {step === 3 && <LevelStep levels={LEVELS} selected={data.experienceLevel} onSelect={v => set('experienceLevel', v)} onNext={goNext} onBack={goPrev} />}
            {step === 4 && <ScheduleStep data={data} set={set} onNext={goNext} onBack={goPrev} />}
            {step === 5 && <NumbersStep data={data} set={set} onNext={handleComplete} onBack={goPrev} loading={loading} />}
            {step === STEPS.length - 1 && <ReadyStep badges={earnedBadges} name={user?.name} data={data} onFinish={() => navigate('/dashboard')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Step: Welcome ────────────────────────────────────────── */
function WelcomeStep({ name, onNext }) {
  return (
    <div>
      <p style={{ color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 'var(--sp-6)', fontSize: 15 }}>
        Hi <strong style={{ color: 'var(--text-1)', fontWeight: 700 }}>{name?.split(' ')[0]}</strong>. Answer five short questions and AuraFit generates a structured training plan and nutrition targets built specifically for you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-6)' }}>
        {[
          { label: 'Training plan', desc: 'Structured weekly programme' },
          { label: 'Nutrition targets', desc: 'Daily calories and macros' },
          { label: 'Class recommendations', desc: 'Sessions that match your goal' },
          { label: 'Progress tracking', desc: 'Weekly review every Monday' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LuCheck size={10} color="var(--green)" strokeWidth={3} />
            </div>
            <div>
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>{f.label}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 6 }}>{f.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <PrimaryBtn onClick={onNext}>Start setup <LuArrowRight size={14} /></PrimaryBtn>
    </div>
  );
}

/* ── Step: Basics ─────────────────────────────────────────── */
function BasicsStep({ data, set, onNext, onBack }) {
  return (
    <div>
      <FieldLabel>Gender</FieldLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {[{ k: 'male', l: 'Male' }, { k: 'female', l: 'Female' }, { k: 'other', l: 'Prefer not to say' }].map(g => (
          <SelectChip key={g.k} selected={data.gender === g.k} onClick={() => set('gender', g.k)}>
            {g.l}
          </SelectChip>
        ))}
      </div>

      <FieldLabel>Date of birth</FieldLabel>
      <StyledInput
        type="date" value={data.dateOfBirth}
        onChange={e => set('dateOfBirth', e.target.value)}
        max={new Date().toISOString().split('T')[0]}
      />

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!data.gender} />
    </div>
  );
}

/* ── Step: Goals ──────────────────────────────────────────── */
function GoalsStep({ goals, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {goals.map((g, i) => (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(g.key)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 16px',
              background: selected === g.key ? 'var(--accent-dim)' : 'var(--surface-3)',
              border: `1px solid ${selected === g.key ? 'var(--accent-border)' : 'var(--border-1)'}`,
              borderRadius: 12, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div>
              <p style={{ color: selected === g.key ? 'var(--text-1)' : 'var(--text-1)', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{g.label}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{g.desc}</p>
            </div>
            {selected === g.key && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuCheck size={11} color="#fff" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}

/* ── Step: Level ──────────────────────────────────────────── */
function LevelStep({ levels, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {levels.map((l, i) => (
          <motion.div
            key={l.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(l.key)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 16px',
              background: selected === l.key ? 'var(--accent-dim)' : 'var(--surface-3)',
              border: `1px solid ${selected === l.key ? 'var(--accent-border)' : 'var(--border-1)'}`,
              borderRadius: 12, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div>
              <p style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{l.label}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{l.desc}</p>
            </div>
            {selected === l.key && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuCheck size={11} color="#fff" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}

/* ── Step: Schedule ───────────────────────────────────────── */
function ScheduleStep({ data, set, onNext, onBack }) {
  return (
    <div>
      <FieldLabel>Training days per week</FieldLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-6)' }}>
        {TRAINING_DAYS.map(n => (
          <SelectChip key={n} selected={data.trainingDaysPerWeek === n} onClick={() => set('trainingDaysPerWeek', n)}>
            {n}
          </SelectChip>
        ))}
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '-12px 0 var(--sp-6)', lineHeight: 1.5 }}>
        {data.trainingDaysPerWeek <= 2 && 'Full-body sessions. Enough to build and maintain fitness.'}
        {data.trainingDaysPerWeek === 3 && 'Push/Pull/Legs or Full-body — the most popular structure.'}
        {data.trainingDaysPerWeek === 4 && 'Upper/Lower split. Balanced frequency with adequate recovery.'}
        {data.trainingDaysPerWeek >= 5 && 'High frequency. Requires careful periodisation to avoid overreaching.'}
      </p>

      <FieldLabel>Available equipment</FieldLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {EQUIPMENT.map(eq => (
          <div
            key={eq.key}
            onClick={() => set('equipment', eq.key)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px',
              background: data.equipment === eq.key ? 'var(--accent-dim)' : 'var(--surface-3)',
              border: `1px solid ${data.equipment === eq.key ? 'var(--accent-border)' : 'var(--border-1)'}`,
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <div>
              <p style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>{eq.label}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{eq.desc}</p>
            </div>
            {data.equipment === eq.key && (
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuCheck size={10} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ── Step: Numbers (optional) ─────────────────────────────── */
function NumbersStep({ data, set, onNext, onBack, loading }) {
  return (
    <div>
      <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 'var(--sp-5)' }}>
        <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Your weight and height are used to calculate your calorie targets and BMI baseline. Both are optional — you can add them from your profile later.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--sp-4)' }}>
        <div>
          <FieldLabel>Weight (kg)</FieldLabel>
          <StyledInput
            type="number" value={data.weight}
            onChange={e => set('weight', e.target.value)}
            placeholder="e.g. 72"
            min="30" max="200"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div>
          <FieldLabel>Height (cm)</FieldLabel>
          <StyledInput
            type="number" value={data.height}
            onChange={e => set('height', e.target.value)}
            placeholder="e.g. 175"
            min="140" max="220"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel={loading ? 'Setting up your plan…' : 'Complete setup'} loading={loading} />
    </div>
  );
}

/* ── Step: Ready (replaces generic "complete") ────────────── */
function ReadyStep({ badges, name, data, onFinish }) {
  const FIRST_STEPS = [
    {
      icon: LuDumbbell,
      title: 'Generate your training plan',
      desc: `${data.trainingDaysPerWeek}-day programme built for ${data.fitnessGoal?.replace('_', ' ') || 'your goal'}`,
      path: '/features',
      color: 'var(--accent)',
    },
    {
      icon: LuCalendar,
      title: 'Browse this week\'s classes',
      desc: 'Book a session that complements your programme',
      path: '/classes',
      color: 'var(--green)',
    },
    {
      icon: LuCheck,
      title: 'Complete your first check-in',
      desc: 'Start your attendance streak from today',
      path: '/checkin',
      color: 'var(--amber)',
    },
  ];

  return (
    <div>
      {/* Achievement earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 14, padding: '16px 18px', marginBottom: 'var(--sp-5)' }}
      >
        <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Profile complete</p>
        <p style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 16, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          {name?.split(' ')[0]}, your plan is configured.
        </p>
        <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          {data.trainingDaysPerWeek} days/week · {data.equipment?.replace('_', ' ')} · {data.fitnessGoal?.replace('_', ' ')}
        </p>
      </motion.div>

      {/* First steps */}
      <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
        Recommended next steps
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {FIRST_STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '11px 14px' }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color === 'var(--accent)' ? 'var(--accent-dim)' : s.color === 'var(--green)' ? 'var(--green-dim)' : 'var(--amber-dim)'}`, border: `1px solid ${s.color === 'var(--accent)' ? 'var(--accent-border)' : s.color === 'var(--green)' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={14} color={s.color} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{s.title}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ marginBottom: 'var(--sp-4)' }}
        >
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Badges earned
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map((b, i) => (
              <motion.div
                key={b.key}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08, type: 'spring', bounce: 0.4 }}
                className="pill pill--accent"
              >
                {b.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <PrimaryBtn onClick={onFinish}>Go to your dashboard <LuArrowRight size={14} /></PrimaryBtn>
      </motion.div>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────────── */
const PrimaryBtn = ({ onClick, children, disabled }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '100%', padding: '13px',
      background: disabled ? 'var(--surface-3)' : 'var(--text-1)',
      border: 'none', borderRadius: 10,
      color: disabled ? 'var(--text-4)' : 'var(--bg)',
      fontSize: 14, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      letterSpacing: '-0.01em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      fontFamily: 'var(--font-sans)',
    }}
  >
    {children}
  </motion.button>
);

const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block', color: 'var(--text-3)',
    fontSize: 11, marginBottom: 8,
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  }}>
    {children}
  </label>
);

const StyledInput = ({ style = {}, ...props }) => (
  <input
    {...props}
    className="field-input"
    style={{ marginBottom: 'var(--sp-5)', ...style }}
  />
);

const SelectChip = ({ selected, onClick, children }) => (
  <motion.div
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    style={{
      flex: 1, padding: '9px 8px', textAlign: 'center',
      background: selected ? 'var(--accent-dim)' : 'var(--surface-3)',
      border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border-1)'}`,
      borderRadius: 10, cursor: 'pointer',
      color: selected ? 'var(--accent)' : 'var(--text-2)',
      fontSize: 13, fontWeight: selected ? 600 : 400,
      transition: 'all 0.15s ease',
    }}
  >
    {children}
  </motion.div>
);

const NavRow = ({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, loading = false }) => (
  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
    <button
      onClick={onBack}
      className="btn btn-secondary"
      style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <LuArrowLeft size={16} strokeWidth={2} />
    </button>
    <PrimaryBtn onClick={onNext} disabled={nextDisabled || loading}>
      {loading ? 'Saving…' : nextLabel}
      {!loading && <LuArrowRight size={14} />}
    </PrimaryBtn>
  </div>
);
