import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { ExpertChat } from './components/ExpertChat.tsx';
import { ChatMessage, Theme, Expert } from './types-hybrid';
import { EXPERTS } from './data/experts-hybrid';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentExpert, setCurrentExpert] = useState<Expert>(EXPERTS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [startInput, setStartInput] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Custom Avatars & Themes State
  const [customAvatars, setCustomAvatars] = useState<Record<string, string>>({});
  const [expertThemes, setExpertThemes] = useState<Record<string, string>>({});

  // Load from Local Storage on Mount
  useEffect(() => {
    const savedExpertId = localStorage.getItem('expert_chat_selected_expert_id');
    const savedExpert = EXPERTS.find(e => e.id === savedExpertId) || EXPERTS[0];
    setCurrentExpert(savedExpert);

    // Load Custom Avatars & Themes
    const savedAvatars = localStorage.getItem('expert_chat_custom_avatars');
    if (savedAvatars) {
      try {
        setCustomAvatars(JSON.parse(savedAvatars));
      } catch (e) {}
    }
    
    const savedThemes = localStorage.getItem('expert_chat_expert_themes');
    if (savedThemes) {
      try {
        setExpertThemes(JSON.parse(savedThemes));
      } catch (e) {}
    }

    // Load Messages
    const savedMessages = localStorage.getItem(`expert_chat_history_${savedExpert.id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([{
        id: `welcome-${savedExpert.id}`,
        role: 'model',
        content: savedExpert.welcomeMessage,
        timestamp: new Date(),
      }]);
    }
    setIsInitialized(true);
  }, []);

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectExpert = (expert: Expert) => {
    if (expert.id === currentExpert.id) {
      setIsSidebarOpen(false);
      return;
    }
    setCurrentExpert(expert);
    setIsSidebarOpen(false);
    
    // Load history
    const savedMessages = localStorage.getItem(`expert_chat_history_${expert.id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([{
        id: `welcome-${expert.id}`,
        role: 'model',
        content: expert.welcomeMessage,
        timestamp: new Date(),
      }]);
    }
    localStorage.setItem('expert_chat_selected_expert_id', expert.id);
  };

  const handleStartChat = (expert: Expert, initialMessage?: string) => {
    handleSelectExpert(expert);
    setShowLanding(false);
    if (initialMessage) {
      setStartInput(initialMessage);
    } else {
      setStartInput(undefined);
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
    localStorage.setItem('expert_chat_selected_expert_id', expert.id);
    localStorage.setItem(`expert_chat_history_${expert.id}`, JSON.stringify(normalized));
  };

  // Handlers for Sidebar
  const handleUpdateAvatar = (expertId: string, avatar: string | null) => {
    if (avatar === null) return; // Handle null case if needed
    const newAvatars = { ...customAvatars, [expertId]: avatar };
    setCustomAvatars(newAvatars);
    localStorage.setItem('expert_chat_custom_avatars', JSON.stringify(newAvatars));
  };

  const handleUpdateTheme = (expertId: string, color: string) => {
    const newThemes = { ...expertThemes, [expertId]: color };
    setExpertThemes(newThemes);
    localStorage.setItem('expert_chat_expert_themes', JSON.stringify(newThemes));
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
    <div className={`min-h-screen flex flex-col font-cairo ${theme === 'dark' ? 'dark' : ''}`}>
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

      <ExpertChat 
        key={currentExpert.id}
        expert={currentExpert}
        onBack={() => setShowLanding(true)}
        initialMessages={messages}
        startWithInput={startInput}
      />
    </div>
  );
};

export default App;