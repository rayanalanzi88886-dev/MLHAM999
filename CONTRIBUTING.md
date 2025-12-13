# دليل المساهمة

## كيف تساهم

### 1. Fork المشروع
اضغط على زر "Fork" في أعلى الصفحة

### 2. Clone المشروع
```bash
git clone https://github.com/your-username/expert-chat-financial-advisor.git
cd expert-chat-financial-advisor
```

### 3. إنشاء Branch جديد
```bash
git checkout -b feature/your-feature-name
```

### 4. إعداد البيئة
```bash
npm install
cp .env.example .env
```

### 5. إجراء التغييرات
- اكتب كود نظيف وواضح
- اتبع معايير الكود
- أضف اختبارات للميزات الجديدة

### 6. Commit التغييرات
```bash
git add .
git commit -m "feat: إضافة ميزة جديدة"
```

### 7. Push إلى GitHub
```bash
git push origin feature/your-feature-name
```

### 8. فتح Pull Request
اذهب إلى صفحة المشروع وافتح Pull Request

## معايير الكود

### JavaScript/React
```javascript
// ✅ صحيح
const MyComponent = ({ data }) => {
  const [state, setState] = useState(null);
  return <div>{data}</div>;
};

// ❌ خطأ
var MyComponent = function(props) {
  var state = null;
  return <div>{props.data}</div>;
}
```

### Commit Messages
استخدم Conventional Commits:
- `feat:` - ميزة جديدة
- `fix:` - إصلاح bug
- `docs:` - تحديث الوثائق
- `style:` - تغييرات التنسيق
