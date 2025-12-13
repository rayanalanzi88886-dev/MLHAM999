<div dir="rtl">

# دليل البدء السريع ⚡

## نظرة سريعة - 5 دقائق

تجهيز المشروع للرفع على GitHub والنشر.

---

## الخطوة 1: التنظيف (دقيقتان)

```bash
# تشغيل سكريبت التنظيف
chmod +x cleanup.sh
./cleanup.sh
```

**ما يفعله:**
- حذف node_modules
- حذف ملفات build
- حذف ملفات cache و logs
- حذف ملفات OS المؤقتة
- البحث عن ملفات .env و مكررة

---

## الخطوة 2: إعادة التثبيت (3 دقائق)

```bash
# تشغيل سكريبت التثبيت
chmod +x install.sh
./install.sh
```

**ما يفعله:**
- تثبيت Frontend dependencies
- تثبيت Backend dependencies
- إصلاح الثغرات الأمنية
- إنشاء ملفات .env من .env.example

**بعد ذلك:**
1. افتح `frontend/.env`
2. افتح `backend/.env`
3. عدّل القيم حسب بيئتك

---

## الخطوة 3: الاختبار (دقيقتان)

```bash
# تشغيل جميع الاختبارات
chmod +x test-all.sh
./test-all.sh
```

**ما يفعله:**
- Lint Frontend و Backend
- اختبارات Frontend و Backend
- بناء Frontend و Backend
- فحص أمني
- تقرير نهائي

---

## الخطوة 4: الرفع على GitHub (دقيقة)

### أول مرة:

```bash
git init
git add .
git commit -m "Initial commit: RaqimAI 966 project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/raqimai-966.git
git push -u origin main
```

### التحديثات:

```bash
git add .
git commit -m "feat: your changes description"
git push
```

---

## الخطوة 5: النشر (5 دقائق)

### خيار أ: Vercel + Railway (موصى به)

#### Frontend على Vercel:

```bash
# تثبيت Vercel CLI
npm install -g vercel

# النشر
cd frontend
vercel --prod
```

**أو** من Vercel Dashboard:
1. اذهب إلى vercel.com
2. Import من GitHub
3. اختر المشروع
4. Root: `frontend`
5. Deploy!

#### Backend على Railway:

1. اذهب إلى railway.app
2. New Project > Deploy from GitHub
3. اختر Repository
4. Root: `backend`
5. أضف Environment Variables
6. Deploy!

---

### خيار ب: Hostinger (All-in-One)

#### Shared Hosting:

```bash
# 1. بناء Frontend
cd frontend
npm run build

# 2. رفع dist/ إلى public_html/ عبر FTP
# 3. رفع Backend على Railway/Render
# 4. تحديث .htaccess للـ proxy
```

#### VPS:

```bash
# راجع HOSTINGER_GUIDE.md للتفاصيل الكاملة

# ملخص سريع:
ssh root@your-vps
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx mongodb
npm install -g pm2
git clone https://github.com/YOUR-USERNAME/raqimai-966.git
cd raqimai-966
# اتبع باقي الخطوات في HOSTINGER_GUIDE.md
```

---

## ملخص الأوامر الأساسية

```bash
# التنظيف
./cleanup.sh

# التثبيت
./install.sh

# الاختبار
./test-all.sh

# التطوير (Frontend + Backend معاً)
npm run dev

# التطوير (منفصل)
npm run dev:frontend  # Frontend فقط
npm run dev:backend   # Backend فقط

# البناء
npm run build

# Lint
npm run lint

# Tests
npm run test
```

---

## Environment Variables

### Frontend (.env):

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=RaqimAI 966
```

### Backend (.env):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/raqimai966
JWT_SECRET=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=...
FRONTEND_URL=http://localhost:5173
```

---

## هيكل المشروع

```
raqimai-966/
├── frontend/          # React App
├── backend/           # Node.js API
├── .github/           # GitHub Workflows
├── cleanup.sh         # سكريبت التنظيف
├── install.sh         # سكريبت التثبيت
├── test-all.sh        # سكريبت الاختبار
├── README.md          # التوثيق الرئيسي
├── DEPLOYMENT.md      # دليل النشر الكامل
├── HOSTINGER_GUIDE.md # دليل Hostinger
├── CHECKLIST.md       # Checklist شامل
└── package.json       # Package الرئيسي
```

---

## الملفات المهمة

| الملف | الاستخدام |
|-------|-----------|
| `QUICK_START.md` | هذا الملف - بدء سريع |
| `README.md` | التوثيق الكامل |
| `DEPLOYMENT.md` | دليل النشر التفصيلي |
| `HOSTINGER_GUIDE.md` | Hostinger خطوة بخطوة |
| `CHECKLIST.md` | Checklist قبل النشر |
| `PROJECT_REVIEW_RULES.md` | قواعد المراجعة الشاملة |
| `CONTRIBUTING.md` | دليل المساهمة |
| `SECURITY.md` | سياسة الأمان |

---

## الأخطاء الشائعة وحلولها

### 1. Port already in use

```bash
# قتل العملية على port 5000
kill -9 $(lsof -ti:5000)

# أو استخدم port آخر في .env
PORT=5001
```

### 2. MongoDB connection failed

```bash
# تشغيل MongoDB
# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### 3. API CORS error

```javascript
// في backend - تأكد من:
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
app.use(cors(corsOptions));
```

### 4. Build fails

```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# أو استخدم cleanup.sh
./cleanup.sh
./install.sh
```

---

## الخطوات التالية

بعد إتمام البدء السريع:

1. ✅ **اقرأ README.md** للتفاصيل الكاملة
2. ✅ **راجع CHECKLIST.md** قبل النشر
3. ✅ **اتبع DEPLOYMENT.md** للنشر المفصل
4. ✅ **استخدم PROJECT_REVIEW_RULES.md** للمراجعة الشاملة

---

## الدعم

### وثائق المشروع:
- [README.md](README.md) - التوثيق الكامل
- [DEPLOYMENT.md](DEPLOYMENT.md) - دليل النشر
- [HOSTINGER_GUIDE.md](HOSTINGER_GUIDE.md) - دليل Hostinger

### الموارد الخارجية:
- Vercel Docs: vercel.com/docs
- Railway Docs: docs.railway.app
- MongoDB Atlas: docs.atlas.mongodb.com
- Hostinger: support.hostinger.com

### التواصل:
- GitHub Issues
- Email: support@raqimai966.com
- Twitter: @raqimai966

---

## نصائح إضافية

### للتطوير:

```bash
# استخدم nodemon للـ auto-reload
npm install -D nodemon

# استخدم concurrently لتشغيل Frontend + Backend
npm install -D concurrently

# في package.json:
"dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\""
```

### للإنتاج:

```bash
# تأكد من:
- NODE_ENV=production
- استخدام HTTPS
- تفعيل compression
- تفعيل caching
- إخفاء error messages
```

### للأمان:

```bash
# قبل النشر:
npm audit fix
npm run test
./test-all.sh

# راجع SECURITY.md
```

---

## Timeline المقترح

### اليوم 1: الإعداد والتنظيف
- ✅ تشغيل cleanup.sh
- ✅ تشغيل install.sh
- ✅ إعداد .env files
