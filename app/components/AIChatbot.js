/**
 * @file AI Chatbot Component
 * @description A friendly chat interface designed to help students with their work in a fun and engaging way.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * AIChatbot Component
 * @component
 * @description A floating chat interface that helps students with Polypad usage.
 * Uses OpenAI's API to provide contextual assistance.
 * 
 * Features:
 * - Real-time chat interface
 * - Message history
 * - Loading states
 * - Auto-scroll to latest messages
 * - Minimizable window
 * 
 * State Management:
 * - messages: Chat message history
 * - input: Current input value
 * - isLoading: API request loading state
 * - isMinimized: Chat window minimized state
 * 
 * @returns {JSX.Element} The chat interface component
 */
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize conversation when component mounts
  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' })
        });
        const data = await response.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };

    if (isOpen && !conversationId) {
      initConversation();
    }
  }, [isOpen, conversationId]);

  // Load conversation history when opening chat
  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && conversationId) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'history',
              conversationId 
            })
          });
          const data = await response.json();
          if (data.messages) {
            setMessages(data.messages.map(msg => ({
              role: msg.role || 'assistant',
              content: msg.content
            })));
          }
        } catch (error) {
          console.error('Error loading conversation history:', error);
        }
      }
    };

    loadHistory();
  }, [isOpen, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          conversationId,
          message: userMessage  // Send only the user's message without any additional context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const data = JSON.parse(chunk);
          accumulatedContent += data.content;
          
          assistantMessage = {
            role: data.role || 'assistant',
            content: accumulatedContent
          };
          
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
              return newMessages;
            } else {
              return [...newMessages, assistantMessage];
            }
          });
        } catch (error) {
          console.error('Error parsing chunk:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'m having trouble connecting right now. Could you try asking your question again?' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2 animate-bounce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-medium">Chat with Helper Bot! 🤖</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl w-96 h-[600px] flex flex-col overflow-hidden border-2 border-purple-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-500 text-xl">🤖</span>
              </div>
              <h3 className="font-bold text-lg">Helper Bot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-pink-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white text-gray-800 border-2 border-purple-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl p-3 border-2 border-purple-100 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t-2 border-purple-100 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 rounded-xl border-2 border-purple-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-purple-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-medium shadow-sm"
              >
                Send ✨
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 