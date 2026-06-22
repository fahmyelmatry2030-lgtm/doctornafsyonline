#!/bin/bash

# ============================================
# Customer Service - Deploy to Production
# ============================================

echo "🚀 بدء عملية النشر..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# Step 1: Check Git Status
# ============================================

echo "═════════════════════════════════════════"
echo "📋 الخطوة 1: التحقق من حالة Git"
echo "═════════════════════════════════════════"
echo ""

if [ -z "$(git status --porcelain)" ]; then
    echo -e "${RED}⚠️  لا توجد تغييرات جديدة${NC}"
    echo ""
    echo "لإضافة الملفات الجديدة:"
    echo "  git add -A"
    exit 1
fi

echo -e "${GREEN}✅${NC} توجد تغييرات جديدة"
git status --short | head -20

echo ""

# ============================================
# Step 2: Build Project
# ============================================

echo "═════════════════════════════════════════"
echo "🏗️ الخطوة 2: بناء المشروع"
echo "═════════════════════════════════════════"
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم بناء المشروع بنجاح${NC}"
else
    echo -e "${RED}❌ فشل بناء المشروع${NC}"
    exit 1
fi

echo ""

# ============================================
# Step 3: Run Linting
# ============================================

echo "═════════════════════════════════════════"
echo "🔍 الخطوة 3: فحص الكود (Linting)"
echo "═════════════════════════════════════════"
echo ""

npm run lint 2>/dev/null || echo -e "${YELLOW}⚠️ بعض التحذيرات في Linting${NC}"

echo ""

# ============================================
# Step 4: Commit Changes
# ============================================

echo "═════════════════════════════════════════"
echo "💾 الخطوة 4: حفظ التغييرات (Commit)"
echo "═════════════════════════════════════════"
echo ""

echo "ما الذي تريد أن تكتبه في رسالة التغيير؟"
echo "مثال: feat: add customer service dashboard system"
echo ""
read -p "رسالة التغيير: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: add customer service dashboard system"
fi

git add -A
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم حفظ التغييرات${NC}"
else
    echo -e "${RED}❌ فشل حفظ التغييرات${NC}"
    exit 1
fi

echo ""

# ============================================
# Step 5: Push to GitHub
# ============================================

echo "═════════════════════════════════════════"
echo "📤 الخطوة 5: رفع إلى GitHub"
echo "═════════════════════════════════════════"
echo ""

echo "اختر فرع GitHub:"
echo "  1) main (الإنتاج)"
echo "  2) develop (التطوير)"
read -p "اختيارك (1-2): " BRANCH_CHOICE

if [ "$BRANCH_CHOICE" = "1" ]; then
    BRANCH="main"
elif [ "$BRANCH_CHOICE" = "2" ]; then
    BRANCH="develop"
else
    BRANCH="main"
fi

echo ""
echo "جاري الرفع إلى: $BRANCH"
echo ""

git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم الرفع إلى GitHub بنجاح${NC}"
else
    echo -e "${RED}❌ فشل الرفع إلى GitHub${NC}"
    exit 1
fi

echo ""

# ============================================
# Step 6: Show Next Steps
# ============================================

echo "═════════════════════════════════════════"
echo "✅ تم الرفع بنجاح!"
echo "═════════════════════════════════════════"
echo ""
echo "🎉 الخطوات التالية على الخادم:"
echo ""
echo "  📍 على Hostinger:"
echo "    1. اتصل عبر SSH أو Terminal"
echo "    2. cd ~/public_html"
echo "    3. git pull origin $BRANCH"
echo "    4. npm install"
echo "    5. npx prisma migrate deploy"
echo "    6. npm run build"
echo ""
echo "  ⚙️ من لوحة التحكم:"
echo "    1. اذهب إلى Node.js"
echo "    2. اضغط Stop"
echo "    3. انتظر 5 ثوانٍ"
echo "    4. اضغط Start"
echo ""
echo "  ✅ التحقق:"
echo "    https://doctornafsyonline.com/admin/customer-service"
echo ""
echo "═════════════════════════════════════════"
echo ""

# ============================================
# Step 7: Show Commit Info
# ============================================

echo "📊 معلومات التغيير:"
echo ""
git log --oneline -1
echo ""

# ============================================
# Step 8: Show Files Changed
# ============================================

echo "📁 الملفات المُرفوعة:"
echo ""
git log -1 --name-status | tail -n +2 | head -30
echo ""

# ============================================
# Final Message
# ============================================

echo "═════════════════════════════════════════"
echo "✨ تم الإرسال بنجاح!"
echo "═════════════════════════════════════════"
echo ""
echo "💡 ملاحظات مهمة:"
echo "  • تحقق من الخادم بعد 2-3 دقائق"
echo "  • في حالة المشاكل، اقرأ DEPLOYMENT_CHECKLIST.md"
echo "  • تأكد من وجود .env الصحيح على الخادم"
echo ""
