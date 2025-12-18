import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, Expert, ExpertCategory } from '../types-hybrid';
import { EXPERTS, CATEGORY_NAMES, CATEGORY_ORDER } from '../data/experts-hybrid';
import { 
    CheckCircle2, 
    Zap, 
    Upload, 
    TrendingUp, 
    ArrowRight, 
    Search, 
    MessageSquare, 
    Mail, 
    Sparkles 
} from 'lucide-react';

interface LandingPageProps {
    onSelectExpert: (expert: Expert, initialMessage?: string) => void;
    onImportChat?: (payload: { expertId?: string; messages: ChatMessage[] }) => void;
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

// ===== 🎯 تحديد الخبراء ذوي الأولوية (Haiku فقط) =====
const PRIORITY_EXPERT_IDS = [
    'biz-2',      // جمانة الرقمية - تسويق رقمي (أكثر طلباً)
    'legal-2',    // أ. منال المعقب الحكومي - خدمات حكومية
    'self-2',     // ريم الاجتماعية - مهارات اجتماعية
    'money-2',    // نورة الدخل الاضافي - دخل إضافي
    'biz-3',      // زياد الكاتب - محتوى فيروسي
    'health-2',   // كابتن عزام - لياقة
];

// ===== 🧠 المنطق النفسي للواجهة =====
const UX_PSYCHOLOGY = {
    // 1. تقليل القرارات (Decision Fatigue)
    maxVisibleExpertsInitial: 6,
    
    // 2. التدرج البصري (Visual Hierarchy)
    heroFocusTime: 3000, // 3 ثواني تركيز على Hero
    
    // 3. الدليل الاجتماعي (Social Proof)
    showWeeklyTop: true,
    
    // 4. تأثير الندرة (Scarcity)
    showLiveIndicators: true,
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectExpert, onImportChat, toggleTheme, theme }) => {
    const [selectedCategory, setSelectedCategory] = useState<ExpertCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickPrompt, setQuickPrompt] = useState('');
    const [isPromptFocused, setIsPromptFocused] = useState(false);
    const [showAllExperts, setShowAllExperts] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    // ===== Typewriter Effect =====
    const TYPEWRITER_PREFIX = 'أبي ';
    const TYPEWRITER_PHRASES = useMemo(
        () => [
            'أزيد مبيعاتي 50% في شهر',
            'أبدأ مشروع بدون رأس مال كبير',
            'أتعلم مهارة جديدة بسرعة',
            'أحسّن صحتي ولياقتي',
            'أفهم إجراءات الحكومة',
        ],
        []
    );
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [typewriterCount, setTypewriterCount] = useState(0);
    const [typewriterDeleting, setTypewriterDeleting] = useState(false);
    const [typewriterSuffix, setTypewriterSuffix] = useState('');

    useEffect(() => {
        const shouldAnimate = !isPromptFocused && quickPrompt.trim().length === 0;
        if (!shouldAnimate) return;

        const phrase = TYPEWRITER_PHRASES[typewriterIndex] ?? '';

        if (!typewriterDeleting && typewriterCount >= phrase.length) {
            const t = window.setTimeout(() => setTypewriterDeleting(true), 1200);
            return () => window.clearTimeout(t);
        }

        if (typewriterDeleting && typewriterCount <= 0) {
            const t = window.setTimeout(() => {
                setTypewriterDeleting(false);
                setTypewriterIndex((i) => (i + 1) % TYPEWRITER_PHRASES.length);
            }, 300);
            return () => window.clearTimeout(t);
        }

        const speed = typewriterDeleting ? 30 : 50;
        const t = window.setTimeout(() => {
            const nextCount = typewriterDeleting ? typewriterCount - 1 : typewriterCount + 1;
            const clamped = Math.max(0, Math.min(phrase.length, nextCount));
            setTypewriterCount(clamped);
            setTypewriterSuffix(phrase.slice(0, clamped));
        }, speed);

        return () => window.clearTimeout(t);
    }, [TYPEWRITER_PHRASES, isPromptFocused, quickPrompt, typewriterCount, typewriterDeleting, typewriterIndex]);

    // ===== Quick Chips - مبسطة ومركزة =====
    const QUICK_CHIPS = useMemo(
        () => [
            { label: 'تسويق رقمي', value: 'كيف أبدأ حملة تسويقية ناجحة؟', expertId: 'biz-2' },
            { label: 'خدمات حكومية', value: 'كيف أستخرج وكالة من ناجز؟', expertId: 'legal-2', name: 'أ. منال المعقب الحكومي' },
            { label: 'دخل إضافي', value: 'كيف أبدأ مشروع جانبي؟', expertId: 'money-2', name: 'نورة الدخل الاضافي' },
        ],
        []
    );

    // ===== اختيار الخبير الافتراضي =====
    const defaultExpert = useMemo(() => {
        try {
            const savedExpertId = localStorage.getItem('expert_chat_selected_expert_id');
            const saved = EXPERTS.find((e) => e.id === savedExpertId);
            if (saved) return saved;
        } catch {}
        // افتراضياً: أول خبير من الأولوية
        return EXPERTS.find(e => e.id === PRIORITY_EXPERT_IDS[0]) || EXPERTS[0];
    }, []);

    // ===== بدء المحادثة =====
    const startNow = (expertId?: string) => {
        const text = quickPrompt.trim();
        const expert = expertId 
            ? EXPERTS.find(e => e.id === expertId) || defaultExpert
            : defaultExpert;
        
        onSelectExpert(expert, text.length > 0 ? text : undefined);
    };

    // ===== استيراد محادثة =====
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

    // ===== الخبراء ذوو الأولوية =====
    const priorityExperts = useMemo(() => {
        return EXPERTS.filter(e => PRIORITY_EXPERT_IDS.includes(e.id));
    }, []);

    // ===== الخبراء الآخرين =====
    const otherExperts = useMemo(() => {
        return EXPERTS.filter(e => !PRIORITY_EXPERT_IDS.includes(e.id));
    }, []);

    // ===== الخبراء المفلترة =====
    const filteredPriorityExperts = priorityExperts.filter(expert => {
        const matchesCategory = selectedCategory === 'All' || expert.category === selectedCategory;
        const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              expert.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filteredOtherExperts = otherExperts.filter(expert => {
        const matchesCategory = selectedCategory === 'All' || expert.category === selectedCategory;
        const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              expert.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark font-cairo transition-colors duration-300 selection:bg-accent selection:text-white">
            
            {/* ===== 1️⃣ HERO SECTION - مبسط ومركز ===== */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-bg-light via-white to-bg-light dark:from-black dark:via-bg-dark dark:to-surface-dark" />
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/70 dark:bg-white/5 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl" />

                <div className="relative z-10 w-full max-w-2xl px-4">
                    {/* Top Bar - أبسط */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-300"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-surface-dark/60 backdrop-blur-xl shadow-2xl p-8">
                        
                        {/* Trust Badges - مبسط */}
                        <div className="flex items-center justify-center gap-6 text-xs font-bold text-gray-500 dark:text-gray-400 mb-6">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                آمن 100%
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="inline-flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent" />
                                فوري وبدون تعقيد
                            </span>
                        </div>

                        {/* Hero Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 dark:text-white mb-4">
                                وش يشغل بالك اليوم؟ 🤔
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-bold">
                                اسأل واحصل على إجابة من خبير متخصص خلال ثوانٍ
                            </p>
                        </div>

                        {/* Input - بسيط ومركز */}
                        <div className="mb-6">
                            <div className="relative">
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
                                    className="w-full px-6 py-5 text-xl font-bold border-2 border-transparent focus:border-accent rounded-2xl bg-white dark:bg-surface-dark shadow-lg outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 pl-28"
                                />
                                <button
                                    onClick={() => startNow()}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl font-black text-base transition-all hover:scale-105"
                                >
                                    ابدأ الآن
                                </button>
                            </div>

                            {/* Quick Chips - 3 فقط */}
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {QUICK_CHIPS.map((chip) => (
                                    <button
                                        key={chip.label}
                                        type="button"
                                        onClick={() => {
                                            setQuickPrompt(chip.value);
                                            setTimeout(() => startNow(chip.expertId), 0);
                                        }}
                                        className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex items-center justify-center gap-4 text-sm">
                            <button
                                onClick={() => importInputRef.current?.click()}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold inline-flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                استورد محادثة
                            </button>
                            <span className="text-gray-300">|</span>
                            <a 
                                href="#experts" 
                                className="text-accent hover:text-accent-dark font-bold"
                            >
                                تصفح الخبراء →
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
            </section>

            {/* ===== 2️⃣ الخبراء الأكثر طلباً (Priority) ===== */}
            <section className="py-16 max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-4">
                        <TrendingUp className="w-4 h-4" />
                        الأكثر استخداماً
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        ابدأ من هنا - الخبراء الأكثر طلباً
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        استجابة فورية وحلول سريعة لأكثر المشاكل شيوعاً
                    </p>
                </div>

                {/* Priority Experts Grid - 2 صفوف × 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredPriorityExperts.map((expert) => (
                        <ExpertCard 
                            key={expert.id} 
                            expert={expert} 
                            onSelect={onSelectExpert}
                            isPriority={true}
                        />
                    ))}
                </div>

                {/* Call to Action لعرض باقي الخبراء */}
                {!showAllExperts && filteredOtherExperts.length > 0 && (
                    <div className="text-center">
                        <button
                            onClick={() => setShowAllExperts(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl font-bold text-gray-700 dark:text-gray-300 transition-all"
                        >
                            استكشف {filteredOtherExperts.length} خبير إضافي
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </section>

            {/* ===== 3️⃣ باقي الخبراء (عند الطلب فقط) ===== */}
            {showAllExperts && (
                <section id="experts" className="py-16 max-w-6xl mx-auto px-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-6">الخبراء المتخصصين</h2>
                        
                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto mb-8">
                            <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-lg flex items-center p-2">
                                <Search className="w-5 h-5 text-gray-400 mr-3 ml-2" />
                                <input 
                                    type="text" 
                                    placeholder="ابحث عن تخصص معين..."
                                    className="flex-1 bg-transparent border-none outline-none text-base font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button 
                                onClick={() => setSelectedCategory('All')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    selectedCategory === 'All' 
                                        ? 'bg-accent text-white' 
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                الكل
                            </button>
                            {CATEGORY_ORDER.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        selectedCategory === cat 
                                            ? 'bg-accent text-white' 
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {CATEGORY_NAMES[cat]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other Experts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOtherExperts.map((expert) => (
                            <ExpertCard 
                                key={expert.id} 
                                expert={expert} 
                                onSelect={onSelectExpert}
                                isPriority={false}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ===== 4️⃣ FAQ - مختصر ===== */}
            <section className="py-16 max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black mb-2">أسئلة شائعة</h2>
                    <p className="text-gray-500 dark:text-gray-400">سريع وواضح</p>
                </div>
                
                <div className="space-y-4">
                    {[
                        {
                            q: "هل الخدمة مجانية؟",
                            a: "نعم، يمكنك البدء مجاناً والاستفادة من خبرائنا."
                        },
                        {
                            q: "هل الخبراء حقيقيون؟",
                            a: "الخبراء هم ذكاء اصطناعي متطور مدرب لتقديم استشارات متخصصة 24/7."
                        },
                        {
                            q: "هل محادثاتي خاصة؟",
                            a: "تماماً. نحن نحترم خصوصيتك ولا نشارك محادثاتك مع أي طرف."
                        },
                    ].map((faq, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
                        >
                            <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">
                                {faq.q}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 5️⃣ Footer - بسيط ===== */}
            <footer className="py-10 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xl font-black">فلهم</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="mailto:rayanalanzi88886@gmail.com" className="text-gray-500 hover:text-accent transition-colors">
                            <Mail className="w-5 h-5" />
                        </a>
                        <a href="https://x.com/hzbr_al?s=21" target="_blank" rel="noopener" className="text-gray-500 hover:text-accent transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </a>
                        <a href="https://t.me/dr_basl" target="_blank" rel="noopener" className="text-gray-500 hover:text-accent transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
                            </svg>
                        </a>
                    </div>

                    <p className="text-gray-400 text-sm">© 2025 فلهم. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

// ===== 🎴 Expert Card Component - محسّن =====
interface ExpertCardProps {
    expert: Expert;
    onSelect: (expert: Expert) => void;
    isPriority: boolean;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onSelect, isPriority }) => {
    return (
        <div 
            onClick={() => onSelect(expert)}
            className="group relative bg-white dark:bg-surface-dark rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-800 hover:border-accent/50 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Priority Badge */}
            {isPriority && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    الأكثر طلباً
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-3xl border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform overflow-hidden">
                    {expert.avatarUrl ? (
                        <img src={expert.avatarUrl} alt={expert.name} className="w-full h-full object-cover" />
                    ) : (
                        expert.emoji
                    )}
                </div>
                <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-bold text-gray-400">
                    {CATEGORY_NAMES[expert.category]}
                </div>
            </div>
            
            {/* Content */}
            <h3 className="text-lg font-black mb-1 text-gray-900 dark:text-white group-hover:text-accent transition-colors">
                {expert.name}
            </h3>
            <p className="text-sm text-accent font-bold mb-3">{expert.title}</p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                {expert.description}
            </p>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <span className="text-xs font-bold text-green-500 inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    متاح الآن
                </span>
                <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};
