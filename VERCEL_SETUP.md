# 🚀 إعداد Vercel Environment Variables

## 📝 الخطوات:

### 1. افتح Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2. اختر المشروع
- Project: **MLHAM999**
- أو: https://vercel.com/[your-username]/mlham999

### 3. اذهب إلى Settings
```
Dashboard → MLHAM999 → Settings → Environment Variables
```

### 4. أضف المفاتيح المطلوبة

#### ✅ مفاتيح إجبارية:

**VITE_ANTHROPIC_API_KEY**
```
Name: VITE_ANTHROPIC_API_KEY
Value: sk-ant-api03-[your-key-here]
Environment: 
  ☑ Production
  ☑ Preview
  ☑ Development
```

**VITE_GEMINI_API_KEY**
```
Name: VITE_GEMINI_API_KEY
Value: AIzaSy[your-key-here]
Environment:
  ☑ Production
  ☑ Preview
  ☑ Development
```

#### 🔹 مفاتيح اختيارية (للميزات الإضافية):

**VITE_TOGETHER_API_KEY** (للنموذج المخصص - اختياري)
```
Name: VITE_TOGETHER_API_KEY
Value: [your-key]
Environment: Production, Preview, Development
```

**VITE_GOOGLE_API_KEY** (للبحث - اختياري)
```
Name: VITE_GOOGLE_API_KEY
Value: [your-key]
Environment: Production, Preview, Development
```

**VITE_GOOGLE_CX** (للبحث - اختياري)
```
Name: VITE_GOOGLE_CX
Value: [your-cx-id]
Environment: Production, Preview, Development
```

### 5. احفظ التغييرات
- اضغط **Save**
- Vercel ستطلب إعادة النشر: اضغط **Redeploy**

### 6. انتظر Build
- Build time: ~1-2 دقيقة
- راقب Build Logs للتأكد من النجاح

---

## ✅ التحقق من نجاح الإعداد

### 1. افتح الموقع المباشر
```
https://mlham999.vercel.app
```

### 2. افتح Console (F12)
```javascript
// يجب ألا ترى أخطاء API
// يجب أن ترى:
"✅ Claude Haiku | Cost: $0.XXX"
// أو
"✨ Gemini Flash | Cost: $0 (Free)"
```

### 3. جرّب خبير واحد
- اختر أي خبير
- اكتب سؤال
- انتظر الرد
- إذا حصلت على رد → ✅ كل شيء يعمل!

---

## 🐛 حل المشاكل

### ❌ "API Key not found"
**السبب**: المفتاح غير موجود أو خطأ في الاسم

**الحل**:
1. تأكد من الاسم بالضبط: `VITE_ANTHROPIC_API_KEY` (مع VITE_)
2. تأكد من Environment: Production ✅
3. Redeploy المشروع

### ❌ "Invalid API Key"
**السبب**: المفتاح غير صحيح أو منتهي

**الحل**:
1. تحقق من المفتاح في Anthropic/Google Console
2. انسخ مفتاح جديد
3. حدّث في Vercel → Save → Redeploy

### ❌ Build يفشل
**السبب**: خطأ في الكود أو Dependencies

**الحل**:
1. راجع Build Logs في Vercel
2. إذا كان الخطأ في TypeScript:
   ```bash
   npm run build
   # إصلح الأخطاء محلياً ثم push
   ```

---

## 💡 نصائح مهمة

### ✅ Do's:
- ✅ استخدم Environment Variables في Vercel فقط
- ✅ احتفظ بنسخة احتياطية من المفاتيح في مكان آمن
- ✅ جدّد المفاتيح كل 6 أشهر للأمان
- ✅ راقب تكلفة API شهرياً

### ❌ Don'ts:
- ❌ لا ترفع .env على Git أبداً
- ❌ لا تشارك المفاتيح في الكود
- ❌ لا تعرض المفاتيح في Console.log
- ❌ لا تنسى تحديد Environment (Production)

---

## 📊 الحالة المتوقعة بعد الإعداد

| البند | الحالة |
|-------|---------|
| VITE_ANTHROPIC_API_KEY | ✅ Set |
| VITE_GEMINI_API_KEY | ✅ Set |
| Build Status | ✅ Success |
| Deployment | ✅ Live |
| API Calls | ✅ Working |
| Cost Tracking | ✅ Active |

---

## 🔄 تحديث المفاتيح لاحقاً

```
Vercel Dashboard 
→ MLHAM999 
→ Settings 
→ Environment Variables 
→ Edit (قلم) بجانب المفتاح
→ Update Value
→ Save
→ Redeploy
```

---

**آخر تحديث**: ديسمبر 18, 2025  
**الموقع**: https://mlham999.vercel.app
