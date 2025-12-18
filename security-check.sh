#!/bin/bash
# Security Check Script
# يتحقق من عدم وجود API Keys مكشوفة في الكود

echo "🔒 فحص أمان المشروع..."
echo ""

# 1. البحث عن API Keys في الكود
echo "1️⃣ البحث عن API Keys..."
if grep -r "sk-ant-" --exclude-dir={node_modules,dist,.git} --exclude="*.md" .; then
    echo "❌ تحذير: وُجد Claude API Key في الكود!"
    exit 1
fi

if grep -r "AIza" --exclude-dir={node_modules,dist,.git} --exclude="*.md" .; then
    echo "❌ تحذير: وُجد Google API Key في الكود!"
    exit 1
fi

echo "✅ لم يتم العثور على API Keys في الكود"
echo ""

# 2. التحقق من .env في Git history
echo "2️⃣ التحقق من .env في Git history..."
if git log --all --full-history -- ".env*" | grep -q "commit"; then
    echo "⚠️  تحذير: .env موجود في Git history!"
    echo "   قم بتنظيف التاريخ باستخدام:"
    echo "   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env*' --prune-empty --tag-name-filter cat -- --all"
else
    echo "✅ .env غير موجود في Git history"
fi
echo ""

# 3. التحقق من .gitignore
echo "3️⃣ التحقق من .gitignore..."
if grep -q "\.env" .gitignore; then
    echo "✅ .gitignore يحمي .env"
else
    echo "❌ خطأ: .gitignore لا يحمي .env!"
    exit 1
fi
echo ""

# 4. التحقق من package.json scripts
echo "4️⃣ التحقق من package.json..."
if grep -q "\"build\":" package.json; then
    echo "✅ build script موجود"
else
    echo "❌ خطأ: build script غير موجود!"
    exit 1
fi
echo ""

echo "✅ الفحص الأمني اكتمل بنجاح!"
echo "المشروع جاهز للرفع 🚀"
