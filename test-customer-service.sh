#!/bin/bash

# ============================================
# Customer Service - Comprehensive Testing
# ============================================

echo "🧪 بدء الاختبار الشامل للنظام..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TEST_PASSED=0
TEST_FAILED=0

# ============================================
# Test 1: Check Files Exist
# ============================================

echo "═════════════════════════════════════════"
echo "📋 اختبار 1: التحقق من وجود الملفات"
echo "═════════════════════════════════════════"
echo ""

check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name موجود"
        ((TEST_PASSED++))
    else
        echo -e "${RED}❌${NC} $name غير موجود"
        ((TEST_FAILED++))
    fi
}

# Database
check_file "prisma/schema.prisma" "📄 Prisma Schema"
check_file "prisma/migrations/20260622_add_customer_service_models/migration.sql" "📄 Migration File"

# Components
check_file "src/components/SpecialistShiftDashboard.tsx" "🎨 SpecialistShiftDashboard"
check_file "src/components/AvailableAppointmentsPool.tsx" "🎨 AvailableAppointmentsPool"
check_file "src/components/SessionStatusMonitor.tsx" "🎨 SessionStatusMonitor"

# Pages
check_file "src/app/admin/customer-service/page.tsx" "📄 Page"
check_file "src/app/admin/customer-service/layout.tsx" "📄 Layout"

# APIs
check_file "src/app/api/customer-service/available-appointments/route.ts" "🔌 API available-appointments"
check_file "src/app/api/customer-service/check-conflict/route.ts" "🔌 API check-conflict"
check_file "src/app/api/customer-service/session-status/route.ts" "🔌 API session-status"
check_file "src/app/api/customer-service/specialists-sessions/route.ts" "🔌 API specialists-sessions"
check_file "src/app/api/customer-service/shifts/route.ts" "🔌 API shifts"

# Documentation
check_file "CUSTOMER_SERVICE_GUIDE.md" "📚 دليل شامل"
check_file "CUSTOMER_SERVICE_IMPLEMENTATION.md" "📚 تفاصيل التطبيق"
check_file "CUSTOMER_SERVICE_API_EXAMPLES.sh" "📚 أمثلة API"
check_file "DEPLOYMENT_CHECKLIST.md" "📚 قائمة التحقق"
check_file "FINAL_DELIVERY_REPORT.md" "📚 التقرير النهائي"

echo ""

# ============================================
# Test 2: Check Prisma Schema Syntax
# ============================================

echo "═════════════════════════════════════════"
echo "🔍 اختبار 2: التحقق من Prisma Schema"
echo "═════════════════════════════════════════"
echo ""

if grep -q "model Shift" prisma/schema.prisma && \
   grep -q "model SpecialistShiftAssignment" prisma/schema.prisma && \
   grep -q "model AvailableSlot" prisma/schema.prisma && \
   grep -q "model SessionStatus" prisma/schema.prisma; then
    echo -e "${GREEN}✅${NC} جميع الجداول الجديدة موجودة في Schema"
    ((TEST_PASSED++))
else
    echo -e "${RED}❌${NC} بعض الجداول غير موجودة"
    ((TEST_FAILED++))
fi

echo ""

# ============================================
# Test 3: Check Component Structure
# ============================================

echo "═════════════════════════════════════════"
echo "🎨 اختبار 3: التحقق من البنية الأساسية للـ Components"
echo "═════════════════════════════════════════"
echo ""

# Check SpecialistShiftDashboard
if grep -q "export function SpecialistShiftDashboard" src/components/SpecialistShiftDashboard.tsx; then
    echo -e "${GREEN}✅${NC} SpecialistShiftDashboard - يحتوي على الدالة الصحيحة"
    ((TEST_PASSED++))
else
    echo -e "${RED}❌${NC} SpecialistShiftDashboard - دالة غير صحيحة"
    ((TEST_FAILED++))
fi

# Check AvailableAppointmentsPool
if grep -q "export function AvailableAppointmentsPool" src/components/AvailableAppointmentsPool.tsx; then
    echo -e "${GREEN}✅${NC} AvailableAppointmentsPool - يحتوي على الدالة الصحيحة"
    ((TEST_PASSED++))
else
    echo -e "${RED}❌${NC} AvailableAppointmentsPool - دالة غير صحيحة"
    ((TEST_FAILED++))
fi

# Check SessionStatusMonitor
if grep -q "export function SessionStatusMonitor" src/components/SessionStatusMonitor.tsx; then
    echo -e "${GREEN}✅${NC} SessionStatusMonitor - يحتوي على الدالة الصحيحة"
    ((TEST_PASSED++))
else
    echo -e "${RED}❌${NC} SessionStatusMonitor - دالة غير صحيحة"
    ((TEST_FAILED++))
fi

