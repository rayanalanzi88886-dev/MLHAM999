import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, Expert, ExpertCategory } from '../types';
import { EXPERTS, CATEGORY_NAMES, CATEGORY_ORDER } from '../data/experts';
import { MessageSquare, Zap, Search, ArrowRight, CheckCircle2, Upload, Flame, Sparkles, Mail } from 'lucide-react';

interface LandingPageProps {
    onSelectExpert: (expert: Expert, initialMessage?: string) => void;
    onImportChat?: (payload: { expertId?: string; messages: ChatMessage[] }) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectExpert, onImportChat, toggleTheme, theme }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpertCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
    const [quickPrompt, setQuickPrompt] = useState('');
    const [isPromptFocused, setIsPromptFocused] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const TYPEWRITER_PREFIX = 'أبي ';
    const TYPEWRITER_PHRASES = useMemo(
        () => [
            'أبدأ مشروع بدون مخاطرة كبيرة',
            'أفهم الضرائب والزكاة على نشاطي',
            'أرفع مبيعات متجري خلال 30 يوم',
            'أستثمر راتبي بشكل ذكي',
            'أرتّب ديوني وخطتي المالية',
        ],
        []
    );
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [typewriterCount, setTypewriterCount] = useState(0);
    const [typewriterDeleting, setTypewriterDeleting] = useState(false);
    const [typewriterSuffix, setTypewriterSuffix] = useState('');

    useEffect(() => {
        const shouldAnimate = !isPromptFocused && quickPrompt.trim().length === 0;
        if (!shouldAnimate) {
            return;
        }

        const phrase = TYPEWRITER_PHRASES[typewriterIndex] ?? '';

        // Pause at full phrase before deleting.
        if (!typewriterDeleting && typewriterCount >= phrase.length) {
            const t = window.setTimeout(() => setTypewriterDeleting(true), 900);
            return () => window.clearTimeout(t);
        }

        // Pause when cleared, then advance.
        if (typewriterDeleting && typewriterCount <= 0) {
            const t = window.setTimeout(() => {
                setTypewriterDeleting(false);
                setTypewriterIndex((i) => (i + 1) % TYPEWRITER_PHRASES.length);
            }, 250);
            return () => window.clearTimeout(t);
        }

        const speed = typewriterDeleting ? 28 : 45;
        const t = window.setTimeout(() => {
            const nextCount = typewriterDeleting ? typewriterCount - 1 : typewriterCount + 1;
            const clamped = Math.max(0, Math.min(phrase.length, nextCount));
            setTypewriterCount(clamped);
            setTypewriterSuffix(phrase.slice(0, clamped));
        }, speed);

        return () => window.clearTimeout(t);
    }, [TYPEWRITER_PHRASES, isPromptFocused, quickPrompt, typewriterCount, typewriterDeleting, typewriterIndex]);

    useEffect(() => {
        // Reset animation state when user interacts.
        if (isPromptFocused || quickPrompt.trim().length > 0) {
            setTypewriterCount(0);
            setTypewriterDeleting(false);
            setTypewriterSuffix('');
        }
    }, [isPromptFocused, quickPrompt]);

    const QUICK_CHIPS = useMemo(
        () => [
            { label: 'عقد شراكة', emoji: '🧩', value: 'كيف أصيغ عقد شراكة يحميني؟' },
            { label: 'استثمار', emoji: '💰', value: 'كيف أستثمر 5000 ريال بذكاء؟' },
            { label: 'تسويق رقمي', emoji: '📱', value: 'أعطني خطة تسويقية لمتجر جديد...' },
            { label: 'تعلم برمجة', emoji: '💻', value: 'أعطني خطة تعلم برمجة لمدة 30 يوم.' },
        ],
        []
    );

    const defaultExpert = useMemo(() => {
        try {
            const savedExpertId = localStorage.getItem('expert_chat_selected_expert_id');
            return EXPERTS.find((e) => e.id === savedExpertId) || EXPERTS[0];
        } catch {
            return EXPERTS[0];
        }
    }, []);

    const startNow = () => {
        const text = quickPrompt.trim();
        onSelectExpert(defaultExpert, text.length > 0 ? text : undefined);
    };

    const handleImportFile = async (file: File) => {
        try {
            const raw = await file.text();
            const parsed = JSON.parse(raw);
            const expertId: string | undefined = typeof parsed?.expertId === 'string' ? parsed.expertId : undefined;
            const messagesRaw: any[] = Array.isArray(parsed?.messages) ? parsed.messages : (Array.isArray(parsed) ? parsed : []);
            const messages: ChatMessage[] = messagesRaw
                .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.content === 'string')
                .map((m) => ({
                    id: typeof m.id === 'string' ? m.id : `import-${Math.random().toString(36).slice(2)}`,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.timestamp || Date.now()),
                    attachment: m.attachment,
                }));

            if (messages.length === 0) {
                alert('ملف الاستيراد لا يحتوي على محادثة صالحة.');
                return;
            }

            onImportChat?.({ expertId, messages });
        } catch (e) {
            console.error(e);
            alert('تعذر استيراد المحادثة. تأكد أن الملف بصيغة JSON صحيحة.');
        }
    };

  const filteredExperts = EXPERTS.filter(expert => {
    const matchesCategory = selectedCategory === 'All' || expert.category === selectedCategory;
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expert.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark font-cairo transition-colors duration-300 selection:bg-accent selection:text-white">
            {/* Hero (Input-first / 5 seconds) */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Cloud Dancer background */}
                <div className="absolute inset-0 bg-gradient-to-br from-bg-light via-white to-bg-light dark:from-black dark:via-bg-dark dark:to-surface-dark" />
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/70 dark:bg-white/5 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-sky-200/30 dark:bg-white/5 blur-3xl" />

                <div className="relative z-10 w-full max-w-3xl px-4">
                    {/* Top actions */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={startNow}
                                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-accent/25 transition-all"
                            >
                                اختر لي الخبير 🧳
                            </button>
                            <a
                                href="#experts"
                                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-xl font-black text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-white transition-colors"
                            >
                                أبي أختار بنفسي 👉
                            </a>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>

                    {/* Glass Card */}
                    <div className="rounded-[1.5rem] sm:rounded-[2.25rem] border border-white/50 dark:border-white/10 bg-white/60 dark:bg-surface-dark/50 backdrop-blur-xl shadow-2xl shadow-black/5 p-5 sm:p-10">
                        {/* 0-1s: Identity / micro-trust */}
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-300">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-white/10">
                                <span className="text-sm">🔒</span>
                                <span>خاص</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> آمن</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> بدون تعقيد</span>
                            </span>
                        </div>

                        {/* 1-3s: One promise */}
                        <div className="text-center mt-6 sm:mt-8">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                                وش اللي يشغل بالك اليوم؟
                                <span className="mr-2">🤔</span>
                            </h1>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-500 dark:text-gray-400 font-bold px-2">
                                نخبة من الخبراء المتخصصين، استجابة فورية، حفظ تلقائي.
                            </p>
                        </div>

                        {/* 3-5s: One action (ready input + CTA) */}
                        <div className="mt-6 sm:mt-8">
                            <div className="relative max-w-[650px] mx-auto">
                                <input
                                    value={quickPrompt}
                                    onChange={(e) => setQuickPrompt(e.target.value)}
                                    onFocus={() => setIsPromptFocused(true)}
                                    onBlur={() => setIsPromptFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') startNow();
                                    }}
                                    dir="rtl"
                                    placeholder={
                                        isPromptFocused
                                            ? 'اكتب سؤالك هنا...'
                                            : (typewriterSuffix.length > 0 ? `${TYPEWRITER_PREFIX}${typewriterSuffix}` : 'أبي...')
                                    }
                                    className="w-full px-4 py-4 sm:px-6 sm:py-5 text-base sm:text-xl font-bold border-2 border-transparent focus:border-accent rounded-2xl bg-white/85 dark:bg-surface-dark/70 shadow-md shadow-black/5 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 pl-24 sm:pl-28"
                                />
                                <button
                                    onClick={startNow}
                                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-black text-white border-none px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-base cursor-pointer transition-transform hover:scale-105"
                                >
                                    ابدأ
                                </button>
                            </div>

                            {/* Quick chips */}
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                {QUICK_CHIPS.map((chip) => (
                                    <button
                                        key={chip.label}
                                        type="button"
                                        onClick={() => {
                                            setQuickPrompt(chip.value);
                                            setTimeout(() => startNow(), 0);
                                        }}
                                        className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white transition-colors"
                                    >
                                        {chip.label} {chip.emoji}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => importInputRef.current?.click()}
                                    className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    أو استورد محادثة سابقة
                                </button>
                                <span className="text-sm font-bold text-gray-300 dark:text-gray-600">|</span>
                                <a href="#experts" className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    أبي أختار بنفسي
                                </a>
                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept="application/json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImportFile(file);
                                        e.currentTarget.value = '';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

      </section>

            {/* Weekly Top */}
            <section className="py-16 max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-black flex items-center justify-center gap-2">
                        الأكثر استشارة هذا الأسبوع
                        <Flame className="w-6 h-6 text-accent" />
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[EXPERTS[0], EXPERTS[1], EXPERTS[2]].map((expert) => (
                        <button
                            key={expert.id}
                            onClick={() => onSelectExpert(expert)}
                            className="bg-white/70 dark:bg-surface-dark/60 border border-gray-200/70 dark:border-white/10 rounded-2xl p-5 text-center hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden text-2xl">
                                {expert.avatarUrl ? (
                                    <img src={expert.avatarUrl} alt={expert.name} className="w-full h-full object-cover" />
                                ) : (
                                    expert.emoji
                                )}
                            </div>
                            <div className="mt-3 font-black text-gray-900 dark:text-white truncate">{expert.name}</div>
                            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 truncate">{expert.title}</div>
                        </button>
                    ))}
                </div>
            </section>

      {/* Experts Section */}
      <section id="experts" className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-6">اختر خبيرك المفضل</h2>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-xl flex items-center p-1.5 sm:p-2">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-2 sm:mr-3 ml-1 sm:ml-2" />
                    <input 
                        type="text" 
                        placeholder="ابحث عن تخصص، اسم، أو مشكلة..."
                        className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-medium placeholder:text-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-gray-100 dark:bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                        بحث
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 ${selectedCategory === 'All' ? 'border-accent bg-accent/5 text-accent' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'}`}
                >
                    الكل
                </button>
                {CATEGORY_ORDER.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex items-center gap-2 ${selectedCategory === cat ? 'border-accent bg-accent/5 text-accent' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'}`}
                    >
                       <span>{CATEGORY_NAMES[cat]}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredExperts.map((expert, idx) => (
                <div 
                    key={expert.id}
                    onClick={() => onSelectExpert(expert)}
                    className="group bg-white dark:bg-surface-dark rounded-[1.5rem] sm:rounded-[2rem] p-1 border-2 border-gray-100 dark:border-gray-800 hover:border-accent/30 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                >
                    <div className="bg-gray-50 dark:bg-white/5 rounded-[1.3rem] sm:rounded-[1.8rem] p-4 sm:p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center text-2xl sm:text-4xl border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                            {expert.avatarUrl ? (
                                <img src={expert.avatarUrl} alt={expert.name} className="w-full h-full object-cover" />
                            ) : (
                                expert.emoji
                            )}
                        </div>
                            <div className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">
                                {CATEGORY_NAMES[expert.category]}
                            </div>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-black mb-1 text-gray-900 dark:text-white group-hover:text-accent transition-colors">{expert.name}</h3>
                        <p className="text-xs sm:text-sm text-accent font-bold mb-3 sm:mb-4">{expert.title}</p>
                        
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 sm:mb-8 leading-relaxed">
                            {expert.description}
                        </p>

                        <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400">متاح الآن</span>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-6">الأسئلة الشائعة</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">كل ما تحتاج معرفته عن منصة فلهم</p>
        </div>
        
        <div className="space-y-4">
            {[
                {
                    q: "هل الخبراء حقيقيون؟",
                    a: "الخبراء هم شخصيات ذكاء اصطناعي متطورة تم تدريبها بعناية لتقديم استشارات متخصصة في مجالات محددة، وهم متاحون لخدمتك 24/7."
                },
                {
                    q: "هل الخدمة مجانية؟",
                    a: "نعم، يمكنك البدء واستخدام الخدمة مجاناً. نسعى لتوفير المعرفة للجميع."
                },
                {
                    q: "كيف أضمن دقة المعلومات؟",
                    a: "تم تصميم الخبراء لتقديم معلومات دقيقة ومحدثة، ولكن ننصح دائماً بمراجعة الجهات الرسمية أو المختصين في القرارات المصيرية."
                },
                {
                    q: "هل محادثاتي سرية؟",
                    a: "نعم، خصوصيتك هي أولويتنا. لا نشارك محادثاتك مع أي طرف ثالث."
                }
            ].map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-accent/30 transition-all">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-accent">?</span> {faq.q}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-lg sm:text-xl font-black tracking-tight">فلهم</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">© 2025 Expert Chat. جميع الحقوق محفوظة.</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
                <a href="mailto:rayanalanzi88886@gmail.com" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 transition-all group" title="Email">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="https://x.com/hzbr_al?s=21" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all group" title="X (Twitter)">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                <a href="https://t.me/dr_basl" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#229ED9] hover:border-[#229ED9] transition-all group" title="Telegram">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current" aria-hidden="true"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path></svg>
                </a>
            </div>

            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-gray-500">
                <a href="#" className="hover:text-accent">الخصوصية</a>
                <a href="#" className="hover:text-accent">الشروط</a>
                <a href="#" className="hover:text-accent">تواصل معنا</a>
            </div>
        </div>
      </footer>

      <style>{`
        .tag {
            @apply px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] text-gray-500 dark:text-gray-400 font-medium;
        }
        .tag-primary {
             @apply px-2 py-1 rounded-md bg-accent/10 text-[10px] text-accent font-bold;
        }
      `}</style>
    </div>
  );
};