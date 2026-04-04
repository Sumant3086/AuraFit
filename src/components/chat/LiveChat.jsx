import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiUser } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';
import './chat.css';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, connected, sendMessage } = useSocket();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (socket) {
      socket.on('chat-message', (data) => {
        setMessages(prev => [...prev, {
          from: data.from,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: false,
        }]);
        setIsTyping(false);
      });

      socket.on('typing', (data) => {
        setIsTyping(data.isTyping);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat-message');
        socket.off('typing');
      }
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && connected) {
      const newMessage = {
        from: user.id,
        message: inputMessage,
        timestamp: new Date(),
        isOwn: true,
      };

      setMessages(prev => [...prev, newMessage]);
      
      sendMessage('chat-message', {
        to: 'trainer', // In real app, select specific trainer
        message: inputMessage,
        from: user.id,
      });

      setInputMessage('');
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (connected) {
      sendMessage('typing', {
        to: 'trainer',
        isTyping: e.target.value.length > 0,
      });
    }
  };

  return (
    <div className="live-chat-container">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chat-toggle-btn"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiMessageCircle />
            <span className="chat-badge">Live</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <FiUser />
                <div>
                  <h4>Trainer Support</h4>
                  <span className={connected ? 'online' : 'offline'}>
                    {connected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <FiMessageCircle />
                  <p>Start a conversation with your trainer</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-bubble">
                      <p>{msg.message}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
              {isTyping && (
                <motion.div
                  className="typing-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={!connected}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !connected}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSend />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveChat;
