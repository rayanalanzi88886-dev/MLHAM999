import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Bot, Sparkles, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Expert, ChatMessage, ChatAttachment, UserUsageStats } from '../types-hybrid';
import { callUnifiedAPI, usageTracker } from '../services/unified-ai';
import { FormattedText } from './FormattedText';
import { InputArea } from './InputArea';

interface ExpertChatProps {
  expert: Expert;
  onBack: () => void;
  initialMessages?: ChatMessage[];
  startWithInput?: string;
}

export const ExpertChat: React.FC<ExpertChatProps> = ({ 
  expert, 
  onBack,
  initialMessages = [],
  startWithInput
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [usageStats, setUsageStats] = useState<UserUsageStats>(usageTracker.getStats());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (startWithInput && !hasStartedRef.current) {
      hasStartedRef.current = true;
      handleSendMessage(startWithInput, []);
    }
  }, [startWithInput]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`expert_chat_history_${expert.id}`, JSON.stringify(messages));
    }
  }, [messages, expert.id]);

  useEffect(() => {
    setUsageStats(usageTracker.getStats());
  }, [expert.id]);

  const handleSendMessage = async (text: string, attachments: ChatAttachment[]) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      attachment: attachments[0],
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await callUnifiedAPI(
        [...messages, userMsg],
        expert,
        attachments
      );

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.content,
        timestamp: new Date(),
        modelUsed: response.modelUsed,
        cost: response.cost
      };

      setMessages(prev => [...prev, modelMsg]);
      setUsageStats(usageTracker.getStats());

    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const extractSummaryAndDetails = (content: string) => {
    // تقسيم النص إلى فقرات
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    // إذا كان النص قصير (أقل من 200 حرف)، لا حاجة للتقسيم
    if (content.length < 200) {
      return { summary: content, details: '' };
    }
    
    // الملخص: أول فقرة أو أول 150 حرف
    let summary = paragraphs[0] || '';
    if (summary.length > 150) {
      summary = summary.substring(0, 150) + '...';
    }
    
    // التفاصيل: باقي المحتوى
    const details = paragraphs.slice(1).join('\n\n');
    
    return { summary, details };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion, []);
  };

  const handleClearChat = () => {
    localStorage.removeItem(`expert_chat_history_${expert.id}`);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 safe-area-inset">
      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          {/* Right side - Back button & Expert info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button 
              onClick={onBack} 
              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              aria-label="العودة"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <button 
              onClick={handleClearChat} 
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              title="مسح المحادثة"
            >
              🗑️ مسح
            </button>
            
            <div className="relative flex-shrink-0">
              <span className="text-2xl sm:text-3xl">{expert.emoji}</span>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                expert.apiProvider === 'claude' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                {expert.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {expert.title}
              </p>
            </div>
          </div>

          {/* Left side - Stats */}
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 ml-2">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">التكلفة:</span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                ${usageStats.totalCost.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">الرسائل:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {usageStats.totalCalls}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile stats bar */}
        <div className="sm:hidden px-3 pb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>التكلفة: <span className="text-green-600 font-bold">${usageStats.totalCost.toFixed(4)}</span></span>
          <span>الرسائل: <span className="text-blue-600 font-bold">{usageStats.totalCalls}</span></span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            expert.apiProvider === 'claude' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          }`}>
            {expert.apiProvider === 'claude' ? 'Claude Haiku' : 'Gemini Flash'}
          </span>
        </div>
      </div>

      {/* ===== MESSAGES AREA ===== */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl sm:text-4xl">{expert.emoji}</span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {expert.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {expert.title}
                  </p>
                </div>
              </div>
              
              <div 
                className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: expert.welcomeMessage }}
              />
            </div>

            {/* Quick Suggestions - داخل رسالة الترحيب */}
            {expert.suggestions && expert.suggestions.length > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">جرّب هذه الأسئلة:</p>
                <div className="flex flex-wrap gap-2">
                  {expert.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => {
          const isLastModelMessage = msg.role === 'model' && 
            index === messages.length - 1 && 
            !msg.isError &&
            expert.suggestions && 
            expert.suggestions.length > 0;
          
          return (
            <React.Fragment key={msg.id}>
              <div 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ${
                  isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm px-3 sm:px-4 py-2.5 sm:py-3 hover:shadow-lg' 
                    : msg.isError
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-bl-sm px-3 sm:px-4 py-2.5 sm:py-3'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 hover:shadow-md'
                }`}>
              {/* Message content */}
              {msg.role === 'model' && !msg.isError && msg.content.length > 200 ? (
                <>
                  {/* ملخص TL;DR */}
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2">
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">ملخص (TL;DR)</span>
                    </div>
                    <FormattedText 
                      text={extractSummaryAndDetails(msg.content).summary} 
                      isUser={false} 
                    />
                  </div>

                  {/* زر التفاصيل */}
                  {extractSummaryAndDetails(msg.content).details && (
                    <>
                      <button
                        onClick={() => toggleMessageExpansion(msg.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all border border-blue-200 dark:border-blue-800"
                      >
                        {expandedMessages.has(msg.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>إخفاء التفاصيل</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>عرض التفاصيل الكاملة</span>
                          </>
                        )}
                      </button>

                      {/* التفاصيل الكاملة */}
                      {expandedMessages.has(msg.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <FormattedText 
                            text={extractSummaryAndDetails(msg.content).details} 
                            isUser={false} 
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <FormattedText 
                  text={msg.content} 
                  isUser={msg.role === 'user'} 
                />
              )}
              
              {/* Message footer */}
              {msg.role === 'model' && !msg.isError && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>
                      {msg.modelUsed?.includes('haiku') ? '⚡ Haiku' : 
                       msg.modelUsed?.includes('sonnet') ? '🚀 Sonnet' : 
                       msg.modelUsed?.includes('gemini') ? '✨ Gemini' : 'AI'}
                    </span>
                    {msg.cost !== undefined && (
                      <span className="text-green-600 dark:text-green-400">
                        ${msg.cost.toFixed(5)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="نسخ"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              )}

              {/* Error icon */}
              {msg.isError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>خطأ في الاتصال</span>
                </div>
              )}
            </div>
          </div>
          
          {/* عرض الأسئلة السريعة بعد آخر رد من الخبير */}
          {isLastModelMessage && !isLoading && (
            <div className="max-w-[85%] sm:max-w-[75%] mx-auto mt-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    أسئلة مقترحة للمتابعة:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expert.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl border border-blue-300 dark:border-blue-700 text-gray-800 dark:text-gray-200 transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
        );
      })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== SUGGESTIONS BAR ===== */}
      {expert.suggestions && expert.suggestions.length > 0 && messages.length === 0 && (
        <div className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">اقتراحات:</span>
            </div>
            {expert.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== INPUT AREA ===== */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 py-3 sm:px-4 sm:py-4 safe-area-inset-bottom">
        <InputArea 
          onSend={(text, attachment) => handleSendMessage(text, attachment ? [attachment] : [])} 
          disabled={isLoading}
          placeholder={`اسأل ${expert.name}...`}
        />
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        @media (max-width: 640px) {
          .safe-area-inset {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          .safe-area-inset-bottom {
            padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
          }
        }

        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbar but keep functionality */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }

        /* Animation delays */
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5rem); }
        }
      `}</style>
    </div>
  );
};
