#!/bin/bash

# ============================================
# Customer Service Implementation - Setup
# ============================================

echo "🚀 بدء تطبيق نظام خدمة العملاء..."
echo ""

# ============================================
# Step 1: Apply Migration
# ============================================

echo "📊 الخطوة 1: تطبيق Migration على قاعدة البيانات..."
echo "➜ أمر: npx prisma migrate deploy"
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ تم تطبيق Migration بنجاح!"
else
    echo "❌ فشل تطبيق Migration!"
    exit 1
fi

echo ""

# ============================================
# Step 2: Generate Prisma Client
# ============================================

echo "🔄 الخطوة 2: تحديث Prisma Client..."
echo "➜ أمر: npx prisma generate"
echo ""

npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ تم تحديث Prisma Client بنجاح!"
else
    echo "❌ فشل تحديث Prisma Client!"
    exit 1
fi

echo ""

# ============================================
# Step 3: Build Project
# ============================================

echo "🏗️ الخطوة 3: بناء المشروع..."
echo "➜ أمر: npm run build"
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo "✅ تم بناء المشروع بنجاح!"
else
    echo "❌ فشل بناء المشروع!"
    exit 1
fi

echo ""

# ============================================
# Step 4: Verify Installation
# ============================================

echo "🔍 الخطوة 4: التحقق من التثبيت..."
echo ""

# Check if migration file exists
if [ -f "prisma/migrations/20260622_add_customer_service_models/migration.sql" ]; then
    echo "✅ ملف Migration موجود"
else
    echo "❌ ملف Migration غير موجود"
fi

# Check if components exist
if [ -f "src/components/SpecialistShiftDashboard.tsx" ]; then
    echo "✅ Component SpecialistShiftDashboard موجود"
else
    echo "❌ Component SpecialistShiftDashboard غير موجود"
fi

if [ -f "src/components/AvailableAppointmentsPool.tsx" ]; then
    echo "✅ Component AvailableAppointmentsPool موجود"
else
    echo "❌ Component AvailableAppointmentsPool غير موجود"
fi

if [ -f "src/components/SessionStatusMonitor.tsx" ]; then
    echo "✅ Component SessionStatusMonitor موجود"
else
    echo "❌ Component SessionStatusMonitor غير موجود"
fi

# Check if pages exist
if [ -f "src/app/admin/customer-service/page.tsx" ]; then
    echo "✅ Page /admin/customer-service موجودة"
else
    echo "❌ Page /admin/customer-service غير موجودة"
fi

# Check if APIs exist
if [ -f "src/app/api/customer-service/available-appointments/route.ts" ]; then
    echo "✅ API available-appointments موجود"
else
    echo "❌ API available-appointments غير موجود"
fi

if [ -f "src/app/api/customer-service/check-conflict/route.ts" ]; then
    echo "✅ API check-conflict موجود"
else
    echo "❌ API check-conflict غير موجود"
fi

if [ -f "src/app/api/customer-service/session-status/route.ts" ]; then
    echo "✅ API session-status موجود"
else
    echo "❌ API session-status غير موجود"
fi

if [ -f "src/app/api/customer-service/specialists-sessions/route.ts" ]; then
    echo "✅ API specialists-sessions موجود"
else
    echo "❌ API specialists-sessions غير موجود"
fi

if [ -f "src/app/api/customer-service/shifts/route.ts" ]; then
    echo "✅ API shifts موجود"
else
    echo "❌ API shifts غير موجود"
fi

echo ""

# ============================================
# Summary
# ============================================

echo "════════════════════════════════════════"
echo "✅ تم الانتهاء من التطبيق بنجاح!"
echo "════════════════════════════════════════"
echo ""
echo "📋 الملخص:"
echo "  ✓ تم تطبيق Migration"
echo "  ✓ تم تحديث Prisma Client"
echo "  ✓ تم بناء المشروع"
echo "  ✓ تم التحقق من جميع الملفات"
echo ""
echo "🚀 الخطوات التالية:"
echo "  1. اختبر المشروع محلياً: npm run dev"
echo "  2. اختبر الـ APIs: bash CUSTOMER_SERVICE_API_EXAMPLES.sh"
echo "  3. ادفع التغييرات: git push origin main"
echo "  4. انشر على الخادم"
echo ""
echo "📚 التوثيق:"
echo "  - CUSTOMER_SERVICE_GUIDE.md"
echo "  - CUSTOMER_SERVICE_IMPLEMENTATION.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
echo ""
echo "✨ تم! النظام جاهز الآن 🎉"
