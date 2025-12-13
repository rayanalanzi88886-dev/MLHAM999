#!/bin/bash

# =============================================================================
# سكريبت التنظيف الشامل لمشروع RaqimAI 966
# =============================================================================

set -e  # إيقاف السكريبت عند أي خطأ

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة لطباعة رسائل ملونة
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# =============================================================================
# المرحلة 1: فحص البيئة
# =============================================================================

print_step "المرحلة 1: فحص البيئة..."

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js غير مثبت! يرجى تثبيته أولاً."
    exit 1
fi
print_success "Node.js مثبت: $(node --version)"

# التحقق من npm
if ! command -v npm &> /dev/null; then
    print_error "npm غير مثبت! يرجى تثبيته أولاً."
    exit 1
fi
print_success "npm مثبت: $(npm --version)"

# التحقق من Git
if ! command -v git &> /dev/null; then
    print_error "Git غير مثبت! يرجى تثبيته أولاً."
    exit 1
fi
print_success "Git مثبت: $(git --version)"

# =============================================================================
# المرحلة 2: حفظ نسخة احتياطية
# =============================================================================

print_step "المرحلة 2: إنشاء نسخة احتياطية..."

BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "../$BACKUP_DIR"

print_warning "جاري إنشاء نسخة احتياطية في ../$BACKUP_DIR"

# نسخ الملفات المهمة فقط
cp -r . "../$BACKUP_DIR" 2>/dev/null || true
rm -rf "../$BACKUP_DIR/node_modules"
rm -rf "../$BACKUP_DIR/frontend/node_modules"
rm -rf "../$BACKUP_DIR/backend/node_modules"
rm -rf "../$BACKUP_DIR/frontend/dist"
rm -rf "../$BACKUP_DIR/backend/dist"

print_success "تم إنشاء النسخة الاحتياطية"

# =============================================================================
# المرحلة 3: حذف node_modules
# =============================================================================

print_step "المرحلة 3: حذف node_modules..."

find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
print_success "تم حذف جميع مجلدات node_modules"

# =============================================================================
# المرحلة 4: حذف ملفات Build
# =============================================================================

print_step "المرحلة 4: حذف ملفات Build..."

# Frontend
rm -rf frontend/dist
rm -rf frontend/build
rm -rf frontend/.next

# Backend
rm -rf backend/dist
rm -rf backend/build

print_success "تم حذف ملفات Build"

# =============================================================================
# المرحلة 5: حذف ملفات Cache
# =============================================================================

print_step "المرحلة 5: حذف ملفات Cache..."

# Cache directories
find . -name ".cache" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
find . -name ".parcel-cache" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
find . -name ".vite" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true

# ESLint cache
find . -name ".eslintcache" -type f -delete 2>/dev/null || true

print_success "تم حذف ملفات Cache"

# =============================================================================
# المرحلة 6: حذف Log files
# =============================================================================

print_step "المرحلة 6: حذف Log files..."

find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-error.log*" -type f -delete 2>/dev/null || true

print_success "تم حذف Log files"

# =============================================================================
# المرحلة 7: حذف ملفات OS
# =============================================================================

print_step "المرحلة 7: حذف ملفات OS..."

# macOS
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name ".AppleDouble" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true

# Windows
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "Desktop.ini" -type f -delete 2>/dev/null || true

print_success "تم حذف ملفات OS"

# =============================================================================
# المرحلة 8: حذف ملفات Editor
# =============================================================================

print_step "المرحلة 8: حذف ملفات Editor..."

# Vim
find . -name "*.swp" -type f -delete 2>/dev/null || true
find . -name "*.swo" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true

# Emacs
find . -name "#*#" -type f -delete 2>/dev/null || true

print_success "تم حذف ملفات Editor"

# =============================================================================
# المرحلة 9: حذف ملفات مؤقتة
# =============================================================================

print_step "المرحلة 9: حذف ملفات مؤقتة..."

find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.old" -type f -delete 2>/dev/null || true

print_success "تم حذف ملفات مؤقتة"

# =============================================================================
# المرحلة 10: حذف ملفات Coverage و Test
# =============================================================================

print_step "المرحلة 10: حذف ملفات Coverage و Test..."

find . -name "coverage" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
find . -name ".nyc_output" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
