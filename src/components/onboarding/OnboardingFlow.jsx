import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'welcome', title: 'Welcome to AuraFit', subtitle: "Let's personalize your experience" },
  { id: 'basics', title: 'About You', subtitle: 'Tell us a bit about yourself' },
  { id: 'goals', title: 'Your Goals', subtitle: 'What brings you here?' },
  { id: 'experience', title: 'Experience Level', subtitle: 'How fit are you right now?' },
  { id: 'referral', title: 'Referral Code', subtitle: 'Got a code from a friend?' },
  { id: 'complete', title: "You're All Set!", subtitle: 'Welcome to the AuraFit family' },
];

const GOALS = [
  { key: 'weight_loss', label: 'Lose Weight', icon: '🔥', desc: 'Burn fat, feel lighter' },
  { key: 'muscle_gain', label: 'Build Muscle', icon: '💪', desc: 'Get stronger and bigger' },
  { key: 'endurance', label: 'Improve Endurance', icon: '🏃', desc: 'Run farther, last longer' },
  { key: 'flexibility', label: 'Flexibility', icon: '🧘', desc: 'Move better, feel better' },
  { key: 'general_fitness', label: 'General Fitness', icon: '⚡', desc: 'Overall health improvement' },
];

const LEVELS = [
  { key: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting my journey' },
  { key: 'intermediate', label: 'Intermediate', icon: '🌿', desc: 'Workout regularly' },
  { key: 'advanced', label: 'Advanced', icon: '🌳', desc: 'Serious athlete' },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
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

  const goNext = () => { setDir(1); setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 0)); };

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/onboarding/complete', data);
      updateUser({ onboardingCompleted: true, ...res.data.data });
      setEarnedBadges(res.data.achievements || []);
      goNext();
      toast.success(`+${res.data.pointsEarned} points earned!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Arial, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ color: '#9d00ff', fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '2px' }}>AURA FIT</h1>
        <p style={{ color: '#666', fontSize: 14, margin: '4px 0 0' }}>AI-Powered Fitness Platform</p>
      </div>

      {/* Progress bar */}
      {step < STEPS.length - 1 && (
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666', fontSize: 13 }}>Step {step + 1} of {STEPS.length - 1}</span>
            <span style={{ color: '#9d00ff', fontSize: 13 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 4, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #9d00ff, #00d4ff)', borderRadius: 4 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 480, background: '#111', borderRadius: 20,
        border: '1px solid #222', overflow: 'hidden', minHeight: 420,
        boxShadow: '0 20px 60px rgba(157, 0, 255, 0.15)',
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ padding: 40 }}
          >
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
              {STEPS[step].title}
            </h2>
            <p style={{ color: '#666', margin: '0 0 32px', fontSize: 15 }}>{STEPS[step].subtitle}</p>

            {step === 0 && <WelcomeStep name={user?.name} onNext={goNext} />}
            {step === 1 && <BasicsStep data={data} set={set} onNext={goNext} onBack={goPrev} />}
            {step === 2 && <GoalsStep goals={GOALS} selected={data.fitnessGoal} onSelect={v => set('fitnessGoal', v)} onNext={goNext} onBack={goPrev} />}
            {step === 3 && <LevelStep levels={LEVELS} selected={data.experienceLevel} onSelect={v => set('experienceLevel', v)} onNext={handleComplete} onBack={goPrev} loading={loading} />}
            {step === 4 && <ReferralStep value={data.referralCode} onChange={v => set('referralCode', v)} onNext={handleComplete} onBack={goPrev} loading={loading} />}
            {step === STEPS.length - 1 && <CompleteStep badges={earnedBadges} onFinish={() => navigate('/dashboard')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WelcomeStep({ name, onNext }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
      <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: 32 }}>
        Hi <strong style={{ color: '#9d00ff' }}>{name}</strong>! We're excited to have you. Answer a few quick questions to unlock your personalized fitness experience.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {['🤖 AI Workouts', '🥗 Nutrition Plans', '🏆 Achievements', '📊 Analytics'].map(f => (
          <span key={f} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 20, padding: '6px 14px', color: '#ccc', fontSize: 13 }}>{f}</span>
        ))}
      </div>
      <Btn onClick={onNext}>Get Started →</Btn>
    </div>
  );
}

function BasicsStep({ data, set, onNext, onBack }) {
  return (
    <div>
      <Label>Phone Number</Label>
      <Input type="tel" value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="Enter your phone number" />
      <Label>Gender</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['male', 'female', 'other'].map(g => (
          <SelectCard key={g} selected={data.gender === g} onClick={() => set('gender', g)}>
            {g === 'male' ? '👨 Male' : g === 'female' ? '👩 Female' : '⚥ Other'}
          </SelectCard>
        ))}
      </div>
      <Label>Date of Birth</Label>
      <Input type="date" value={data.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!data.gender} />
    </div>
  );
}

function GoalsStep({ goals, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {goals.map(g => (
          <div key={g.key} onClick={() => onSelect(g.key)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: selected === g.key ? 'rgba(157, 0, 255, 0.15)' : '#1a1a1a',
            border: `1px solid ${selected === g.key ? '#9d00ff' : '#333'}`,
            borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 24 }}>{g.icon}</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{g.label}</div>
              <div style={{ color: '#666', fontSize: 13 }}>{g.desc}</div>
            </div>
            {selected === g.key && <span style={{ marginLeft: 'auto', color: '#9d00ff' }}>✓</span>}
          </div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}

function LevelStep({ levels, selected, onSelect, onNext, onBack, loading }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {levels.map(l => (
          <div key={l.key} onClick={() => onSelect(l.key)} style={{
            flex: 1, padding: 16, textAlign: 'center',
            background: selected === l.key ? 'rgba(157, 0, 255, 0.15)' : '#1a1a1a',
            border: `1px solid ${selected === l.key ? '#9d00ff' : '#333'}`,
            borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{l.icon}</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{l.label}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{l.desc}</div>
          </div>
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextLabel="Complete Setup" nextDisabled={!selected || loading} loading={loading} />
    </div>
  );
}

function ReferralStep({ value, onChange, onNext, onBack, loading }) {
  return (
    <div>
      <p style={{ color: '#ccc', marginBottom: 20, lineHeight: 1.6 }}>
        Got a referral code from a friend? Enter it to give them a bonus and boost your start!
      </p>
      <Input type="text" value={value} onChange={e => onChange(e.target.value.toUpperCase())} placeholder="e.g. AFXYZ123 (optional)" style={{ letterSpacing: '2px', fontSize: 18, textAlign: 'center' }} />
      <p style={{ color: '#555', fontSize: 13, marginTop: 8 }}>Leave empty to skip</p>
      <NavRow onBack={onBack} onNext={onNext} nextLabel="Complete Setup" loading={loading} />
    </div>
  );
}

function CompleteStep({ badges, onFinish }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{ fontSize: 72, marginBottom: 16 }}
      >🎉</motion.div>
      <h3 style={{ color: '#9d00ff', fontSize: 20, marginBottom: 8 }}>Profile Complete!</h3>
      <p style={{ color: '#ccc', marginBottom: 24 }}>You've earned <strong style={{ color: '#ffd700' }}>100 bonus points</strong> for completing your profile.</p>
      {badges.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>Achievements Unlocked:</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.key} style={{ background: '#1a1a1a', border: '1px solid #9d00ff', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{b.icon}</div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Btn onClick={onFinish}>Go to Dashboard →</Btn>
    </div>
  );
}

// ── Shared UI primitives ──
const Btn = ({ onClick, children, disabled, variant = 'primary', style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.2s', width: '100%',
    background: disabled ? '#333' : variant === 'primary' ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
    color: disabled ? '#666' : '#fff',
    ...style,
  }}>
    {children}
  </button>
);

const Label = ({ children }) => (
  <label style={{ display: 'block', color: '#888', fontSize: 13, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    {children}
  </label>
);

const Input = ({ style = {}, ...props }) => (
  <input {...props} style={{
    width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333',
    borderRadius: 10, color: '#fff', fontSize: 15, marginBottom: 20, boxSizing: 'border-box',
    outline: 'none', transition: 'border 0.2s',
    ...style,
  }} />
);

const SelectCard = ({ selected, onClick, children }) => (
  <div onClick={onClick} style={{
    flex: 1, padding: '10px 8px', textAlign: 'center',
    background: selected ? 'rgba(157, 0, 255, 0.15)' : '#1a1a1a',
    border: `1px solid ${selected ? '#9d00ff' : '#333'}`,
    borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 14, transition: 'all 0.2s',
  }}>
    {children}
  </div>
);

const NavRow = ({ onBack, onNext, nextLabel = 'Next →', nextDisabled = false, loading = false }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
    <Btn variant="secondary" onClick={onBack} style={{ width: 'auto', flex: '0 0 80px' }}>← Back</Btn>
    <Btn onClick={onNext} disabled={nextDisabled || loading} style={{ flex: 1 }}>
      {loading ? 'Saving...' : nextLabel}
    </Btn>
  </div>
);
