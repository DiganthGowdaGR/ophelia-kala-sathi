// Artisan Chatbot Page - AI assistant for artisans
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';

export default function ArtisanChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI business advisor for artisans. I can help with pricing strategies, marketing tactics, product development, customer service, and platform features. What would you like help with today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('artisan-chatbot', {
        body: { message: userMessage }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-h1 font-bold text-text-primary mb-2">Artisan AI Assistant</h1>
          <p className="text-h3 text-text-secondary">Get expert business advice powered by AI</p>
        </div>

        <div className="bg-background rounded-lg shadow-xl flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-text-primary'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-medium text-text-secondary">AI Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-lg px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about growing your artisan business..."
                rows={2}
                className="flex-1 border border-border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition disabled:opacity-50 uppercase tracking-button"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-text-tertiary mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['How do I price my products?', 'Marketing strategy tips', 'How to handle customer reviews?', 'Using platform features'].map((question) => (
            <button
              key={question}
              onClick={() => {
                setInput(question);
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-sm bg-background border border-border hover:border-accent rounded-lg px-3 py-2 text-left transition"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
