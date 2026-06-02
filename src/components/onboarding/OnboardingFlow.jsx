import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '../../assets/logos/aurafit-logo.png';

const STEPS = [
  { id: 'welcome', title: 'Welcome', subtitle: "Let's personalize your journey" },
  { id: 'basics', title: 'About you', subtitle: 'A little bit about yourself' },
  { id: 'goals', title: 'Your goal', subtitle: 'What are you training for?' },
  { id: 'experience', title: 'Your level', subtitle: 'How fit are you right now?' },
  { id: 'referral', title: 'Referral', subtitle: 'Know someone at AuraFit?' },
  { id: 'complete', title: "You're in!", subtitle: 'Welcome to the AuraFit family' },
];

const GOALS = [
  { key: 'weight_loss', label: 'Lose Weight', icon: '🔥', desc: 'Burn fat, feel lighter and more energetic' },
  { key: 'muscle_gain', label: 'Build Muscle', icon: '💪', desc: 'Get stronger, bigger, more powerful' },
  { key: 'endurance', label: 'Boost Endurance', icon: '🏃', desc: 'Run farther, last longer, breathe easier' },
  { key: 'flexibility', label: 'Flexibility', icon: '🧘', desc: 'Move better, reduce pain, find calm' },
  { key: 'general_fitness', label: 'General Fitness', icon: '⚡', desc: 'Overall health, energy, and vitality' },
];

const LEVELS = [
  { key: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting out — welcome aboard' },
  { key: 'intermediate', label: 'Intermediate', icon: '⚡', desc: 'Training regularly, ready to level up' },
  { key: 'advanced', label: 'Advanced', icon: '🏆', desc: 'Serious athlete, chasing peak performance' },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.98 }),
};

