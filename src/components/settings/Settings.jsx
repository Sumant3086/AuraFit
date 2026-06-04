import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ImageUpload from '../common/ImageUpload';
import SecurityPanel from './SecurityPanel';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'profile', label: '👤 Profile' },
  { key: 'preferences', label: '⚙️ Preferences' },
  { key: 'notifications', label: '🔔 Notifications' },
  { key: 'privacy', label: '🔒 Privacy' },
  { key: 'security', label: '🛡️ Security' },
  { key: 'data', label: '📁 Data & Reports' },
];

export default function Settings() {
  const { user, apiClient, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth?.slice(0,10) || '',
    gender: user?.gender || '',
    fitnessGoal: user?.fitnessGoal || '',
    bio: user?.bio || '',
  });

  // Preferences
  const [prefs, setPrefs] = useState({
    units: user?.preferences?.units || 'metric',
    language: 'en',
    weekStart: 'monday',
  });

  // Notification prefs
  const [notifs, setNotifs] = useState({
    emailWorkout: true,
    emailAchievements: true,
    emailWeeklyReport: true,
    pushEnabled: 'Notification' in window && Notification.permission === 'granted',
  });

  // Password
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwErr, setPwErr] = useState('');

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', profile);
      updateUser(res.data.data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const savePrefs = async () => {
    setSaving(true);
    try {
      await apiClient.put('/auth/profile', { preferences: prefs });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
    setSaving(false);
  };

  const enablePushNotifications = async () => {
    if (!('Notification' in window)) return toast.error('Notifications not supported in this browser');
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifs(p => ({ ...p, pushEnabled: true }));
      toast.success('Push notifications enabled! 🔔');
      new Notification('AuraFit', { body: "You'll now receive fitness reminders!", icon: '/favicon.ico' });
    } else {
      toast.error('Notifications permission denied. Check browser settings.');
    }
  };

  const changePassword = async () => {
    setPwErr('');
    if (!passwords.current || !passwords.newPass) return setPwErr('All fields required');
    if (passwords.newPass !== passwords.confirm) return setPwErr('Passwords do not match');
    if (passwords.newPass.length < 8) return setPwErr('Password must be at least 8 characters');
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully! 🔑');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const downloadReport = async () => {
    try {
      const res = await apiClient.get('/reports/progress', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurafit-progress-${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Progress report downloaded! 📊');
    } catch {
      toast.error('Failed to generate report. Try again.');
    }
  };

  const deleteAccount = () => {
    const confirmed = window.confirm('Are you absolutely sure? This will permanently delete all your data and cannot be undone.');
    if (confirmed) {
      toast.error('Account deletion requires contacting support@aurafit.com for security verification.');
    }
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text-1)', fontSize: 15, fontFamily: 'inherit',
  };

  const labelStyle = { color: 'var(--text-3)', fontSize: 13, marginBottom: 6, display: 'block' };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 700, margin: '0 0 16px', paddingBottom: 8, borderBottom: '1px solid var(--border-1)' }}>{title}</h3>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #111' }}>
      <div>
        <p style={{ color: 'var(--text-2)', fontSize: 15, margin: 0 }}>{label}</p>
        {desc && <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '2px 0 0' }}>{desc}</p>}
      </div>
      <button
        onClick={onChange}
        style={{
          width: 48, height: 26, borderRadius: 13, border: 'none',
          background: value ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#222',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: value ? 24 : 4, transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)', padding: '28px 20px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: 'var(--text-1)', fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>Settings ⚙️</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>Manage your account, preferences, and privacy.</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 60px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: 200, paddingTop: 24, flexShrink: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'block', width: '100%', padding: '11px 14px', marginBottom: 4,
                borderRadius: 10, border: 'none', textAlign: 'left', cursor: 'pointer',
                background: tab === t.key ? '#1a1a1a' : 'transparent',
                color: tab === t.key ? '#fff' : '#555', fontSize: 14,
                borderLeft: tab === t.key ? '3px solid #9d00ff' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 280, paddingTop: 24 }}>

          {/* PROFILE */}
          {tab === 'profile' && (
            <>
            <Section title="Profile Photo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
                <ImageUpload
                  currentImage={user?.profilePicture}
                  initials={user?.name?.[0]?.toUpperCase()}
                  size={80}
                  onUpload={async (url) => {
                    try {
                      const res = await apiClient.put('/auth/profile', { profilePicture: url });
                      updateUser(res.data.data);
                    } catch { toast.error('Failed to save photo'); }
                  }}
                />
                <div>
                  <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 4px' }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '0 0 8px' }}>Click the photo to upload a new one</p>
                  <p style={{ color: '#444', fontSize: 12, margin: 0 }}>Supports JPEG, PNG, WebP (max 5MB)</p>
                </div>
              </div>
            </Section>
            <Section title="Personal Information">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'phone', label: 'Phone Number', type: 'tel' },
                  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))} style={inputStyle}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fitness Goal</label>
                  <select value={profile.fitnessGoal} onChange={e => setProfile(p => ({ ...p, fitnessGoal: e.target.value }))} style={inputStyle}>
                    <option value="">Select goal</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="general">General Fitness</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell the community about yourself..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <button onClick={saveProfile} disabled={saving} style={{
                marginTop: 20, padding: '12px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                border: 'none', borderRadius: 10, color: 'var(--text-1)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </Section>
            </>
          )}

          {/* PREFERENCES */}
          {tab === 'preferences' && (
            <>
              <Section title="Display">
                <Toggle
                  label="Dark Mode"
                  desc="Switch between dark and light theme"
                  value={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Units of Measurement</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['metric', 'imperial'].map(u => (
                      <button
                        key={u}
                        onClick={() => setPrefs(p => ({ ...p, units: u }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                          background: prefs.units === u ? '#9d00ff22' : '#111',
                          border: `1px solid ${prefs.units === u ? '#9d00ff' : '#222'}`,
                          color: prefs.units === u ? '#9d00ff' : '#555', fontSize: 14,
                        }}
                      >
                        {u === 'metric' ? '📐 Metric (kg, cm)' : '📏 Imperial (lbs, in)'}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
              <Section title="Workout">
                <div>
                  <label style={labelStyle}>Week starts on</label>
                  <select value={prefs.weekStart} onChange={e => setPrefs(p => ({ ...p, weekStart: e.target.value }))} style={{ ...inputStyle, maxWidth: 200 }}>
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </Section>
              <button onClick={savePrefs} disabled={saving} style={{
                padding: '12px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                border: 'none', borderRadius: 10, color: 'var(--text-1)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <>
              <Section title="Push Notifications">
                <div style={{
                  padding: 16, background: notifs.pushEnabled ? '#00c85322' : '#1a1a1a',
                  border: `1px solid ${notifs.pushEnabled ? '#00c853' : '#222'}`,
                  borderRadius: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0 }}>{notifs.pushEnabled ? '🔔 Notifications Enabled' : '🔕 Notifications Disabled'}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '4px 0 0' }}>
                      {notifs.pushEnabled ? "You'll receive workout reminders and achievements." : "Enable to get fitness reminders and progress alerts."}
                    </p>
                  </div>
                  {!notifs.pushEnabled && (
                    <button onClick={enablePushNotifications} style={{
                      padding: '9px 16px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                      border: 'none', borderRadius: 10, color: 'var(--text-1)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    }}>
                      Enable
                    </button>
                  )}
                </div>
              </Section>
              <Section title="Email Notifications">
                <Toggle label="Workout Reminders" desc="Daily workout schedule reminders" value={notifs.emailWorkout} onChange={() => setNotifs(p => ({ ...p, emailWorkout: !p.emailWorkout }))} />
                <Toggle label="Achievement Alerts" desc="When you earn badges or level up" value={notifs.emailAchievements} onChange={() => setNotifs(p => ({ ...p, emailAchievements: !p.emailAchievements }))} />
                <Toggle label="Weekly AI Report" desc="Personalized weekly fitness summary" value={notifs.emailWeeklyReport} onChange={() => setNotifs(p => ({ ...p, emailWeeklyReport: !p.emailWeeklyReport }))} />
              </Section>
            </>
          )}

          {/* PRIVACY */}
          {tab === 'privacy' && (
            <Section title="Privacy Settings">
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 8px' }}>🔒 Your Data is Protected</p>
                <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  AuraFit stores your fitness data securely. We never sell your personal information to third parties.
                  Your progress, workout history, and payment data are encrypted and stored on secure servers.
                </p>
              </div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20 }}>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 8px' }}>👁️ Profile Visibility</p>
                <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '0 0 14px' }}>Control who can see your community posts</p>
                <select defaultValue="members-only" style={{ ...inputStyle, maxWidth: 240 }}>
                  <option value="public">🌍 Public</option>
                  <option value="members-only">👥 Members Only</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </Section>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <>
              <Section title="Active Sessions">
                <SecurityPanel />
              </Section>
              <Section title="Change Password">
                {[
                  { key: 'current', label: 'Current Password' },
                  { key: 'newPass', label: 'New Password' },
                  { key: 'confirm', label: 'Confirm New Password' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type="password"
                      value={passwords[f.key]}
                      onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                ))}
                {pwErr && <p style={{ color: '#ff4444', fontSize: 13, margin: '0 0 12px' }}>{pwErr}</p>}
                <button onClick={changePassword} disabled={saving} style={{
                  padding: '12px 28px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                  border: 'none', borderRadius: 10, color: 'var(--text-1)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </Section>

              <Section title="Account Actions">
                <div style={{ background: '#1a0505', border: '1px solid #ff444433', borderRadius: 12, padding: 18 }}>
                  <p style={{ color: '#ff4444', fontWeight: 700, margin: '0 0 6px' }}>⚠️ Danger Zone</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '0 0 14px' }}>
                    Deleting your account is permanent. All your data, progress, and membership will be lost.
                  </p>
                  <button onClick={deleteAccount} style={{
                    padding: '10px 20px', background: 'transparent', border: '1px solid #ff4444',
                    borderRadius: 10, color: '#ff4444', cursor: 'pointer', fontSize: 14,
                  }}>
                    Delete Account
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* DATA & REPORTS */}
          {tab === 'data' && (
            <>
              <Section title="Export Your Data">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <ExportCard
                    icon="📊"
                    title="Progress Report (PDF)"
                    desc="Download your full fitness progress — measurements, attendance, and achievements."
                    action="Download PDF"
                    onClick={downloadReport}
                    accent="#00d4ff"
                  />
                  <ExportCard
                    icon="🏅"
                    title="Achievements & Points History"
                    desc="Export your gamification history and earned badges."
                    action="Coming Soon"
                    onClick={() => toast('This feature is coming soon!', { icon: '🚀' })}
                    accent="#ffd700"
                  />
                  <ExportCard
                    icon="📦"
                    title="Order History"
                    desc="Download all your orders and membership invoices."
                    action="View Orders"
                    onClick={() => window.location.href = '/my-orders'}
                    accent="#9d00ff"
                  />
                </div>
              </Section>

              <Section title="Data Retention">
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    Your data is retained for the duration of your active membership plus 90 days.
                    After account deletion, data is permanently removed within 30 days.
                    We comply with applicable data protection regulations.
                  </p>
                </div>
              </Section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const ExportCard = ({ icon, title, desc, action, onClick, accent }) => (
  <div style={{
    background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14,
    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{ fontSize: 32, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: '0 0 4px', fontSize: 15 }}>{title}</p>
      <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>{desc}</p>
    </div>
    <button onClick={onClick} style={{
      padding: '9px 16px', background: `${accent}22`, border: `1px solid ${accent}44`,
      borderRadius: 10, color: accent, cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0,
    }}>
      {action}
    </button>
  </div>
);

