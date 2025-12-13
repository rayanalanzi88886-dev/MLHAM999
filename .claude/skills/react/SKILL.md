# React Development Skill

## نظرة عامة
هذا الملف يحتوي على أفضل الممارسات لتطوير تطبيقات React احترافية مع دعم كامل للغة العربية.

---

## معايير المكونات

### 1. هيكلية المكون الأساسية

```typescript
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  /** وصف واضح للخاصية */
  title: string;
  /** اختياري: وصف الخاصية */
  subtitle?: string;
  /** دالة رد الفعل */
  onAction?: () => void;
  /** اتجاه النص - rtl للعربية */
  direction?: 'rtl' | 'ltr';
}

/**
 * مكون مثالي يوضح أفضل الممارسات
 * @component
 */
export const ExampleComponent: React.FC<ComponentProps> = ({
  title,
  subtitle,
  onAction,
  direction = 'rtl'
}) => {
  // State Management
  const [isActive, setIsActive] = useState(false);

  // Effects
  useEffect(() => {
    // تنظيف عند إلغاء المكون
    return () => {
      // cleanup code
    };
  }, []);

  // Event Handlers
  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };

  // Render
  return (
    <div dir={direction} className="component-wrapper">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      
      <button 
        onClick={handleClick}
        className={`btn ${isActive ? 'btn-active' : ''}`}
        aria-pressed={isActive}
      >
        {isActive ? 'نشط' : 'تفعيل'}
      </button>
    </div>
  );
};
```

---

## 2. Custom Hooks

### مثال على Hook مخصص للعربية

```typescript
import { useState, useEffect } from 'react';

/**
 * Hook للكشف عن اتجاه اللغة
 */
export const useDirection = () => {
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const htmlDir = document.documentElement.dir;
    setDirection(htmlDir === 'rtl' ? 'rtl' : 'ltr');
  }, []);

  const toggleDirection = () => {
    const newDir = direction === 'rtl' ? 'ltr' : 'rtl';
    setDirection(newDir);
    document.documentElement.dir = newDir;
  };

  return { direction, toggleDirection, isRTL: direction === 'rtl' };
};

/**
 * Hook للتعامل مع النماذج العربية
 */
export const useArabicForm = <T extends Record<string, any>>(
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // مسح الخطأ عند التغيير
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateArabicText = (text: string): boolean => {
    // التحقق من وجود نص عربي
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    setErrors,
    validateArabicText,
    reset
  };
};
```

---

## 3. إدارة الحالة المتقدمة

### استخدام Context للغة العربية

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ملف الترجمات
const translations = {
  ar: {
    welcome: 'مرحباً',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    // ... المزيد من الترجمات
  },
  en: {
    welcome: 'Welcome',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    // ... more translations
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const handleSetLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      direction,
      setLanguage: handleSetLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
```

---

## 4. تحسين الأداء

### استخدام React.memo

```typescript
import React, { memo } from 'react';

interface ArabicCardProps {
  title: string;
  content: string;
  imageUrl?: string;
}

export const ArabicCard = memo<ArabicCardProps>(({ 
  title, 
  content, 
  imageUrl 
}) => {
  return (
    <div dir="rtl" className="arabic-card">
      {imageUrl && <img src={imageUrl} alt={title} loading="lazy" />}
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // تحديث فقط عند تغيير البيانات
  return prevProps.title === nextProps.title &&
         prevProps.content === nextProps.content &&
         prevProps.imageUrl === nextProps.imageUrl;
});
```

### Lazy Loading للمكونات

```typescript
import React, { Suspense, lazy } from 'react';

// تحميل المكونات الكبيرة بشكل كسول
const ArabicEditor = lazy(() => import('./ArabicEditor'));
const ArabicDashboard = lazy(() => import('./ArabicDashboard'));

export const App: React.FC = () => {
  return (
    <Suspense fallback={<div className="text-center">جاري التحميل...</div>}>
      <ArabicDashboard />
    </Suspense>
  );
};
```

---

## 5. معالجة النماذج العربية

```typescript
import React, { FormEvent } from 'react';
import { useArabicForm } from './hooks/useArabicForm';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ArabicContactForm: React.FC = () => {
  const { values, errors, handleChange, setErrors, reset } = useArabicForm<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!values.name) newErrors.name = 'الاسم مطلوب';
    if (!values.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!values.message) newErrors.message = 'الرسالة مطلوبة';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        // API call here
        console.log('Form submitted:', values);
        reset();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">
      <div>
        <label>الاسم</label>
        <input 
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-msg">{errors.name}</span>}
      </div>
      
      {/* Other fields... */}
      
      <button type="submit">إرسال</button>
    </form>
  );
};
```

---

## 6. Accessibility للمحتوى العربي

```typescript
import React from 'react';

export const AccessibleArabicComponent: React.FC = () => {
  return (
    <div dir="rtl" lang="ar">
      <button aria-label="إغلاق القائمة">
        <span aria-hidden="true">×</span>
      </button>
      
      <nav aria-label="التنقل الرئيسي">
        <ul>
          <li><a href="/">الرئيسية</a></li>
          <li><a href="/about">من نحن</a></li>
        </ul>
      </nav>
    </div>
  );
};
```

---

## 7. Error Boundaries

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ArabicErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('خطأ في التطبيق:', error, errorInfo);
    // يمكن إرسال الخطأ لخدمة تتبع الأخطاء
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div dir="rtl" className="error-container">
          <h2>عذراً، حدث خطأ غير متوقع</h2>
          <p>يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
          <button onClick={() => window.location.reload()}>
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 8. أفضل الممارسات

### قائمة التحقق للمكونات الجديدة

- ✅ استخدام TypeScript مع Props محددة بوضوح
- ✅ دعم RTL للمحتوى العربي
- ✅ إضافة ARIA labels للوصولية
- ✅ معالجة الأخطاء بشكل صحيح
- ✅ تحسين الأداء (memo, lazy loading)
- ✅ كتابة اختبارات Unit Tests
- ✅ توثيق المكون بتعليقات JSDoc
- ✅ استخدام semantic HTML
- ✅ تطبيق responsive design
- ✅ التحقق من Accessibility

### نصائح للأداء

1. **تقليل re-renders غير الضرورية**
2. **استخدام useMemo و useCallback بحكمة**
3. **تقسيم الكود (Code Splitting)**
4. **تحسين الصور والأصول**
5. **استخدام Virtual Scrolling للقوائم الطويلة**

---

## الخلاصة

اتبع هذه الإرشادات عند تطوير مكونات React لضمان:
- كود نظيف وقابل للصيانة
- أداء محسّن
- دعم كامل للعربية
- إمكانية الوصول للجميع
- تجربة مستخدم ممتازة
