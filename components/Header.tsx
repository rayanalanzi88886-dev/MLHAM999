import React from 'react';
import { Moon, Sun, Trash2, Share2, Download, Menu, ArrowRight } from 'lucide-react';
import { Theme, Expert } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onClearChat: () => void;
  onShareChat: () => void;
  onOpenSidebar: () => void;
  onBack?: () => void;
  currentExpert: Expert;
  customAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onClearChat, onShareChat, onOpenSidebar, onBack, currentExpert, customAvatar }) => {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 h-16 shadow-sm print:absolute print:border-none print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Side: Navigation & Expert Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
           {onBack && (
             <button 
                onClick={onBack}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors mr-1 group"
                title="العودة للرئيسية"
             >
                <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-light transition-colors" />
             </button>
           )}
           
           <div 
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors print:hidden cursor-pointer"
              onClick={onOpenSidebar}
           >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
           </div>

           <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenSidebar}>
            <div className="relative group cursor-default">
                {customAvatar ? (
                <img 
                    src={customAvatar} 
                    alt={currentExpert.name}
                    className="w-10 h-10 rounded-full object-cover border border-primary-light/20 dark:border-primary-dark/20 transition-transform duration-300 group-hover:scale-105" 
                />
                ) : (
                <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center border border-primary-light/20 dark:border-primary-dark/20 transition-transform duration-300 group-hover:scale-105 print:border-black print:bg-transparent text-xl">
                    {currentExpert.emoji}
                </div>
                )}
                
                {/* Pulsing Status Dot (Hide on Print) */}
                <span className="absolute bottom-0 right-0 w-3 h-3 print:hidden">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-bg-dark"></span>
                </span>
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-text-light dark:text-text-dark leading-none tracking-tight print:text-black">
                {currentExpert.name}
                </h1>
                <span className="text-xs text-primary-light dark:text-primary-dark font-medium mt-1 opacity-90 flex items-center gap-1 print:text-gray-600">
                {currentExpert.title}
                </span>
            </div>
           </div>
        </div>

        {/* Right Side: Actions (Hide on Print) */}
        <div className="flex items-center gap-1 print:hidden">
           <button
            onClick={handleExportPDF}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 active:scale-95 hidden sm:flex"
            title="حفظ كملف PDF"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onShareChat}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 active:scale-95"
            title="مشاركة المحادثة"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClearChat}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors text-gray-500 dark:text-gray-400 active:scale-95"
            title="مسح المحادثة"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};