export default function OnboardingFlow() {
  const { user, updateUser, apiClient } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    gender: '',
    dateOfBirth: '',
    fitnessGoal: '',
    experienceLevel: '',
    referralCode: '',
    phone: user?.phone || '',
  });
  const [earnedBadges, setEarnedBadges] = useState([]);

  const totalSteps = STEPS.length - 1; // exclude completion screen
  const progress = (step / (totalSteps - 1)) * 100;

  const goNext = () => { setDir(1); setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 0)); };
  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/onboarding/complete', data);
      updateUser({ onboardingCompleted: true, ...res.data.data });
      setEarnedBadges(res.data.achievements || []);
      toast.success(`+${res.data.pointsEarned} points earned! 🎉`);
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
      background: 'var(--surface-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-5)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(157,0,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 12, padding: '7px 16px',
          display: 'inline-flex', alignItems: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
        }}>
          <img src={logoImg} alt="AuraFit" style={{ height: 40, width: 'auto' }} />
        </div>
      </motion.div>

      {/* Progress */}
      {step > 0 && step < totalSteps && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ width: '100%', maxWidth: 'var(--container-sm)', marginBottom: 'var(--space-6)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              Step {step} of {totalSteps - 1}
            </span>
            <span style={{ color: 'var(--brand-purple)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--surface-overlay)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--brand-gradient)', borderRadius: 'var(--radius-pill)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 'var(--container-sm)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden', minHeight: 420,
        boxShadow: 'var(--shadow-xl), 0 0 0 1px var(--border-subtle)',
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
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: 'clamp(28px, 5vw, 48px)' }}
          >
            {/* Step header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 var(--space-1)' }}>
                {STEPS[step].subtitle}
              </p>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '0 0 var(--space-6)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {STEPS[step].title}
              </h2>
            </motion.div>

            {step === 0 && <WelcomeStep name={user?.name} onNext={goNext} />}
            {step === 1 && <BasicsStep data={data} set={set} onNext={goNext} onBack={goPrev} />}
            {step === 2 && <GoalsStep goals={GOALS} selected={data.fitnessGoal} onSelect={v => set('fitnessGoal', v)} onNext={goNext} onBack={goPrev} />}
            {step === 3 && <LevelStep levels={LEVELS} selected={data.experienceLevel} onSelect={v => set('experienceLevel', v)} onNext={handleComplete} onBack={goPrev} loading={loading} />}
            {step === 4 && <ReferralStep value={data.referralCode} onChange={v => set('referralCode', v)} onNext={handleComplete} onBack={goPrev} loading={loading} />}
            {step === STEPS.length - 1 && <CompleteStep badges={earnedBadges} name={user?.name} onFinish={() => navigate('/dashboard')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WelcomeStep({ name, onNext }) {
  const features = [
    { icon: '🤖', text: 'AI-generated workouts' },
    { icon: '🥗', text: 'Personalized nutrition' },
    { icon: '🏆', text: 'Gamified achievements' },
    { icon: '📊', text: 'Progress analytics' },
  ];

  return (
    <div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
        style={{
          width: 80, height: 80, borderRadius: 'var(--radius-xl)',
          background: 'var(--brand-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 'var(--space-5)',
          boxShadow: 'var(--shadow-glow-purple)',
        }}
      >
        💪
      </motion.div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
        Hey <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{name?.split(' ')[0]}</strong>!
        {' '}Answer a few quick questions and we'll unlock your personalized fitness experience — takes under 60 seconds.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {features.map(f => (
          <div key={f.text} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
          }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      <PrimaryBtn onClick={onNext}>Get started →</PrimaryBtn>
    </div>
  );
}

function BasicsStep({ data, set, onNext, onBack }) {
  return (
    <div>
      <FieldLabel>Phone number</FieldLabel>
      <StyledInput
        type="tel" value={data.phone}
        onChange={e => set('phone', e.target.value)}
        placeholder="+91 98765 43210"
      />

      <FieldLabel>Gender</FieldLabel>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {['male', 'female', 'other'].map(g => (
          <SelectChip key={g} selected={data.gender === g} onClick={() => set('gender', g)}>
            {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚥ Other'}
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

function GoalsStep({ goals, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {goals.map((g, i) => (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(g.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: selected === g.key ? 'var(--brand-purple-dim)' : 'var(--surface-overlay)',
              border: `1px solid ${selected === g.key ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)', cursor: 'pointer',
              transition: `all var(--duration-fast) var(--ease-out)`,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
              background: selected === g.key ? 'var(--brand-purple-dim)' : 'var(--surface-high)',
              border: `1px solid ${selected === g.key ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {g.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-base)', margin: '0 0 2px' }}>{g.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>{g.desc}</p>
            </div>
            {selected === g.key && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--brand-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 700,
                }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}

function LevelStep({ levels, selected, onSelect, onNext, onBack, loading }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {levels.map((l, i) => (
          <motion.div
            key={l.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(l.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: selected === l.key ? 'var(--brand-purple-dim)' : 'var(--surface-overlay)',
              border: `1px solid ${selected === l.key ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)', cursor: 'pointer',
              transition: `all var(--duration-fast) var(--ease-out)`,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
              background: selected === l.key ? 'var(--brand-purple-dim)' : 'var(--surface-high)',
              border: `1px solid ${selected === l.key ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {l.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-base)', margin: '0 0 2px' }}>{l.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>{l.desc}</p>
            </div>
            {selected === l.key && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--brand-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 700,
                }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextLabel="Complete setup" nextDisabled={!selected || loading} loading={loading} />
    </div>
  );
}

function ReferralStep({ value, onChange, onNext, onBack, loading }) {
  return (
    <div>
      <div style={{
        background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🎁</span>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0, lineHeight: 'var(--leading-normal)' }}>
          Have a referral code? Both you and your friend earn <strong style={{ color: 'var(--color-gold)' }}>100 bonus points</strong> when you enter it here.
        </p>
      </div>

      <FieldLabel>Referral code (optional)</FieldLabel>
      <StyledInput
        type="text" value={value}
        onChange={e => onChange(e.target.value.toUpperCase())}
        placeholder="e.g. PRIYA2024"
        style={{ letterSpacing: '0.15em', fontSize: 'var(--text-lg)', textAlign: 'center', fontWeight: 700 }}
      />

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Complete setup" loading={loading} />
    </div>
  );
}

function CompleteStep({ badges, name, onFinish }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        style={{ fontSize: 80, marginBottom: 'var(--space-4)', display: 'block' }}
      >
        🎉
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{
          color: 'var(--text-primary)', fontSize: 'var(--text-2xl)',
          fontWeight: 800, margin: '0 0 var(--space-2)',
        }}>
          Welcome, {name?.split(' ')[0]}!
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-normal)' }}>
          Your profile is complete. You've earned{' '}
          <strong style={{ color: 'var(--color-gold)' }}>100 bonus points</strong>{' '}
          to start your journey.
        </p>
      </motion.div>

      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>
            ACHIEVEMENTS UNLOCKED
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {badges.map((b, i) => (
              <motion.div
                key={b.key}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring', bounce: 0.4 }}
                style={{
                  background: 'var(--brand-purple-dim)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'center', minWidth: 80,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{b.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <PrimaryBtn onClick={onFinish}>Go to dashboard →</PrimaryBtn>
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
      width: '100%', padding: '14px',
      background: disabled ? 'var(--surface-high)' : 'var(--brand-gradient)',
      border: 'none', borderRadius: 'var(--radius-md)',
      color: disabled ? 'var(--text-disabled)' : '#fff',
      fontSize: 'var(--text-base)', fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      letterSpacing: '0.01em',
      boxShadow: disabled ? 'none' : 'var(--shadow-glow-purple)',
    }}
  >
    {children}
  </motion.button>
);

const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block', color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  }}>
    {children}
  </label>
);

const StyledInput = ({ style = {}, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%', padding: '12px var(--space-4)',
      background: 'var(--surface-overlay)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-primary)', fontSize: 'var(--text-base)',
      marginBottom: 'var(--space-5)', boxSizing: 'border-box',
      outline: 'none', transition: 'border-color 0.2s ease',
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor = 'var(--brand-purple)'; e.target.style.boxShadow = '0 0 0 3px rgba(157,0,255,0.12)'; }}
    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
  />
);

const SelectChip = ({ selected, onClick, children }) => (
  <motion.div
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    style={{
      flex: 1, padding: '10px var(--space-2)', textAlign: 'center',
      background: selected ? 'var(--brand-purple-dim)' : 'var(--surface-overlay)',
      border: `1px solid ${selected ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)', cursor: 'pointer',
      color: selected ? 'var(--brand-purple)' : 'var(--text-secondary)',
      fontSize: 'var(--text-sm)', fontWeight: selected ? 700 : 500,
      transition: `all var(--duration-fast) var(--ease-out)`,
    }}
  >
    {children}
  </motion.div>
);

const NavRow = ({ onBack, onNext, nextLabel = 'Next →', nextDisabled = false, loading = false }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
    <button
      onClick={onBack}
      style={{
        flexShrink: 0, width: 48, height: 48,
        background: 'var(--surface-overlay)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 20, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      ←
    </button>
    <PrimaryBtn onClick={onNext} disabled={nextDisabled || loading}>
      {loading ? 'Saving...' : nextLabel}
    </PrimaryBtn>
  </div>
);
