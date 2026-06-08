import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SUGGESTED = [
  'How do I build muscle faster?',
  'Best workout for weight loss?',
  'How much protein do I need?',
  'Tips for better sleep & recovery',
];

export default function FitnessAssistant() {
  const { apiClient, isAuthenticated } = useAuth();
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([
    { role: 'assistant', content: "Hey! I'm AuraBot 💪 Your AI fitness coach. Ask me anything about workouts, nutrition, or recovery!" }
  ]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!weeklyInsight && isAuthenticated) fetchWeeklyInsight();
    return () => clearTimeout(timer);
  }, [open, isAuthenticated, weeklyInsight]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchWeeklyInsight = useCallback(async () => {
    try {
      const res = await apiClient.get('/ai-chat/weekly-insight');
      setWeeklyInsight(res.data.data);
    } catch {}
  }, [apiClient]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const history = messages.slice(-8);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai-chat/message', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Hmm, I had trouble connecting. Try again or check your workout plan in the Features section! 💪"
      }]);
    }
    setLoading(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Fitness Assistant"
        style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 998,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: open ? 'var(--surface-3)' : 'var(--accent)',
          color: open ? 'var(--text-1)' : '#fff',
          fontSize: 22, cursor: 'pointer',
          boxShadow: open ? 'var(--shadow-md)' : 'var(--shadow-glow-purple)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.22s, box-shadow 0.22s, color 0.22s',
          border: '1px solid var(--border-2)',
        }}
      >
        {open ? '✕' : '🤖'}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'fixed', bottom: 144, right: 16, zIndex: 997,
              width: 'min(360px, calc(100vw - 32px))',
              maxHeight: '68vh',
              background: 'var(--surface-2)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-2)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: 'var(--surface-3)',
              borderBottom: '1px solid var(--border-1)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent)', border: '2px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤖</div>
              <div>
                <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 14, letterSpacing: '-0.01em' }}>AuraBot</p>
                <p style={{ color: 'var(--green)', fontSize: 11, margin: 0, fontWeight: 600 }}>● AI Fitness Coach · Always on</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}>

              {/* Weekly insight */}
              {weeklyInsight && messages.length === 1 && (
                <div style={{
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-lg)', padding: 14, fontSize: 13,
                }}>
                  <p style={{ color: 'var(--accent)', fontWeight: 700, margin: '0 0 8px', fontSize: 12 }}>✨ This Week's Insight</p>
                  <p style={{ color: 'var(--text-2)', margin: '0 0 4px', lineHeight: 1.5 }}>💪 {weeklyInsight.workoutTip}</p>
                  <p style={{ color: 'var(--text-2)', margin: '0 0 4px', lineHeight: 1.5 }}>🥗 {weeklyInsight.nutritionTip}</p>
                  <p style={{ color: 'var(--amber)', margin: 0, lineHeight: 1.5 }}>🎯 Goal: {weeklyInsight.weeklyGoal}</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 7 }}>
                  {m.role === 'assistant' && (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '9px 13px', lineHeight: 1.55, fontSize: 13,
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-3)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-1)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-1)',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  }}>🤖</div>
                  <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                          animation: `chat-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length === 1 && !loading && (
              <div style={{ padding: '0 12px 8px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    padding: '5px 10px', borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--accent-border)',
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    fontSize: 11, cursor: 'pointer', textAlign: 'left', lineHeight: 1.35,
                    fontFamily: 'var(--font-sans)',
                    transition: 'background 0.12s',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div style={{
              padding: '10px 12px', borderTop: '1px solid var(--border-1)',
              display: 'flex', gap: 7, alignItems: 'flex-end',
              background: 'var(--surface-2)',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask AuraBot anything…"
                disabled={loading}
                style={{
                  flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-pill)', padding: '9px 14px',
                  color: 'var(--text-1)', fontSize: 13, fontFamily: 'inherit',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: input.trim() ? 'var(--accent)' : 'var(--surface-3)',
                  color: input.trim() ? '#fff' : 'var(--text-4)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'background 0.15s, color 0.15s',
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes chat-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
