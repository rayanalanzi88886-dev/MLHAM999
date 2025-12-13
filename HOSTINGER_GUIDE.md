<div dir="rtl">

# دليل استضافة RaqimAI 966 على Hostinger 🚀

هذا الدليل الشامل يشرح جميع طرق استضافة المشروع على Hostinger.

---

## جدول المحتويات

1. [خيارات الاستضافة](#خيارات-الاستضافة)
2. [الطريقة 1: Shared Hosting](#الطريقة-1-shared-hosting)
3. [الطريقة 2: VPS](#الطريقة-2-vps)
4. [الطريقة 3: Hybrid](#الطريقة-3-hybrid)
5. [إعداد DNS](#إعداد-dns)
6. [SSL Certificate](#ssl-certificate)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## خيارات الاستضافة

### المقارنة:

| الخاصية | Shared Hosting | VPS | Hybrid |
|---------|---------------|-----|---------|
| التكلفة | منخفضة | متوسطة | متوسطة |
| الأداء | جيد للـ Frontend | ممتاز | ممتاز |
| التعقيد | بسيط | معقد | متوسط |
| Node.js Support | محدود | كامل | كامل |
| موصى به لـ | مشاريع صغيرة | مشاريع كبيرة | الأفضل |

---

## الطريقة 1: Shared Hosting

### متى تستخدمها؟
- مشروع صغير أو متوسط
- ميزانية محدودة
- لا تحتاج ميزات Backend متقدمة

### الخطوات:

#### 1. بناء Frontend

```bash
cd frontend
npm run build
```

#### 2. رفع الملفات

1. افتح File Manager في Hostinger
2. اذهب إلى `public_html/`
3. ارفع محتويات مجلد `dist/` (وليس المجلد نفسه)

#### 3. إعداد .htaccess

أنشئ ملف `.htaccess` في `public_html/`:

```apache
# تفعيل Rewrite Engine
RewriteEngine On
RewriteBase /

# إعادة توجيه API calls إلى Backend خارجي
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ https://your-backend.railway.app/api/$1 [P,L]

# React Router - إعادة توجيه جميع الطلبات إلى index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# تفعيل HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_PATH} [L,R=301]

# منع الوصول إلى .env
<Files .env>
    Order allow,deny
    Deny from all
</Files>

# تفعيل Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/xml
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/x-javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    # XSS Protection
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-backend.railway.app"
</IfModule>

# Disable Directory Browsing
Options -Indexes

# Custom Error Pages
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
</IfModule>
```

#### 4. تحديث API URL

تأكد من أن Frontend يشير إلى Backend الصحيح:

```javascript
// في ملف .env أو config
VITE_API_URL=https://your-backend.railway.app/api
```

---

## الطريقة 2: VPS

### متى تستخدمها؟
- مشروع كبير
- تحتاج تحكم كامل
- ميزانية أكبر

### الخطوات الكاملة:

#### 1. الوصول إلى VPS

```bash
# SSH إلى VPS
ssh root@your-vps-ip

# تحديث النظام
apt update && apt upgrade -y
```

#### 2. تثبيت Node.js

```bash
# تثبيت Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# التحقق
node --version
npm --version
```

#### 3. تثبيت MongoDB

```bash
# إضافة MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# التثبيت
apt-get update
apt-get install -y mongodb-org

# تشغيل MongoDB
systemctl start mongod
systemctl enable mongod

# التحقق
systemctl status mongod
```

#### 4. تثبيت Nginx

```bash
# التثبيت
apt install nginx -y

# تشغيل Nginx
systemctl start nginx
systemctl enable nginx

# التحقق
systemctl status nginx
```

#### 5. تثبيت PM2

```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# التحقق
pm2 --version
```

#### 6. إعداد Git

```bash
# تثبيت Git
apt install git -y

# إعداد Git credentials
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

#### 7. استنساخ المشروع

```bash
# إنشاء مجلد للمشروع
mkdir -p /var/www
cd /var/www

# استنساخ من GitHub
git clone https://github.com/your-username/raqimai-966.git
cd raqimai-966

# أو رفع يدوي باستخدام SFTP
```

#### 8. إعداد Backend

```bash
cd /var/www/raqimai-966/backend

# تثبيت dependencies
npm install

# إنشاء .env
nano .env
```

محتوى `.env`:

```env
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/raqimai966

# JWT
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRE=30d

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=...

# CORS
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

```bash
# تشغيل Backend مع PM2
pm2 start src/server.js --name raqimai-api

# حفظ التكوين
pm2 save

# تفعيل auto-start
pm2 startup

# التحقق
pm2 status
pm2 logs raqimai-api
```

#### 9. إعداد Frontend

```bash
cd /var/www/raqimai-966/frontend

# إنشاء .env.production
nano .env.production
```

محتوى `.env.production`:

```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=RaqimAI 966
```

```bash
# تثبيت dependencies
npm install

# بناء للإنتاج
npm run build

# نسخ إلى مجلد Nginx
mkdir -p /var/www/html/raqimai
cp -r dist/* /var/www/html/raqimai/
```

#### 10. تكوين Nginx

```bash
# إنشاء ملف تكوين
nano /etc/nginx/sites-available/raqimai
```

محتوى الملف:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Config (after certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/html/raqimai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل التكوين
ln -s /etc/nginx/sites-available/raqimai /etc/nginx/sites-enabled/

# حذف التكوين الافتراضي
rm /etc/nginx/sites-enabled/default

# اختبار التكوين
nginx -t

# إعادة تحميل Nginx
systemctl reload nginx
```