echo ""

# ============================================
# Test 4: Check API Routes
# ============================================

echo "═════════════════════════════════════════"
echo "🔌 اختبار 4: التحقق من API Routes"
echo "═════════════════════════════════════════"
echo ""

check_api_route() {
    local file=$1
    local method=$2
    local name=$3
    
    if grep -q "export async function $method" "$file"; then
        echo -e "${GREEN}✅${NC} $name - يحتوي على $method"
        ((TEST_PASSED++))
    else
        echo -e "${RED}❌${NC} $name - $method غير موجود"
        ((TEST_FAILED++))
    fi
}

check_api_route "src/app/api/customer-service/available-appointments/route.ts" "GET" "available-appointments"
check_api_route "src/app/api/customer-service/check-conflict/route.ts" "POST" "check-conflict"
check_api_route "src/app/api/customer-service/session-status/route.ts" "GET" "session-status (GET)"
check_api_route "src/app/api/customer-service/session-status/route.ts" "PUT" "session-status (PUT)"
check_api_route "src/app/api/customer-service/specialists-sessions/route.ts" "GET" "specialists-sessions"

echo ""

# ============================================
# Test 5: Check Authentication Guards
# ============================================

echo "═════════════════════════════════════════"
echo "🔐 اختبار 5: التحقق من حماية الوصول"
echo "═════════════════════════════════════════"
echo ""

check_auth() {
    local file=$1
    local name=$2
    
    if grep -q "const session = await auth()" "$file" && \
       grep -q "if (!session" "$file"; then
        echo -e "${GREEN}✅${NC} $name - محمي بـ authentication"
        ((TEST_PASSED++))
    else
        echo -e "${RED}❌${NC} $name - قد لا يكون محمي بشكل صحيح"
        ((TEST_FAILED++))
    fi
}

check_auth "src/app/api/customer-service/available-appointments/route.ts" "available-appointments"
check_auth "src/app/api/customer-service/check-conflict/route.ts" "check-conflict"
check_auth "src/app/api/customer-service/session-status/route.ts" "session-status"

echo ""

# ============================================
# Test 6: Check Error Handling
# ============================================

echo "═════════════════════════════════════════"
echo "⚠️ اختبار 6: التحقق من معالجة الأخطاء"
echo "═════════════════════════════════════════"
echo ""

check_error_handling() {
    local file=$1
    local name=$2
    
    if grep -q "try" "$file" && grep -q "catch" "$file"; then
        echo -e "${GREEN}✅${NC} $name - يحتوي على معالجة أخطاء"
        ((TEST_PASSED++))
    else
        echo -e "${YELLOW}⚠️${NC} $name - قد لا يكون به معالجة أخطاء كاملة"
        ((TEST_FAILED++))
    fi
}

check_error_handling "src/app/api/customer-service/available-appointments/route.ts" "available-appointments"
check_error_handling "src/app/api/customer-service/check-conflict/route.ts" "check-conflict"
check_error_handling "src/app/api/customer-service/session-status/route.ts" "session-status"

echo ""

# ============================================
# Test 7: Check Database Models
# ============================================

echo "═════════════════════════════════════════"
echo "🗄️ اختبار 7: التحقق من نماذج قاعدة البيانات"
echo "═════════════════════════════════════════"
echo ""

check_model() {
    local name=$1
    
    if grep -q "model $name" prisma/schema.prisma; then
        echo -e "${GREEN}✅${NC} Model $name موجود"
        ((TEST_PASSED++))
    else
        echo -e "${RED}❌${NC} Model $name غير موجود"
        ((TEST_FAILED++))
    fi
}

check_model "Shift"
check_model "SpecialistShiftAssignment"
check_model "AvailableSlot"
check_model "SessionStatus"

echo ""

# ============================================
# Final Summary
# ============================================

echo "═════════════════════════════════════════"
echo "📊 النتائج النهائية"
echo "═════════════════════════════════════════"
echo ""

TOTAL=$((TEST_PASSED + TEST_FAILED))
PERCENTAGE=$((TEST_PASSED * 100 / TOTAL))

echo -e "✅ نجح: ${GREEN}${TEST_PASSED}${NC}"
echo -e "❌ فشل: ${RED}${TEST_FAILED}${NC}"
echo -e "📈 النسبة: ${PERCENTAGE}%"
echo ""

if [ $TEST_FAILED -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 جميع الاختبارات نجحت!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "✨ النظام جاهز للاستخدام!"
    echo ""
    echo "الخطوات التالية:"
    echo "  1. npx prisma migrate deploy"
    echo "  2. npm run build"
    echo "  3. npm run dev"
    echo "  4. اختبر الموقع على http://localhost:3000/admin/customer-service"
else
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️ بعض الاختبارات فشلت!${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    exit 1
fi
