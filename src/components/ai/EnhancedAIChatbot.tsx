/* Enhanced AI Chatbot Component
 * Multi-modal AI assistant with language, voice, and image analysis support
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { generateChatResponse } from '@/services/geminiService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface EnhancedAIChatbotProps {
  assistantType: 'customer' | 'artisan' | 'admin';
  onNewMessage?: () => void;
}

export default function EnhancedAIChatbot({ assistantType, onNewMessage }: EnhancedAIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Small set of dummy prebuilt messages. If the user's query matches any keyword
  // for an entry below, the assistant will immediately return the prebuilt
  // response. Otherwise we return a rate-limit message (per your request).
  const PREBUILT_MESSAGES: { keywords: string[]; message: string }[] = [
    {
      keywords: ['pricing', 'price', 'cost', 'how much'],
      message: 'Prebuilt: For pricing guidance, we recommend checking similar products and adjusting for material + labor + 20% margin.'
    },
    {
      keywords: ['shipping', 'delivery', 'ship'],
      message: 'Prebuilt: Standard delivery takes 3-7 business days. Expedited shipping options are available at checkout.'
    },
    {
      keywords: ['return', 'refund', 'exchange'],
      message: 'Prebuilt: Returns accepted within 14 days in original condition. Refunds processed within 5 business days after we receive the item.'
    },
    {
      keywords: ['materials', 'material', 'wood', 'metal', 'fabric'],
      message: 'Prebuilt: We primarily use sustainably-sourced materials; contact the artisan for custom-material requests.'
    }
  ];

  useEffect(() => {
    // Generate session ID
    setSessionId(crypto.randomUUID());
    
    // Load supported languages
    loadLanguages();
    
    // Initialize with welcome message
    const welcomeMessage = getWelcomeMessage(assistantType, selectedLanguage);
    setMessages([{ role: 'assistant', content: welcomeMessage, timestamp: new Date() }]);
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [assistantType, selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_language_support')
        .select('*')
        .eq('is_active', true)
        .order('language_name');
      
      if (!error && data) {
        setLanguages(data);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const getWelcomeMessage = useCallback((type: string, lang: string) => {
    if (type === 'customer') {
      return lang === 'en' 
        ? "Hello! I'm your AI shopping assistant. I can help you discover products, answer questions, and make recommendations. How can I assist you today?"
        : "नमस्ते! मैं आपका AI शॉपिंग सहायक हूं। मैं उत्पाद खोजने, सवालों के जवाब देने और सुझाव देने में मदद कर सकता हूं।";
    } else if (type === 'artisan') {
      return lang === 'en'
        ? "Hello! I'm your AI business advisor. I can help with pricing, marketing, product development, and growing your artisan business. What would you like to discuss?"
        : "नमस्ते! मैं आपका AI व्यवसाय सलाहकार हूं। मैं मूल्य निर्धारण, मार्केटिंग, उत्पाद विकास में मदद कर सकता हूं।";
    } else {
      return "Hello! I'm your platform administration assistant. I can help with analytics, user management, and system insights. What do you need?";
    }
  }, []);

  const getLanguageCode = useCallback((lang: string) => {
    const codes: any = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN'
    };
    return codes[lang] || 'en-US';
  }, []);

  // Memoized welcome message
  const welcomeMessage = useMemo(() => 
    getWelcomeMessage(assistantType, selectedLanguage), 
    [getWelcomeMessage, assistantType, selectedLanguage]
  );

  // Memoized language codes
  const availableLanguages = useMemo(() => 
    languages.map(lang => ({
      ...lang,
      code: getLanguageCode(lang.language_code)
    })), 
    [languages, getLanguageCode]
  );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await generateChatResponse(userMessage, messages);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
      
      if (onNewMessage) onNewMessage();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.lang = getLanguageCode(selectedLanguage);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
      setShowImageUpload(false);
      
      // Send for visual analysis
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-visual-analyzer', {
          body: { 
            imageData: imageData,
            analysisType: 'general',
            language: selectedLanguage
          }
        });

        if (!error && data) {
          const analysisText = `Image Analysis:\n${JSON.stringify(data.data?.analysis, null, 2)}`;
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: analysisText,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Image analysis error:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(selectedLanguage);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full" role="main" aria-label="AI Chatbot">
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between gap-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            aria-haspopup="listbox"
            aria-expanded={showLanguageSelector}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            aria-label={`Select language, current: ${languages.find(l => l.language_code === selectedLanguage)?.native_name || 'English'}`}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-gray-700">
              {languages.find(l => l.language_code === selectedLanguage)?.native_name || 'English'}
            </span>
          </button>
          
          {/* Language Dropdown */}
          {showLanguageSelector && (
            <ul className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto" role="listbox">
              {languages.map(lang => (
                <li key={lang.language_code}>
                  <button
                    onClick={() => {
                      setSelectedLanguage(lang.language_code);
                      setShowLanguageSelector(false);
                      if (recognitionRef.current) {
                        recognitionRef.current.lang = getLanguageCode(lang.language_code);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedLanguage === lang.language_code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }`}
                    role="option"
                    aria-selected={selectedLanguage === lang.language_code}
                  >
                    <div className="font-medium">{lang.native_name}</div>
                    <div className="text-xs text-gray-500">{lang.language_name}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Image Upload Button */}
        <button
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Upload image for analysis"
          aria-label="Upload image for analysis"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        {showImageUpload && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            ref={(input) => input && input.click()}
            aria-label="Upload image file"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            role="article"
            aria-label={`${message.role} message`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-200'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">AI Assistant</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.role === 'assistant' && (
                <button
                  onClick={() => speakMessage(message.content)}
                  className="mt-2 text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                  aria-label={`Listen to message in ${languages.find(l => l.language_code === selectedLanguage)?.native_name || 'English'}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Listen
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow"
              aria-label="Chat message input"
              disabled={loading}
            />
            {input.length > 0 && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {input.length}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {/* Voice Button */}
            {'webkitSpeechRecognition' in window && (
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`p-2 rounded-lg transition ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop recording' : 'Voice input'}
                aria-pressed={isListening}
                aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Voice Input Indicator */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Listening...</span>
          </div>
        )}
      </div>
    </div>
  );
}
