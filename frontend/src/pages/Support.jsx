import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Clock, User } from 'lucide-react';

const Support = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Support Team',
      message: 'Hello! How can we help you today?',
      timestamp: new Date(),
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      author: 'You',
      message: inputValue,
      timestamp: new Date(),
      isUser: true
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate response delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          author: 'Support Team',
          message: 'Thanks for your message. Our team will respond shortly.',
          timestamp: new Date(),
          isUser: false
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <MessageCircle size={36} className="text-cyber-500" />
          Live Support
        </h1>
        <p className="text-dark-400">Get instant help from our support team</p>
      </div>

      {/* Chat Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-dark border-cyber-500/50 h-96 md:h-screen md:max-h-96 flex flex-col"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.isUser && (
                <div className="w-8 h-8 rounded-full bg-cyber-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.isUser
                    ? 'bg-cyber-600 text-white rounded-br-none'
                    : 'bg-dark-700 text-text-primary rounded-bl-none'
                }`}
              >
                <p className="text-sm font-semibold mb-1">{msg.author}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-opacity-70 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {msg.isUser && (
                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-cyber-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} />
              </div>
              <div className="bg-dark-700 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-dark-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-dark-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-dark-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-dark-700 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="input-dark flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="btn-cyber disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Support;
