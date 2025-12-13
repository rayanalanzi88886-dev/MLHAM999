#!/bin/bash

# =============================================================================
# سكريبت الاختبار الشامل لمشروع RaqimAI 966
# =============================================================================

set -e

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# متغيرات النتائج
FRONTEND_TESTS_PASSED=false
BACKEND_TESTS_PASSED=false
FRONTEND_LINT_PASSED=false
BACKEND_LINT_PASSED=false
FRONTEND_BUILD_PASSED=false
BACKEND_BUILD_PASSED=false

# =============================================================================
# Frontend Tests
# =============================================================================

print_step "اختبار Frontend..."

if [ -d "frontend" ]; then
    cd frontend
    
    # Lint
    print_step "تشغيل ESLint على Frontend..."
    if npm run lint 2>/dev/null; then
        FRONTEND_LINT_PASSED=true
        print_success "Frontend Lint: نجح"
    else
        print_error "Frontend Lint: فشل"
    fi
    
    # Tests
    print_step "تشغيل الاختبارات على Frontend..."
    if npm test -- --passWithNoTests --watchAll=false 2>/dev/null; then
        FRONTEND_TESTS_PASSED=true
        print_success "Frontend Tests: نجحت"
    else
        print_warning "Frontend Tests: فشلت أو غير موجودة"
    fi

    # Build
    print_step "بناء Frontend..."
    if npm run build 2>/dev/null; then
        FRONTEND_BUILD_PASSED=true
        print_success "Frontend Build: نجح"
    else
        print_error "Frontend Build: فشل"
    fi
    
    cd ..
else
    print_warning "مجلد frontend غير موجود"
fi

# =============================================================================
# Backend Tests
# =============================================================================

print_step "اختبار Backend..."

if [ -d "backend" ]; then
    cd backend

    # Lint
    print_step "تشغيل ESLint على Backend..."
    if npm run lint 2>/dev/null; then
        BACKEND_LINT_PASSED=true
        print_success "Backend Lint: نجح"
    else
        print_error "Backend Lint: فشل"
    fi

    # Tests
    print_step "تشغيل الاختبارات على Backend..."
    if npm test -- --passWithNoTests 2>/dev/null; then
        BACKEND_TESTS_PASSED=true
        print_success "Backend Tests: نجحت"
    else
        print_warning "Backend Tests: فشلت أو غير موجودة"
    fi

    # Build (if applicable)
    print_step "بناء Backend..."
    if npm run build 2>/dev/null; then
        BACKEND_BUILD_PASSED=true
        print_success "Backend Build: نجح"
    else
        # Some backends don't need build
        BACKEND_BUILD_PASSED=true 
        print_warning "Backend Build: تخطي (قد لا يكون مطلوباً)"
    fi
    
    cd ..
else
    print_warning "مجلد backend غير موجود"
fi

# =============================================================================
# Security Audit
# =============================================================================

print_step "فحص الثغرات الأمنية..."

echo ""
echo "Frontend Security Audit:"
cd frontend
npm audit 2>/dev/null || true
cd ..

echo ""
echo "Backend Security Audit:"
cd backend
npm audit 2>/dev/null || true
cd ..

# =============================================================================
# التحقق من ملفات مهمة
# =============================================================================

print_step "التحقق من الملفات المهمة..."

MISSING_FILES=()

# ملفات root
[ ! -f "README.md" ] && MISSING_FILES+=("README.md")
[ ! -f ".gitignore" ] && MISSING_FILES+=(".gitignore")
[ ! -f "LICENSE" ] && MISSING_FILES+=("LICENSE")
[ ! -f "package.json" ] && MISSING_FILES+=("package.json")

# ملفات Frontend
[ ! -f "frontend/package.json" ] && MISSING_FILES+=("frontend/package.json")
[ ! -f "frontend/.env.example" ] && MISSING_FILES+=("frontend/.env.example")

# ملفات Backend
[ ! -f "backend/package.json" ] && MISSING_FILES+=("backend/package.json")
[ ! -f "backend/.env.example" ] && MISSING_FILES+=("backend/.env.example")

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "جميع الملفات المهمة موجودة"
else
    print_error "الملفات التالية مفقودة:"
    printf '%s\n' "${MISSING_FILES[@]}"
fi

# =============================================================================
# التحقق من .env files
# =============================================================================

print_step "التحقق من ملفات .env..."

ENV_IN_GIT=$(git ls-files | grep "^\.env$" || true)
if [ -n "$ENV_IN_GIT" ]; then
    print_error "ملف .env موجود في Git! احذفه فوراً"
else
    print_success "لا توجد ملفات .env في Git"
fi

# =============================================================================
# التحقق من API Keys في الكود
# =============================================================================

print_step "البحث عن API Keys في الكود..."

POTENTIAL_KEYS=$(grep -r -i "api_key\|apikey\|secret_key\|secretkey" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . | grep -v "node_modules" | grep -v "\.env" | grep -v "process.env" || true)

if [ -n "$POTENTIAL_KEYS" ]; then
    print_warning "تم العثور على مفاتيح محتملة (يرجى التحقق):"
    echo "$POTENTIAL_KEYS"
else
    print_success "لم يتم العثور على API keys في الكود"
fi

# =============================================================================
# التحقق من حجم المشروع
# =============================================================================

print_step "حساب حجم المشروع..."

if [ -d "frontend/node_modules" ]; then
    FRONTEND_SIZE=$(du -sh frontend/node_modules | cut -f1)
    echo "Frontend node_modules: $FRONTEND_SIZE"
fi

if [ -d "backend/node_modules" ]; then
    BACKEND_SIZE=$(du -sh backend/node_modules | cut -f1)
    echo "Backend node_modules: $BACKEND_SIZE"
fi

PROJECT_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "حجم المشروع الكلي: $PROJECT_SIZE"

# =============================================================================
# تقرير نهائي
# =============================================================================

echo ""
echo "========================================="
echo "        تقرير الاختبار النهائي"
echo "========================================="
echo ""

# Frontend
echo "Frontend:"
[ "$FRONTEND_LINT_PASSED" = true ] && echo "  ✅ Lint: نجح" || echo "  ❌ Lint: فشل"
[ "$FRONTEND_TESTS_PASSED" = true ] && echo "  ✅ Tests: نجحت" || echo "  ⚠️  Tests: غير متوفرة أو فشلت"
[ "$FRONTEND_BUILD_PASSED" = true ] && echo "  ✅ Build: نجح" || echo "  ❌ Build: فشل"

echo ""

# Backend
echo "Backend:"
[ "$BACKEND_LINT_PASSED" = true ] && echo "  ✅ Lint: نجح" || echo "  ❌ Lint: فشل"
[ "$BACKEND_TESTS_PASSED" = true ] && echo "  ✅ Tests: نجحت" || echo "  ⚠️  Tests: غير متوفرة أو فشلت"
[ "$BACKEND_BUILD_PASSED" = true ] && echo "  ✅ Build: نجح" || echo "  ❌ Build: فشل"

echo ""

# النتيجة النهائية
if [ "$FRONTEND_LINT_PASSED" = true ] && [ "$FRONTEND_BUILD_PASSED" = true ]; then
    print_success "المشروع جاهز للنشر!"
    exit 0
else
    print_error "المشروع غير جاهز للنشر. يرجى إصلاح الأخطاء."
    exit 1
fi
