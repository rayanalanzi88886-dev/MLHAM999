# دليل النشر والاستضافة 🚀

## نشر على Vercel (موصى به)

### 1. التسجيل والإعداد
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول باستخدام GitHub
3. اضغط على "New Project"
4. اختر repository الخاص بك

### 2. الإعدادات
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Environment Variables
أضف في Project Settings:
```
VITE_GEMINI_API_KEY=your-api-key
```

### 4. النشر
```bash
npm install -g vercel
vercel login
vercel --prod
```

## نشر على Netlify

### 1. التسجيل
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخول باستخدام GitHub
3. اضغط على "Add new site"

### 2. الإعدادات
```
Build command: npm run build
Publish directory: dist
```

### 3. Environment Variables
```
VITE_GEMINI_API_KEY=your-api-key
```

## ملاحظات مهمة
- تأكد من وضع API keys في Environment Variables
- لا ترفع ملف .env على Git
- استخدم HTTPS في الإنتاج
