import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Simple bot icon
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
        setMessages([{
            sender: 'bot',
            text: "Hello! I'm your Concert Concierge. Ask me about upcoming shows, artists, or events in your city."
        }]);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // We need to build the history in the format the backend expects
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const res = await axios.post('http://localhost:3000/api/chatbot', {
        message: input,
        history: history,
      });

      const botMessage = { sender: 'bot', text: res.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-8 bg-accent hover:bg-accent-dark text-white p-4 rounded-full shadow-lg z-50 transition-transform duration-300 hover:scale-110"
        aria-label="Toggle Chatbot"
      >
        <BotIcon />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[60vh] bg-secondary border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 bg-gray-800 text-white rounded-t-lg">
            <h3 className="font-bold text-lg">Concert Concierge</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-secondary' : 'bg-gray-700 text-primary'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="my-2 text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-700 text-primary">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSend} className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about concerts..."
                className="flex-1 p-2 bg-gray-700 text-primary rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 bg-accent hover:bg-accent-dark text-white rounded-r-md disabled:bg-gray-600"
                disabled={isLoading}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
