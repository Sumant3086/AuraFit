import React, { useState } from 'react';
import Footer from '../footer/Footer';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LuMail, LuClock, LuMapPin, LuSend, LuArrowRight, LuMessageSquare, LuPhone } from 'react-icons/lu';

const ease = [0.16, 1, 0.3, 1];

const TEAM = [
  {
    initials: 'RK',
    name: 'Rajesh Kumar',
    role: 'Facility Manager',
    desc: 'Runs the day-to-day of AuraFit. Responsible for equipment, scheduling, member onboarding, and ensuring every session happens on time. Your first call for anything operational.',
    spec: 'Operations',
    color: '#8B5CF6',
  },
  {
    initials: 'VS',
    name: 'Vikram Singh',
    role: 'Strength & Conditioning Coach',
    desc: 'NSCA-CSCS certified. Programmes barbell-based strength training for members at every level — from first pull to competition prep. Coaches Power Strength and Athletic Conditioning classes.',
    spec: 'Strength Training',
    color: '#F59E0B',
  },
  {
    initials: 'SP',
    name: 'Sneha Patel',
    role: 'Yoga & Mobility Coach',
    desc: '500-hour RYT certified. Teaches vinyasa, restorative, and therapeutic yoga. Also leads the Stretch & Restore and Pilates Core sessions. Works with members recovering from injury.',
    spec: 'Yoga & Mobility',
    color: '#06B6D4',
  },
  {
    initials: 'AR',
    name: 'Arjun Reddy',
    role: 'Boxing Coach',
    desc: 'Competed at state level before turning to coaching. Teaches combinations, defensive footwork, and conditioning. Runs Boxing Fitness classes and takes private pad sessions for all abilities.',
    spec: 'Boxing',
    color: '#EF4444',
  },
  {
    initials: 'KM',
    name: 'Kavya Menon',
    role: 'Martial Arts Coach',
    desc: 'Black belt in Taekwondo. Leads Kickboxing classes with a focus on correct technique before building intensity. Also available for women\'s self-defence workshops.',
    spec: 'Kickboxing',
    color: '#EC4899',
  },
  {
    initials: 'AM',
    name: 'Amit Verma',
    role: 'Cycling & Cardio Coach',
    desc: 'Certified indoor cycling instructor. Designs structured interval sessions for all fitness levels — from recovery rides to max-output sprint sessions. Leads all Indoor Cycling classes.',
    spec: 'Cycling & Cardio',
    color: '#22C55E',
  },
];

const SUPPORT_CHANNELS = [
  { icon: LuMail,          label: 'Email support', value: 'sumantyadav3086@gmail.com', desc: 'Response within 24 hours', href: 'mailto:sumantyadav3086@gmail.com' },
  { icon: LuClock,         label: 'Business hours', value: 'Mon–Sat, 6am–10pm', desc: 'Gym and phone support', href: null },
  { icon: LuMapPin,        label: 'Location', value: 'AuraFit HQ', desc: 'Check the app for your branch', href: null },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Message received! We'll respond within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px, 9vw, 88px) 0 clamp(36px, 5vw, 52px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Contact
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 12px', lineHeight: 1.1 }}>
              Get in touch
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 440, margin: 0, lineHeight: 1.65 }}>
              Questions about membership, the platform, or booking a trainer — we read every message and respond the same business day.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Contact section ───────────────────────────────────── */}
      <div className="container" style={{ padding: 'var(--sp-12) 0' }}>
        <div className="contact-grid">

          {/* ── Contact form ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <h2 style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-row">
                <div className="field">
                  <label className="field-label">Full name</label>
                  <input
                    className="field-input"
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Email address</label>
                  <input
                    className="field-input"
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Subject</label>
                <input
                  className="field-input"
                  type="text"
                  required
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>

              <div className="field">
                <label className="field-label">Message</label>
                <textarea
                  className="field-input"
                  rows={7}
                  required
                  placeholder="Tell us how we can help…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={sending}
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ alignSelf: 'flex-start', opacity: sending ? 0.7 : 1 }}
              >
                <LuSend size={14} strokeWidth={2} />
                {sending ? 'Sending…' : 'Send message'}
              </motion.button>
            </form>
          </motion.div>

          {/* ── Company info ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}
          >
            {/* Support channels */}
            <div>
              <h2 style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Support channels
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SUPPORT_CHANNELS.map(ch => (
                  <div key={ch.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
                    <div className="icon-badge icon-badge--accent">
                      <ch.icon size={15} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ch.label}</p>
                      {ch.href ? (
                        <a href={ch.href} style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 2, wordBreak: 'break-all' }}
                          onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.target.style.color = 'var(--text-1)'}
                        >
                          {ch.value}
                        </a>
                      ) : (
                        <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{ch.value}</p>
                      )}
                      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{ch.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <LuMessageSquare size={15} color="var(--accent)" strokeWidth={1.8} />
                <p style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Response time</p>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                We respond to all messages within <strong style={{ color: 'var(--text-1)' }}>24 hours</strong> on business days. For urgent membership or payment issues, contact us by phone during business hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Team section ──────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border-1)', padding: 'clamp(56px, 8vw, 96px) 0' }}>
        <div className="container">
          <div style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              Our team
            </p>
            <h2 style={{ color: 'var(--text-1)', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 10px' }}>
              The coaches and staff
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, margin: 0, maxWidth: '50ch', lineHeight: 1.6 }}>
              Everyone who runs classes, manages the floor, or takes your booking. Real people with real qualifications.
            </p>
          </div>

          <div className="grid-3">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease, delay: i * 0.07 }}
                className="pf-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Avatar */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${member.color}18`, border: `1px solid ${member.color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: member.color, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em',
                  flexShrink: 0,
                }}>
                  {member.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: '0 0 3px' }}>{member.name}</p>
                  <p style={{ color: member.color, fontSize: 11, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{member.role}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>{member.desc}</p>
                  <span style={{ display: 'inline-block', padding: '3px 9px', background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 999, fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                    {member.spec}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(32px, 6vw, 72px);
          align-items: start;
        }
        @media (max-width: 820px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
