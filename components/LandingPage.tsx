import React, { useState } from 'react';
import { Expert, ExpertCategory } from '../types';
import { EXPERTS, CATEGORY_NAMES, CATEGORY_ORDER } from '../data/experts';
import { MessageSquare, Shield, Zap, Layout, ArrowLeft, Search } from 'lucide-react';

interface LandingPageProps {
  onSelectExpert: (expert: Expert) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectExpert, toggleTheme, theme }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpertCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperts = EXPERTS.filter(expert => {
    const matchesCategory = selectedCategory === 'All' || expert.category === selectedCategory;
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expert.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark font-cairo transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-light/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">فلهم <span className="text-primary-light text-sm">اختر خبيرك</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <a href="#experts" className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-light transition-colors">تصفح الخبراء</a>
            <button 
                onClick={() => onSelectExpert(EXPERTS[0])}
                className="px-5 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-full font-bold text-sm shadow-lg shadow-primary-light/20 transition-all hover:scale-105 active:scale-95"
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-light/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-xs font-bold text-primary-light mb-6 animate-fade-in-up">
                <Zap className="w-3 h-3" />
                <span>واجهة محادثة احترافية + خبراء متخصصون</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                ذكاء يفهم <span className="text-primary-light relative inline-block">
                    مشكلتك
                    <svg className="absolute w-full h-3 -bottom-1 right-0 text-primary-light/20" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0 15 Q 50 20 100 15" stroke="currentColor" strokeWidth="6" fill="none" />
                    </svg>
                </span>
                <br />
                قبل أن يقدّم الحل
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                استشارة دقيقة مبنية على خبرة حقيقية، لا إجابات عامة. اختر المستشار الذي يناسب مجالك وابدأ المحادثة فوراً.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <a href="#experts" className="w-full sm:w-auto px-8 py-4 bg-primary-light text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-light/30 hover:shadow-primary-light/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    ابدأ الاستشارة
                </a>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-white/50 dark:bg-white/5 backdrop-blur-sm border-y border-gray-100 dark:border-gray-800">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: <Zap className="w-6 h-6" />, title: "سريع وخفيف", desc: "صفحة رئيسية سريعة (بحث + فلاتر) بدون تعقيد، تركيز على بدء المحادثة." },
                { icon: <Shield className="w-6 h-6" />, title: "وضوح وثقة", desc: "أسئلة مقترحة + FAQ يقلل تردد المستخدم ويزيد التحويل." },
                { icon: <Layout className="w-6 h-6" />, title: "Mobile-first", desc: "أزرار كبيرة + تبويبات واضحة + نص مقروء. لا \"تكشر\" على الجوال." }
            ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center text-primary-light shrink-0">
                        {feature.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                </div>
            ))}
         </div>
      </section>

      {/* Experts Section */}
      <section id="experts" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">اختر خبيرك</h2>
            <p className="text-gray-500">ابحث بالاسم/التخصص/الوسوم، أو اختر تصنيفاً.</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-10 flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md">
                <input 
                    type="text" 
                    placeholder="مثال: إيجار، قلق، برمجة، فوترة..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary-light/50 outline-none transition-shadow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-white">
                    <Search className="w-4 h-4" />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === 'All' ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary-light'}`}
                >
                    الكل
                </button>
                {CATEGORY_ORDER.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${selectedCategory === cat ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary-light'}`}
                    >
                       {/* Add simple icon mapping if needed, or just text */}
                       {cat === 'Money' && '💵'}
                       {cat === 'Self' && '🧠'}
                       {cat === 'AI' && '🤖'}
                       {cat === 'Tech' && '</>'}
                       {cat === 'Career' && '💼'}
                       <span>{CATEGORY_NAMES[cat]}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert, idx) => (
                <div 
                    key={expert.id}
                    onClick={() => onSelectExpert(expert)}
                    className="group bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-150"></div>
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-3xl shadow-sm">
                            {expert.emoji}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full">
                            {CATEGORY_NAMES[expert.category]}
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary-light transition-colors">{expert.name}</h3>
                    <p className="text-sm text-primary-light font-medium mb-3">{expert.title}</p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10 leading-relaxed">
                        {expert.systemInstruction.split('Focus:')[1]?.split('Tone:')[0]?.trim() || expert.title}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {/* Fake Tags generated from description for visuals */}
                         {expert.category === 'Money' && <><span className="tag">إيجار</span><span className="tag">توفير</span><span className="tag">عقار</span></>}
                         {expert.category === 'Self' && <><span className="tag">قلق</span><span className="tag">نوم</span><span className="tag">CBT</span></>}
                         {expert.category === 'AI' && <><span className="tag">GPT</span><span className="tag">Midjourney</span></>}
                         {expert.category === 'Tech' && <><span className="tag">Code</span><span className="tag">SaaS</span></>}
                         {expert.category === 'Career' && <><span className="tag">سيرة ذاتية</span><span className="tag">مقابلة</span></>}
                         <span className="tag-primary">ابدأ الاستشارة</span>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 font-bold group-hover:bg-primary-light group-hover:text-white transition-colors flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        ابدأ الاستشارة
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800">
        <p>© 2025 Expert Chat. تم التصميم بعناية لتجربة مستخدم أفضل.</p>
      </footer>

      <style>{`
        .tag {
            @apply px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] text-gray-500 dark:text-gray-400 font-medium;
        }
        .tag-primary {
             @apply px-2 py-1 rounded-md bg-primary-light/10 text-[10px] text-primary-light font-bold;
        }
      `}</style>
    </div>
  );
};