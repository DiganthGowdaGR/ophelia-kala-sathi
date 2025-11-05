// Floating AI Assistant Widget
// Accessible from all pages with intelligent context awareness

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EnhancedAIChatbot from './EnhancedAIChatbot';
import { useAuth } from '@/contexts/AuthContext';

export default function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile } = useAuth();

  // Determine assistant type based on user role
  const getAssistantType = () => {
    if (!user) return 'customer';
    if (profile?.role === 'artisan') return 'artisan';
    if (profile?.role === 'admin') return 'admin';
    return 'customer';
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  const minimizeWidget = () => {
    setIsMinimized(!isMinimized);
  };

  // Portal component for widget
  const widget = (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          aria-label="Open AI Assistant"
        >
          {/* AI Icon */}
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          
          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20"></span>
        </button>
      )}

      {/* Chatbot Widget */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized 
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-6 right-6 w-[28rem] h-[36rem] md:w-[32rem] md:h-[42rem]'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                {!isMinimized && (
                  <div>
                    <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                    <p className="text-white/80 text-xs">
                      {getAssistantType() === 'customer' && 'Shopping Helper'}
                      {getAssistantType() === 'artisan' && 'Business Advisor'}
                      {getAssistantType() === 'admin' && 'Platform Manager'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Minimize Button */}
                <button
                  onClick={minimizeWidget}
                  className="text-white/80 hover:text-white transition p-1 rounded hover:bg-white/10"
                  aria-label={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </button>
                
                {/* Close Button */}
                <button
                  onClick={closeWidget}
                  className="text-white/80 hover:text-white transition p-1 rounded hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chatbot Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <EnhancedAIChatbot 
                  assistantType={getAssistantType()}
                  onNewMessage={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Render portal to body
  return createPortal(widget, document.body);
}
