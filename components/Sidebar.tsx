import React, { useRef, useState } from 'react';
import { Expert } from '../types-hybrid';
import { EXPERTS, CATEGORY_NAMES, CATEGORY_ORDER } from '../data/experts-hybrid';
import { X, ChevronLeft, Camera, Upload, RefreshCw } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExpertId: string;
  onSelectExpert: (expert: Expert) => void;
  customAvatars: Record<string, string>;
  onUpdateAvatar: (expertId: string, avatarUrl: string | null) => void;
  currentExpert: Expert;
  expertThemes: Record<string, string>;
  onUpdateTheme: (expertId: string, themeColor: string) => void;
}

// Curated Professional Avatar Gallery (SVG as Base64 for offline reliability)
const AVATAR_GALLERY = [
  // 1. Corporate Blue Suit (Abstract)
  { id: 'corp-blue', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzFBMzY1RCIvPjxwYXRoIGQ9Ik01MCAzNUM1MCA0My4yODQzIDQzLjI4NDMgNTAgMzUgNTBDMjYuNzE1NyA1MCAyMCA0My4yODQzIDIwIDM1QzIwIDI2LjcxNTcgMjYuNzE1NyAyMCAzNSAyMEM0My4yODQzIDIwIDUwIDI2LjcxNTcgNTAgMzVaIiBmaWxsPSIjRjFGNTZjIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNSwwKSIvPjxwYXRoIGQ9Ik0xNSAxMDBDNTAgNzAgNTAgNzAgODUgMTAwSDE1WiIgZmlsbD0iI0YxRjU5QyIvPjwvc3ZnPg==' },
  // 2. Modern Orange/Warm (Matches App Theme)
  { id: 'warm-orange', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI0NDNTUwMCIvPjxwYXRoIGQ9Ik01MCAzMEM1MCAzOC4yODQzIDQzLjI4NDMgNDUgMzUgNDVDMjYuNzE1NyA0NSAyMCAzOC4yODQzIDIwIDMwQzIwIDIxLjcxNTcgMjYuNzE1NyAxNSAzNSAxNUM0My4yODQzIDE1IDUwIDIxLjcxNTcgNTAgMzBaIiBmaWxsPSIjRkZGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNSw1KSIvPjxwYXRoIGQ9Ik0yMCAxMDBDNTAgNjAgNTAgNjAgODAgMTAwSDIwWiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==' },
  // 3. Tech/AI Robot
  { id: 'tech-bot', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzJEMzI0OCIvPjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiByeD0iNSIgZmlsbD0iIzM4QjJBQyIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDUiIHI9IjQiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iNCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNDAgNTVINjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI1IDkwQzI1IDgwIDc1IDgwIDc1IDkwIiBmaWxsPSIjNzc3Ii8+PC9zdmc+' },
  // 4. Creative/Abstract
  { id: 'creative-purple', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEY3QUU1O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZDNjNGRjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNncmFkMSkiLz48cGF0aCBkPSJNMzUgMzVIMzVWNjVIMzVWMzVaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNMzUgNTBINjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNSIvPjwvc3ZnPg==' }
];

const THEME_COLORS = [
  { id: 'default', color: '#F97316', label: 'برتقالي (افتراضي)' },
  { id: 'blue', color: '#3B82F6', label: 'أزرق رسمي' },
  { id: 'green', color: '#10B981', label: 'أخضر نمو' },
  { id: 'purple', color: '#8B5CF6', label: 'بنفسجي إبداعي' },
  { id: 'rose', color: '#F43F5E', label: 'وردي دافئ' },
  { id: 'slate', color: '#64748B', label: 'رمادي حيادي' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  selectedExpertId, 
  onSelectExpert, 
  customAvatars, 
  onUpdateAvatar,
  currentExpert,
  expertThemes,
  onUpdateTheme
}) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group experts by category
  const groupedExperts = EXPERTS.reduce((acc, expert) => {
    if (!acc[expert.category]) {
      acc[expert.category] = [];
    }
    acc[expert.category].push(expert);
    return acc;
  }, {} as Record<string, Expert[]>);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          if (navigator.vibrate) navigator.vibrate(20); // Sensory feedback
          onUpdateAvatar(selectedExpertId, event.target.result);
          setIsEditingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (src: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    onUpdateAvatar(selectedExpertId, src);
    setIsEditingAvatar(false);
  };

  const handleResetAvatar = () => {
    if (confirm('هل تريد استعادة الصورة الافتراضية؟')) {
      onUpdateAvatar(selectedExpertId, null);
      setIsEditingAvatar(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[80vw] sm:w-80 bg-surface-light dark:bg-surface-dark shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header - Active Expert Profile & Customization */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
           <div className="p-4 sm:p-5 flex items-start justify-between">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">الملف الشخصي</h2>
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
           </div>
           
           <div className="px-4 sm:px-5 pb-4 sm:pb-6 flex flex-col items-center">
              <div className="relative group mb-3">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-white/5 p-1 border-2 border-primary-light/20 dark:border-primary-dark/20 shadow-lg relative overflow-hidden">
                    {customAvatars[selectedExpertId] ? (
                      <img src={customAvatars[selectedExpertId]} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : currentExpert.avatarUrl ? (
                      <img src={currentExpert.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center text-2xl sm:text-3xl">
                        {currentExpert.emoji}
                      </div>
                    )}
                    
                    {/* Edit Overlay */}
                    <button 
                      onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white"
                    >
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                 </div>
                 
                 {/* Quick Edit Button (Mobile Friendly) */}
                 <button 
                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                    className="absolute bottom-0 right-0 bg-primary-light text-white p-1 sm:p-1.5 rounded-full shadow-md sm:hidden border-2 border-white dark:border-surface-dark"
                 >
                   <Camera className="w-2.5 h-2.5" />
                 </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark">{currentExpert.name}</h3>
              <p className="text-[10px] sm:text-xs text-primary-light dark:text-primary-dark font-medium opacity-80">{currentExpert.title}</p>

              {/* Avatar Selector UI (Expandable) */}
              <div className={`w-full overflow-hidden transition-all duration-300 ${isEditingAvatar ? 'max-h-72 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                 <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center font-bold">اختر صورة رمزية جديدة</p>
                    
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {AVATAR_GALLERY.map((avatar) => {
                        const isSelected = customAvatars[selectedExpertId] === avatar.src;
                        return (
                          <button 
                            key={avatar.id}
                            onClick={() => handleGallerySelect(avatar.src)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                                isSelected 
                                ? 'border-primary-light dark:border-primary-dark ring-2 ring-primary-light/20 dark:ring-primary-dark/20 scale-95' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-primary-light dark:hover:border-primary-dark hover:scale-105'
                            }`}
                          >
                            <img src={avatar.src} alt="avatar option" className="w-full h-full object-cover" />
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary-light/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-primary-light rounded-full shadow-sm"></div>
                                </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileUpload} 
                         accept="image/*" 
                         className="hidden" 
                       />
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-surface-dark border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                       >
                         <Upload className="w-4 h-4 text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors" />
                         <span>رفع صورة</span>
                       </button>
                       {customAvatars[selectedExpertId] && (
                         <button 
                           onClick={handleResetAvatar}
                           className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
                           title="استعادة الافتراضي"
                         >
                           <RefreshCw className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                 </div>
              </div>

              {/* Theme Selector */}
              <div className="w-full mt-4 px-1">
                <p className="text-xs text-gray-400 font-bold mb-2 text-center">لون المحادثة</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {THEME_COLORS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onUpdateTheme(selectedExpertId, theme.color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        (expertThemes[selectedExpertId] || '#F97316') === theme.color
                          ? 'border-gray-900 dark:border-white scale-110 shadow-md'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>
           </div>
        </div>

        {/* List of Experts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
             <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">تغيير الخبير</span>
             <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          </div>

          {CATEGORY_ORDER.map((catKey) => (
            <div key={catKey}>
              <h3 className="text-xs font-bold text-primary-light dark:text-primary-dark uppercase tracking-wider mb-3 px-2">
                {CATEGORY_NAMES[catKey]}
              </h3>
              <div className="space-y-2">
                {groupedExperts[catKey]?.map((expert) => {
                  const isActive = selectedExpertId === expert.id;
                  const hasCustom = customAvatars[expert.id];
                  
                  return (
                    <button
                      key={expert.id}
                      onClick={() => onSelectExpert(expert)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all duration-200 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-primary-light dark:bg-primary-dark text-white shadow-lg shadow-primary-light/20' 
                          : 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-gray-700 text-text-light dark:text-text-dark'
                        }
                      `}
                    >
                      <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-lg overflow-hidden">
                         {hasCustom ? (
                           <img src={hasCustom} alt="" className="w-full h-full object-cover" />
                         ) : expert.avatarUrl ? (
                           <img src={expert.avatarUrl} alt="" className="w-full h-full object-cover" />
                         ) : (
                           expert.emoji
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{expert.name}</div>
                        <div className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {expert.title}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronLeft className="w-4 h-4 text-white shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[10px] text-gray-400">تم اختيار الخبراء بعناية لخدمتك</p>
        </div>
      </div>
    </>
  );
};