# سياسة الأمان

## الإبلاغ عن ثغرة أمنية

إذا اكتشفت ثغرة أمنية، يرجى عدم فتح Issue عامة.

بدلاً من ذلك:
- أرسل email إلى: security@example.com

## أفضل الممارسات الأمنية

### للمطورين

#### 1. حماية API Keys
```javascript
// ✅ صحيح
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ خطأ
const apiKey = "hardcoded-key";
```

#### 2. التحقق من المدخلات
```javascript
// ✅ صحيح - تنظيف المدخلات
const sanitizedInput = DOMPurify.sanitize(userInput);

// ❌ خطأ - استخدام مباشر
element.innerHTML = userInput;
```

#### 3. HTTPS فقط
- استخدم HTTPS في الإنتاج
- لا ترسل API keys عبر HTTP

### للمستخدمين

- لا تشارك API keys الخاصة بك
- استخدم API keys مختلفة للتطوير والإنتاج
- قم بتغيير API keys دورياً

## سياسة حماية البيانات

### ما نجمعه
- معلومات المحادثة المحلية (localStorage فقط)
- لا نرسل بيانات شخصية لخوادمنا

### كيف نحميها
- تشفير البيانات في النقل (HTTPS)
- التخزين المحلي فقط
- لا مشاركة مع أطراف ثالثة

## الاتصال
للأسئلة الأمنية: security@example.com
