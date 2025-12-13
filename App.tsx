import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { FormattedText } from './components/FormattedText';
import { streamMessageToGemini } from './services/geminiService';
import { ChatMessage, ChatAttachment, Theme, Expert } from './types';
import { EXPERTS } from './data/experts';
import { Sparkles, TrendingUp, Wallet, Shield, ArrowDown, Info, FileText, List, Lightbulb } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const SUGGESTIONS = [
  { text: "كيف أبدأ؟", icon: <TrendingUp className="w-4 h-4" /> },
  { text: "أعطني خطة عملية", icon: <Wallet className="w-4 h-4" /> },
  { text: "ما هي المخاطر؟", icon: <Shield className="w-4 h-4" /> },
  { text: "نصيحة ذهبية", icon: <Sparkles className="w-4 h-4" /> },
];

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);

  // Default Expert: Dr. Fahad (Money-1)
  const [currentExpert, setCurrentExpert] = useState<Expert>(EXPERTS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Custom Avatars State (Map: expertId -> base64 string)
  const [customAvatars, setCustomAvatars] = useState<Record<string, string>>({});
  // Expert Themes State (Map: expertId -> hex color)
  const [expertThemes, setExpertThemes] = useState<Record<string, string>>({});

  // Initial Message Generator
  const getWelcomeMessage = (expert: Expert): ChatMessage => ({
    id: `welcome-${expert.id}`,
    role: 'model',
    content: expert.welcomeMessage,
    timestamp: new Date(),
  });

  // Load from Local Storage on Mount
  useEffect(() => {
    const savedExpertId = localStorage.getItem('expert_chat_selected_expert_id');
    const savedExpert = EXPERTS.find(e => e.id === savedExpertId) || EXPERTS[0];
    setCurrentExpert(savedExpert);

    const savedMessages = localStorage.getItem(`expert_chat_history_${savedExpert.id}`);
    
    // Load Custom Avatars
    const savedAvatars = localStorage.getItem('expert_chat_custom_avatars');
    if (savedAvatars) {
      try {
        setCustomAvatars(JSON.parse(savedAvatars));
      } catch (e) {
        console.error("Failed to parse custom avatars", e);
      }
    }

    // Load Expert Themes
    const savedThemes = localStorage.getItem('expert_chat_expert_themes');
    if (savedThemes) {
      try {
        setExpertThemes(JSON.parse(savedThemes));
      } catch (e) {
        console.error("Failed to parse expert themes", e);
      }
    }
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to parse chat history", e);
        setMessages([getWelcomeMessage(savedExpert)]);
      }
    } else {
      setMessages([getWelcomeMessage(savedExpert)]);
    }
    setIsInitialized(true);
  }, []);

  // Save to Local Storage on Change
  useEffect(() => {
    if (isInitialized) {
      if (messages.length > 0) {
        localStorage.setItem(`expert_chat_history_${currentExpert.id}`, JSON.stringify(messages));
      }
      localStorage.setItem('expert_chat_selected_expert_id', currentExpert.id);
    }
  }, [messages, currentExpert, isInitialized]);

  // Save Avatars and Themes when changed
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('expert_chat_custom_avatars', JSON.stringify(customAvatars));
      localStorage.setItem('expert_chat_expert_themes', JSON.stringify(expertThemes));
    }
  }, [customAvatars, expertThemes, isInitialized]);

  // Theme Handling
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Scroll Handling
  useEffect(() => {
    const handleScroll = () => {
        const isNotBottom = window.scrollY + window.innerHeight < document.body.scrollHeight - 300;
        setShowScrollBtn(isNotBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  const handleStartChat = (expert: Expert, initialMessage?: string) => {
    handleSelectExpert(expert);
    setShowLanding(false);
    const text = (initialMessage || '').trim();
    if (text.length > 0) {
      // If there's an initial message, send it after a short delay to allow state update
      setTimeout(() => handleSend(text), 100);
    } else {
      // If no initial message, ensure we scroll to bottom to show welcome message
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleImportChat = (payload: { expertId?: string; messages: ChatMessage[] }) => {
    const expert = EXPERTS.find((e) => e.id === payload.expertId) || currentExpert || EXPERTS[0];
    setCurrentExpert(expert);
    setIsSidebarOpen(false);
    setShowLanding(false);

    const normalized = payload.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp instanceof Date ? m.timestamp : new Date((m as any).timestamp || Date.now()),
    }));
    setMessages(normalized);

    try {
      localStorage.setItem('expert_chat_selected_expert_id', expert.id);
      localStorage.setItem(`expert_chat_history_${expert.id}`, JSON.stringify(normalized));
    } catch (e) {
      console.error('Failed to persist imported chat', e);
    }
  };

  const handleSelectExpert = (expert: Expert) => {
    if (expert.id === currentExpert.id) {
      setIsSidebarOpen(false);
      return;
    }

    setCurrentExpert(expert);
    setIsSidebarOpen(false);
    
    // Load history for the new expert
    const savedMessages = localStorage.getItem(`expert_chat_history_${expert.id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsed);
      } catch {
        setMessages([getWelcomeMessage(expert)]);
      }
    } else {
      setMessages([getWelcomeMessage(expert)]);
    }
  };

  const handleUpdateAvatar = (expertId: string, avatarUrl: string | null) => {
    setCustomAvatars(prev => {
      const next = { ...prev };
      if (avatarUrl) {
        next[expertId] = avatarUrl;
      } else {
        delete next[expertId]; // Remove to reset to default emoji
      }
      return next;
    });
  };

  const handleUpdateTheme = (expertId: string, themeColor: string) => {
    setExpertThemes(prev => ({
      ...prev,
      [expertId]: themeColor
    }));
  };

  const handleSend = async (text: string, attachment?: ChatAttachment) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachment: attachment
    };

    const historyForThisSend = [...messages, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Create a placeholder message for streaming
    const aiMsgId = generateId();
    setMessages((prev) => [
      ...prev, 
      {
        id: aiMsgId,
        role: 'model',
        content: '', // Start empty
        timestamp: new Date(),
      }
    ]);

    try {
      const stream = streamMessageToGemini(historyForThisSend, text, currentExpert.systemInstruction, attachment);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, content: fullContent } : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, content: "عذراً، حدث خطأ." } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('هل أنت متأكد من رغبتك في مسح المحادثة لهذا الخبير؟')) {
      const welcome = getWelcomeMessage(currentExpert);
      setMessages([welcome]);
      localStorage.removeItem(`expert_chat_history_${currentExpert.id}`);
    }
  };

  const handleShareChat = async () => {
    const chatText = messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'أنت' : currentExpert.name;
        return `${role}:\n${msg.content}\n`;
      })
      .join('\n------------------\n');

    const shareData = {
      title: `محادثة مع ${currentExpert.name}`,
      text: chatText,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(chatText);
        alert('تم نسخ نص المحادثة إلى الحافظة.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (showLanding) {
      return (
          <LandingPage 
            onSelectExpert={handleStartChat}
            onImportChat={handleImportChat}
            theme={theme}
            toggleTheme={toggleTheme}
          />
      );
  }

  return (
    <div className={`min-h-screen flex flex-col font-cairo ${theme === 'dark' ? 'dark' : ''} print:bg-white`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onClearChat={handleClearChat}
        onShareChat={handleShareChat}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onBack={() => setShowLanding(true)}
        currentExpert={currentExpert}
        customAvatar={customAvatars[currentExpert.id]}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedExpertId={currentExpert.id}
        onSelectExpert={handleSelectExpert}
        customAvatars={customAvatars}
        onUpdateAvatar={handleUpdateAvatar}
        currentExpert={currentExpert}
        expertThemes={expertThemes}
        onUpdateTheme={handleUpdateTheme}
      />

      {/* Main Chat Area */}
      <main className="flex-1 pt-14 sm:pt-20 pb-20 sm:pb-28 px-2 sm:px-4 w-full max-w-3xl mx-auto print:p-0 print:w-full print:max-w-none">
        <div className="space-y-3 sm:space-y-6 print:space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const expertAvatar = customAvatars[currentExpert.id] || currentExpert.avatarUrl;
            const currentTheme = expertThemes[currentExpert.id];
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up print:block print:w-full`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {!isUser && (
                   <div className="hidden sm:flex items-end justify-center mr-2 ml-1 pb-1">
                      {expertAvatar ? (
                         <img src={expertAvatar} alt="Expert" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm" />
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center text-sm border border-primary-light/10">
                           {currentExpert.emoji}
                         </div>
                      )}
                   </div>
                )}
                <div
                  className={`
                    max-w-[92%] sm:max-w-[75%] px-3 py-2.5 sm:px-6 sm:py-5 text-left shadow-sm relative transition-shadow duration-300 group
                    ${isUser 
                      ? `${!currentTheme ? 'bg-accent' : ''} text-white rounded-[16px] sm:rounded-[20px] rounded-tl-none shadow-md print:bg-gray-100 print:border-gray-300 print:text-black print:rounded-lg` 
                      : 'bg-white dark:bg-surface-dark rounded-[16px] sm:rounded-[20px] rounded-tr-none text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm print:bg-white print:border-none print:shadow-none print:text-black print:pl-0'
                    }
                  `}
                  style={isUser && currentTheme ? { backgroundColor: currentTheme } : undefined}
                >
                  <div dir="rtl" className={isUser ? "text-right" : "text-right"}>
                    {/* Render Attachment if exists */}
                    {msg.attachment && (
                      <div className="mb-2 sm:mb-4">
                        {msg.attachment.type.startsWith('image/') ? (
                          <img 
                            src={msg.attachment.data} 
                            alt="uploaded content" 
                            className="rounded-lg max-h-[150px] sm:max-h-[300px] w-auto object-cover border border-gray-200 dark:border-gray-700 print:max-h-[200px]"
                          />
                        ) : (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700">
                             <div className="p-1.5 sm:p-2 bg-primary-light/10 dark:bg-primary-dark/10 rounded-lg">
                               <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light dark:text-primary-dark" />
                             </div>
                             <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-xs sm:text-sm truncate">{msg.attachment.name}</span>
                                <span className="text-[10px] sm:text-xs opacity-70 uppercase">{msg.attachment.type.split('/')[1]}</span>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                    <FormattedText text={msg.content} isUser={isUser} />
                  </div>
                  {/* Timestamp */}
                  <div className={`text-[9px] sm:text-[10px] mt-1 sm:mt-2 opacity-50 font-medium ${isUser ? 'text-left' : 'text-right'} print:text-gray-500`}>
                    {msg.role === 'model' && <span className="print:inline hidden font-bold ml-1">{currentExpert.name}: </span>}
                    {msg.role === 'user' && <span className="print:inline hidden font-bold ml-1">أنت: </span>}
                    {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Quick Actions (AI Only) */}
                  {!isUser && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-1.5 sm:gap-2 print:hidden">
                      <button
                        onClick={() => handleSend("لخص إجابتك السابقة في 3 نقاط رئيسية ومباشرة.")}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-accent/10 hover:text-accent border border-gray-100 dark:border-gray-700 hover:border-accent/20 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 transition-all"
                      >
                        <List className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>TL;DR</span>
                      </button>
                      <button
                        onClick={() => handleSend("اشرح النقاط التي ذكرتها بتفصيل أكثر وأعط أمثلة.")}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-accent/10 hover:text-accent border border-gray-100 dark:border-gray-700 hover:border-accent/20 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 transition-all"
                      >
                        <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>تفاصيل أكثر</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start w-full animate-fade-in-up print:hidden">
              <div className="hidden sm:block w-8 mr-2 ml-1"></div>
              <div className="bg-surface-light dark:bg-surface-dark rounded-[16px] sm:rounded-[20px] rounded-tr-none px-4 py-3 sm:px-6 sm:py-5 border border-white dark:border-gray-700 shadow-sm flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1 sm:ml-2">{currentExpert.name} يكتب</span>
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-bounce ${!expertThemes[currentExpert.id] ? 'bg-accent dark:bg-accent' : ''}`} style={{ animationDelay: '0ms', backgroundColor: expertThemes[currentExpert.id] }}></div>
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-bounce ${!expertThemes[currentExpert.id] ? 'bg-accent dark:bg-accent' : ''}`} style={{ animationDelay: '150ms', backgroundColor: expertThemes[currentExpert.id] }}></div>
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-bounce ${!expertThemes[currentExpert.id] ? 'bg-accent dark:bg-accent' : ''}`} style={{ animationDelay: '300ms', backgroundColor: expertThemes[currentExpert.id] }}></div>
              </div>
            </div>
          )}
          {/* Suggestions Chips - Show only if few messages exist */}
          {messages.length < 3 && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fade-in-up print:hidden" style={{ animationDelay: '300ms' }}>
              {(currentExpert.suggestions && currentExpert.suggestions.length > 0 
                  ? currentExpert.suggestions.map(s => ({ text: s, icon: <Sparkles className="w-4 h-4" /> })) 
                  : SUGGESTIONS
              ).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion.text)}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl hover:border-accent dark:hover:border-accent hover:shadow-md transition-all duration-300 text-right group"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/10 dark:bg-accent/10 flex items-center justify-center text-accent dark:text-accent group-hover:scale-110 transition-transform">
                    {suggestion.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-accent dark:group-hover:text-accent transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          )}
          {/* Disclaimer Footer */}
          <div className="mt-6 sm:mt-12 mb-4 sm:mb-6 flex items-start justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 max-w-xl mx-auto px-4 sm:px-6 text-center leading-relaxed animate-fade-in-up opacity-80 hover:opacity-100 transition-opacity print:text-black print:opacity-100" style={{ animationDelay: '500ms' }}>
             <Info className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 mt-0.5 text-primary-light/50 dark:text-primary-dark/50" />
             <p>
               المعلومات المقدمة هي لأغراض تعليمية وإرشادية فقط ولا تعتبر نصيحة مالية ملزمة. يرجى مراجعة مستشار مالي معتمد قبل اتخاذ قرارات استثمارية كبرى.
             </p>
          </div>
          <div ref={messagesEndRef} />
        </div>
      </main>
      {/* Scroll to Bottom Button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 left-4 z-40 p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all hover:scale-110 active:scale-95 animate-fade-in-up print:hidden"
          title="الانتقال للأسفل"
        >
            <ArrowDown className="w-5 h-5" />
        </button>
      )}
      <InputArea onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

export default App;