import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ArtisanChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI business advisor for artisans. I can help with pricing strategies, marketing tactics, product development, customer service, and platform features. What would you like help with today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('artisan-chatbot', {
        body: { 
          message: userMessage,
          conversationHistory: updatedMessages.slice(0, -1)
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error: unknown) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pt-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">Artisan AI Assistant</h1>
          <p className="text-text-secondary text-sm sm:text-base">Get expert business advice powered by AI</p>
        </div>

        <div className="bg-secondary rounded-lg border border-border flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-4 py-3 text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'bg-text-primary text-primary'
                      : 'bg-primary border border-border text-text-primary'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-accent flex-shrink-0"></div>
                      <span className="text-xs font-medium text-accent">AI Advisor</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-primary border border-border rounded-lg px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4 sm:p-6 bg-primary">
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about growing your artisan business..."
                rows={2}
                className="flex-1 border border-border rounded-lg px-4 py-2 bg-secondary text-text-primary placeholder-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-accent text-text-primary rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium whitespace-nowrap border border-accent"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-text-tertiary mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {['How do I price my products?', 'Marketing strategy tips', 'How to handle customer reviews?', 'Using platform features'].map((question) => (
            <button
              key={question}
              onClick={() => {
                setInput(question);
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-xs sm:text-sm bg-secondary border border-border hover:border-accent rounded-lg px-3 py-2 text-left transition text-text-primary font-medium"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
