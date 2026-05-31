import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SUGGESTED = [
  'How do I build muscle faster?',
  'Best workout for weight loss?',
  'How much protein do I need?',
  'Tips for better sleep & recovery',
];

const BOT_AVATAR = '🤖';

export default function FitnessAssistant() {
  const { apiClient, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm AuraBot 💪 Your AI fitness coach. Ask me anything about workouts, nutrition, or recovery!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!weeklyInsight && isAuthenticated) fetchWeeklyInsight();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchWeeklyInsight = async () => {
    try {
      const res = await apiClient.get('/ai-chat/weekly-insight');
      setWeeklyInsight(res.data.data);
    } catch {}
  };

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
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: open ? '#1a1a1a' : 'linear-gradient(135deg, #9d00ff, #00d4ff)',
          color: '#fff', fontSize: 24, cursor: 'pointer',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.4)' : '0 8px 32px rgba(157, 0, 255, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 148, right: 16, zIndex: 997,
              width: 'min(380px, calc(100vw - 32px))',
              maxHeight: '70vh',
              background: '#111', borderRadius: 20,
              border: '1px solid #222',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 18px 14px',
              background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)',
              borderBottom: '1px solid #222',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🤖</div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 15 }}>AuraBot</p>
                <p style={{ color: '#00d4ff', fontSize: 11, margin: 0 }}>● AI Fitness Coach • Always on</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Weekly insight card */}
              {weeklyInsight && messages.length === 1 && (
                <div style={{
                  background: 'linear-gradient(135deg, #1a0a2e, #0a1a2e)',
                  border: '1px solid #9d00ff44',
                  borderRadius: 14, padding: 14, fontSize: 13,
                }}>
                  <p style={{ color: '#9d00ff', fontWeight: 700, margin: '0 0 8px' }}>✨ This Week's Insight</p>
                  <p style={{ color: '#ccc', margin: '0 0 4px' }}>💪 {weeklyInsight.workoutTip}</p>
                  <p style={{ color: '#ccc', margin: '0 0 4px' }}>🥗 {weeklyInsight.nutritionTip}</p>
                  <p style={{ color: '#ffd700', margin: 0 }}>🎯 Goal: {weeklyInsight.weeklyGoal}</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                  {m.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
                    color: '#fff', fontSize: 14, lineHeight: 1.5,
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>🤖</div>
                  <div style={{ background: '#1a1a1a', borderRadius: '16px 16px 16px 4px', padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#9d00ff',
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested */}
            {messages.length === 1 && !loading && (
              <div style={{ padding: '0 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    padding: '5px 11px', borderRadius: 14, border: '1px solid #333',
                    background: '#0a0a0a', color: '#9d00ff', fontSize: 12, cursor: 'pointer',
                    textAlign: 'left', lineHeight: 1.3,
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 14px', borderTop: '1px solid #1a1a1a',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask AuraBot anything..."
                disabled={loading}
                style={{
                  flex: 1, background: '#0a0a0a', border: '1px solid #222',
                  borderRadius: 20, padding: '9px 14px', color: '#fff',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: input.trim() ? 'linear-gradient(135deg, #9d00ff, #00d4ff)' : '#1a1a1a',
                  border: 'none', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
