import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X, FileText } from 'lucide-react';
import { ChatAttachment } from '../types';

interface InputAreaProps {
  onSend: (message: string, attachment?: ChatAttachment) => void;
  disabled: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<ChatAttachment | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const triggerSensoryFeedback = () => {
    // 1. Audio Feedback (Short, crisp pop)
    // Using a very short, silent-ish data URI as placeholder, 
    // in a real app this would be a high-quality UI sound.
    // const audio = new Audio("/sounds/pop.mp3"); 
    // audio.play().catch(e => console.log('Audio play failed', e));

    // 2. Haptic Feedback (Vibration) - Crucial for "Speed" feeling
    if (navigator.vibrate) {
      navigator.vibrate(15); // Short 15ms vibration
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachment) && !disabled) {
      triggerSensoryFeedback();
      onSend(input.trim(), attachment);
      setInput('');
      setAttachment(undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        alert("حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Trigger a stronger vibration on file upload to signify "weight"
          if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
          
          setAttachment({
            name: file.name,
            type: file.type,
            data: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(undefined);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم خاصية التعرف على الصوت.");
      return;
    }
    if (navigator.vibrate) navigator.vibrate(50); // Vibrate on record start
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (navigator.vibrate) navigator.vibrate([10, 10]); // Double tap on stop
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-20 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] print:hidden">
      <div className="max-w-3xl mx-auto">
        {attachment && (
          <div className="mb-3 flex items-center gap-2 animate-fade-in-up">
            <div className="relative group">
              <div className="relative flex items-center gap-3 p-2.5 pr-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                 {/* Scanning Effect Overlay for Images */}
                 {attachment.type.startsWith('image/') && (
                   <>
                    <div className="scanning-line"></div>
                    <div className="scanning-overlay"></div>
                   </>
                 )}
                 
                 {attachment.type.startsWith('image/') ? (
                    <img src={attachment.data} alt="preview" className="w-10 h-10 object-cover rounded-lg ring-1 ring-gray-100 dark:ring-gray-700 relative z-0" />
                 ) : (
                    <div className="w-10 h-10 bg-primary-light/10 dark:bg-primary-dark/10 rounded-lg flex items-center justify-center text-primary-light dark:text-primary-dark relative z-0">
                      <FileText className="w-5 h-5" />
                    </div>
                 )}
                 <div className="flex flex-col max-w-[150px] relative z-0">
                    <span className="text-xs font-bold text-text-light dark:text-text-dark truncate">{attachment.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                      {attachment.type.split('/')[1]}
                      {attachment.type.startsWith('image/') && <span className="text-primary-light text-[8px] animate-pulse">● تحليل</span>}
                    </span>
                 </div>
              </div>
              <button 
                onClick={removeAttachment}
                className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div 
            className={`
              relative flex-1 bg-white dark:bg-surface-dark rounded-[24px] shadow-sm border transition-all duration-300 flex items-end
              ${isRecording 
                ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-light/20 dark:focus-within:ring-primary-dark/20 focus-within:border-primary-light dark:focus-within:border-primary-dark'
              }
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 ml-1 mb-1 text-gray-400 hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
              title="إرفاق ملف أو صورة"
              disabled={disabled}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "جاري الاستماع..." : "اكتب استشارتك المالية هنا..."}
              disabled={disabled}
              className={`flex-1 py-4 pr-2 pl-2 bg-transparent border-none focus:ring-0 resize-none max-h-[120px] text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 text-base rounded-[24px] ${isRecording ? 'placeholder-red-500/70' : ''}`}
              style={{ minHeight: '56px' }}
            />
            <button
              onClick={toggleRecording}
              className={`mb-2 ml-2 p-2 rounded-full transition-all duration-300 ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100 scale-110' : 'text-gray-400 hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="تسجيل صوتي"
              disabled={disabled}
            >
              {isRecording ? (
                <div className="relative flex h-6 w-6 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center shadow-lg shadow-red-500/30">
                      <Mic className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            onClick={() => handleSubmit()}
            disabled={(!input.trim() && !attachment) || disabled}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
              ${(!input.trim() && !attachment) || disabled 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-light dark:bg-primary-dark text-white hover:scale-105 active:scale-95 shadow-lg shadow-primary-light/30 dark:shadow-primary-dark/30 hover:shadow-primary-light/50'
              }
            `}
            aria-label="Send message"
          >
            <Send className={`w-6 h-6 ${document.dir === 'rtl' ? '-scale-x-100' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};