#!/bin/bash

# ============================================
# Customer Service System - Complete Deployment
# ============================================

set -e  # Exit on first error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "════════════════════════════════════════════════════"
echo "🚀 نظام خدمة العملاء - الدفع والنشر الكامل"
echo "════════════════════════════════════════════════════"
echo ""

# ============================================
# Step 1: Verify Build
# ============================================

echo "═════════════════════════════════════════"
echo "📋 Step 1: التحقق من البناء"
echo "═════════════════════════════════════════"
echo ""

if [ -d ".next" ]; then
    echo -e "${GREEN}✅${NC} مجلد البناء موجود"
else
    echo -e "${YELLOW}⚠️${NC} مجلد البناء غير موجود - جاري البناء..."
    npm run build
fi

echo ""

# ============================================
# Step 2: Check Git Status
# ============================================

echo "═════════════════════════════════════════"
echo "📋 Step 2: حالة Git"
echo "═════════════════════════════════════════"
echo ""

CHANGES=$(git status --porcelain | wc -l)

if [ $CHANGES -gt 0 ]; then
    echo -e "${BLUE}📝 التغييرات الموجودة:${NC}"
    git status --short | head -20
    
    if [ $CHANGES -gt 20 ]; then
        echo "... و $(($CHANGES - 20)) ملف آخر"
    fi
else
    echo -e "${YELLOW}⚠️ لا توجد تغييرات جديدة${NC}"
fi

echo ""

# ============================================
# Step 3: Commit
# ============================================

echo "═════════════════════════════════════════"
echo "📋 Step 3: حفظ التغييرات (Commit)"
echo "═════════════════════════════════════════"
echo ""

DEFAULT_MSG="feat: add customer service dashboard system and fix server/client components"

echo "رسالة الـ Commit الحالية:"
echo "  $DEFAULT_MSG"
echo ""
read -p "هل تريدين تغييرها؟ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "اكتبي رسالة جديدة: " COMMIT_MSG
else
    COMMIT_MSG=$DEFAULT_MSG
fi

echo ""
echo -e "${BLUE}جاري الحفظ...${NC}"
git add -A
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم حفظ التغييرات بنجاح${NC}"
else
    echo -e "${RED}❌ فشل حفظ التغييرات${NC}"
    exit 1
fi

echo ""

# ============================================
# Step 4: Select Branch
# ============================================

echo "═════════════════════════════════════════"
echo "📋 Step 4: اختيار الفرع"
echo "═════════════════════════════════════════"
echo ""

echo "الفروع المتاحة:"
git branch -a | sed 's/^/  /'
echo ""

read -p "اختري فرع الدفع (main/develop): " BRANCH

if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

echo ""

# ============================================
# Step 5: Push to GitHub
# ============================================

echo "═════════════════════════════════════════"
echo "📋 Step 5: الدفع إلى GitHub"
echo "═════════════════════════════════════════"
echo ""

echo -e "${BLUE}جاري الدفع إلى: ${YELLOW}$BRANCH${NC}"
echo ""

git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ تم الدفع إلى GitHub بنجاح!${NC}"
else
    echo ""
    echo -e "${RED}❌ فشل الدفع إلى GitHub${NC}"
    exit 1
fi

echo ""

# ============================================
# Step 6: Show Deployment Info
# ============================================

echo "════════════════════════════════════════════════════"
echo "✅ اكتمل الدفع إلى GitHub!"
echo "════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}📍 الخطوة التالية: النشر على Hostinger${NC}"
echo ""

echo "🔗 الرابط:"
echo "   https://github.com/yourusername/nafsi-platform"
echo ""

echo "📊 معلومات الـ Commit:"
git log --oneline -1
echo ""

echo "📁 الملفات المُرسلة:"
COMMIT_FILES=$(git log -1 --name-status | tail -n +2 | wc -l)
echo "   $COMMIT_FILES ملف"
echo ""

# ============================================
# Step 7: Hostinger Deployment Steps
# ============================================

echo "═════════════════════════════════════════"
echo "🚀 خطوات النشر على Hostinger"
echo "═════════════════════════════════════════"
echo ""

echo "1️⃣ الاتصال بـ SSH (اختياري):"
echo "   ssh username@doctornafsyonline.com"
echo ""

echo "2️⃣ سحب التحديثات:"
echo "   cd ~/public_html"
echo "   git pull origin $BRANCH"
echo ""

echo "3️⃣ تثبيت التبعيات:"
echo "   npm install"
echo ""

echo "4️⃣ تطبيق Migration:"
echo "   npx prisma migrate deploy"
echo ""

echo "5️⃣ بناء المشروع:"
echo "   npm run build"
echo ""

echo "6️⃣ من لوحة Hostinger:"
echo "   • اذهبي إلى Node.js Selector"
echo "   • اضغطي Stop"
echo "   • انتظري 5 ثوانٍ"
echo "   • اضغطي Start"
echo ""

echo "7️⃣ التحقق:"
echo "   https://doctornafsyonline.com/admin/customer-service"
echo ""

# ============================================
# Step 8: Summary
# ============================================

echo "════════════════════════════════════════════════════"
echo "📊 الملخص"
echo "════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}✅ تم الدفع إلى GitHub${NC}"
echo -e "${BLUE}📋 الفرع: $BRANCH${NC}"
echo -e "${BLUE}📝 الـ Commit: $(git log --oneline -1 | cut -d' ' -f1)${NC}"
echo ""

echo "⏭️ اختياراتك:"
echo ""

read -p "هل تريدين نسخ أوامر SSH؟ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 أوامر SSH (انسخيها):"
    echo ""
    echo "cd ~/public_html && git pull origin $BRANCH && npm install && npx prisma migrate deploy && npm run build"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "✨ تم الانتهاء!"
echo "════════════════════════════════════════════════════"
echo ""
