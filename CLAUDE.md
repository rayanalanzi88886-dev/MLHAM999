# CLAUDE.md - دليل المشروع الشامل

## نظرة عامة على المشروع
هذا المشروع عبارة عن [وصف المشروع - يتم تخصيصه حسب كل مشروع].

### الأهداف الرئيسية
- تطوير حلول برمجية احترافية باستخدام أحدث التقنيات
- دعم كامل للغة العربية مع RTL
- تطبيق أفضل ممارسات الأمان والأداء
- بناء واجهات مستخدم حديثة وسهلة الاستخدام

### التقنيات المستخدمة
- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express/Fastify
- **Database**: PostgreSQL/MongoDB
- **AI Integration**: Anthropic Claude API, OpenAI
- **DevOps**: Docker, GitHub Actions, Vercel/Netlify

---

## هيكلية المشروع

```
project-root/
├── src/
│   ├── components/     # مكونات React القابلة لإعادة الاستخدام
│   ├── pages/          # صفحات التطبيق
│   ├── services/       # خدمات API والتكاملات
│   ├── utils/          # أدوات مساعدة
│   ├── hooks/          # Custom React Hooks
│   ├── types/          # تعريفات TypeScript
│   └── styles/         # ملفات التنسيق
├── public/             # الملفات الثابتة
├── api/                # Backend APIs
├── tests/              # الاختبارات
├── docs/               # الوثائق
├── .github/            # GitHub workflows
├── CLAUDE.md           # هذا الملف
├── SKILLS/             # ملفات Skills للتطوير
└── package.json
```

---

## إرشادات التطوير مع Claude

### 1. معايير الكود
- استخدم TypeScript لجميع الملفات الجديدة
- اتبع معايير ESLint و Prettier المحددة
- اكتب كود نظيف وقابل للصيانة مع تعليقات واضحة
- استخدم أسماء متغيرات ودوال وصفية بالإنجليزية
- التعليقات والوثائق بالعربية للتوضيح

### 2. دعم اللغة العربية
```typescript
// مثال على مكون يدعم العربية
interface ArabicComponentProps {
  title: string;
  description: string;
  direction?: 'rtl' | 'ltr';
}

const ArabicComponent: React.FC<ArabicComponentProps> = ({ 
  title, 
  description, 
  direction = 'rtl' 
}) => {
  return (
    <div dir={direction} className="font-arabic">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};
```

### 3. إدارة الحالة
- استخدم React Context للحالة العامة
- استخدم useState و useReducer للحالة المحلية
- استخدم React Query لإدارة حالة البيانات من API

### 4. الأمان
- لا تضع مفاتيح API في الكود
- استخدم متغيرات البيئة (.env)
- طبّق التحقق من المدخلات والمخرجات
- استخدم HTTPS لجميع الطلبات
- طبّق معايير CORS المناسبة

### 5. تكامل AI
```typescript
// مثال على استدعاء Claude API
async function callClaudeAPI(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });
  
  return await response.json();
}
```

---

## سير العمل للتطوير

### إضافة ميزة جديدة
1. أنشئ فرع جديد: `git checkout -b feature/feature-name`
2. طوّر الميزة مع اختبارات شاملة
3. تأكد من اجتياز جميع الاختبارات
4. أنشئ Pull Request مع وصف تفصيلي
5. راجع الكود قبل الدمج

### إصلاح خطأ
1. حدد المشكلة وأنشئ Issue على GitHub
2. أنشئ فرع: `git checkout -b fix/bug-description`
3. أصلح المشكلة واختبر الحل
4. أنشئ Pull Request مع الإشارة للـ Issue

---

## الاختبارات

### اختبارات الوحدة (Unit Tests)
```typescript
// مثال على اختبار مكون
import { render, screen } from '@testing-library/react';
import { ArabicComponent } from './ArabicComponent';

describe('ArabicComponent', () => {
  it('يعرض العنوان بشكل صحيح', () => {
    render(<ArabicComponent title="عنوان تجريبي" description="وصف" />);
    expect(screen.getByText('عنوان تجريبي')).toBeInTheDocument();
  });
});
```

### اختبارات التكامل
- اختبر تدفقات المستخدم الكاملة
- تحقق من التكاملات مع APIs الخارجية
- اختبر سيناريوهات الأخطاء

---

## النشر (Deployment)

### البيئات
- **Development**: تحديثات تلقائية من `develop` branch
- **Staging**: اختبار قبل الإنتاج من `staging` branch
- **Production**: نشر من `main` branch فقط

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

---

## إرشادات خاصة لـ Claude

### عند إنشاء مكونات جديدة
1. استخدم TypeScript مع تعريفات Props واضحة
2. اتبع نمط Functional Components مع Hooks
3. أضف دعم RTL للعربية تلقائياً
4. طبّق Accessibility (a11y) standards
5. اكتب تعليقات توضيحية بالعربية

### عند العمل على API
1. استخدم async/await للعمليات غير المتزامنة
2. طبّق معالجة الأخطاء الشاملة
3. أضف rate limiting للحماية
4. وثّق جميع endpoints بوضوح
5. استخدم TypeScript للطلبات والاستجابات

### عند تحسين الأداء
1. استخدم React.memo للمكونات الثقيلة
2. طبّق lazy loading للصفحات
3. احذف التبعيات غير المستخدمة
4. استخدم code splitting
5. قم بتحسين الصور والأصول

---

## الموارد والمراجع

### الوثائق
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Claude API Docs](https://docs.anthropic.com)

### أدوات مفيدة
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Type Checking**: TypeScript
- **Bundling**: Vite/Webpack
- **Version Control**: Git + GitHub

---

## ملاحظات مهمة

### للمطورين
- راجع ملفات SKILLS/ لأفضل الممارسات التفصيلية
- التزم بمعايير الكود المحددة
- اكتب اختبارات لجميع الميزات الجديدة
- وثّق التغييرات المهمة

### لـ Claude
- اقرأ ملفات SKILLS المناسبة قبل البدء
- اتبع معايير المشروع الموجودة
- اسأل عن التوضيحات عند الحاجة
- اقترح تحسينات عندما ترى فرصاً

---

## الاتصال والدعم

**المطور الرئيسي**: Rayan
**البريد الإلكتروني**: [contact email]
**GitHub**: [repository URL]

---

## الترخيص
[تحديد نوع الترخيص - MIT, Apache, إلخ]

---

## التحديثات الأخيرة
- [التاريخ]: [وصف التحديث]
- [التاريخ]: [وصف التحديث]

---

*آخر تحديث: ديسمبر 2024*
