#!/bin/bash

# ============================================
# Customer Service API - أمثلة الاستخدام
# ============================================

API_URL="http://localhost:3000/api/customer-service"
AUTH_TOKEN="your-auth-token-here"

# ============================================
# 1. الحصول على المواعيد المتاحة
# ============================================

echo "📅 البحث عن المواعيد المتاحة..."

curl -X GET \
  "$API_URL/available-appointments?therapistId=therapist-1&startDate=2026-06-22T00:00:00Z&endDate=2026-06-29T23:59:59Z&duration=50" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq

# ============================================
# 2. التحقق من التعارضات
# ============================================

echo -e "\n⚠️ التحقق من التعارضات..."

curl -X POST \
  "$API_URL/check-conflict" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "therapist-1",
    "patientId": "patient-1",
    "scheduledAt": "2026-06-22T16:00:00Z",
    "duration": 50
  }' | jq

# ============================================
# 3. الحصول على حالة الجلسة
# ============================================

echo -e "\n🎥 الحصول على حالة الجلسة..."

curl -X GET \
  "$API_URL/session-status?appointmentId=appointment-1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq

# ============================================
# 4. تحديث حالة الجلسة - تسجيل دخول المريض
# ============================================

echo -e "\n✅ تسجيل دخول المريض..."

curl -X PUT \
  "$API_URL/session-status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-1",
    "action": "mark-patient-joined"
  }' | jq

# ============================================
# 5. تحديث حالة الجلسة - تسجيل دخول الأخصائي
# ============================================

echo -e "\n✅ تسجيل دخول الأخصائي..."

curl -X PUT \
  "$API_URL/session-status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-1",
    "action": "mark-therapist-joined"
  }' | jq

# ============================================
# 6. تحديث حالة الجلسة - بدء الجلسة
# ============================================

echo -e "\n▶️ بدء الجلسة..."

curl -X PUT \
  "$API_URL/session-status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-1",
    "action": "mark-started"
  }' | jq

# ============================================
# 7. تحديث حالة الجلسة - إنهاء الجلسة
# ============================================

echo -e "\n⏹️ إنهاء الجلسة..."

curl -X PUT \
  "$API_URL/session-status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-1",
    "action": "mark-ended"
  }' | jq

# ============================================
# 8. تحديث حالة الجلسة - إلغاء الجلسة
# ============================================

echo -e "\n❌ إلغاء الجلسة..."

curl -X PUT \
  "$API_URL/session-status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-1",
    "action": "cancel"
  }' | jq

# ============================================
# 9. الحصول على جلسات الأخصائيين
# ============================================

echo -e "\n👥 الحصول على جلسات الأخصائيين..."

curl -X GET \
  "$API_URL/specialists-sessions?startDate=2026-06-22T00:00:00Z&endDate=2026-06-29T23:59:59Z" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq

# ============================================
# 10. الحصول على جلسات الأخصائيين لفترة معينة
# ============================================

echo -e "\n👥 الحصول على جلسات الأخصائيين (لفترة محددة)..."

curl -X GET \
  "$API_URL/specialists-sessions?startDate=2026-06-22T00:00:00Z&endDate=2026-06-29T23:59:59Z&shiftId=shift-1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq

# ============================================
# 11. الحصول على جميع الفترات
# ============================================

echo -e "\n⏰ الحصول على جميع الفترات..."

curl -X GET \
  "$API_URL/shifts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq

# ============================================
# 12. إنشاء فترة عمل جديدة
# ============================================

echo -e "\n➕ إنشاء فترة عمل جديدة..."

curl -X POST \
  "$API_URL/shifts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "الفترة المسائية",
    "dayOfWeek": "MONDAY",
    "startTime": "16:00",
    "endTime": "00:00",
    "description": "من 4 مساءً إلى 12 صباحاً"
  }' | jq

# ============================================
# 13. إضافة أخصائي لفترة
# ============================================

echo -e "\n➕ إضافة أخصائي لفترة..."

curl -X PUT \
  "$API_URL/shifts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftId": "shift-1",
    "therapistId": "therapist-1",
    "action": "add"
  }' | jq

# ============================================
# 14. إزالة أخصائي من فترة
# ============================================

echo -e "\n➖ إزالة أخصائي من فترة..."

curl -X PUT \
  "$API_URL/shifts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftId": "shift-1",
    "therapistId": "therapist-1",
    "action": "remove"
  }' | jq

# ============================================
# أمثلة الاستجابات
# ============================================

cat << 'EOF'

=====================================
أمثلة الاستجابات الناجحة
=====================================

✅ المواعيد المتاحة (200 OK):
{
  "success": true,
  "therapistId": "therapist-1",
  "dateRange": {
    "start": "2026-06-22T00:00:00Z",
    "end": "2026-06-29T23:59:59Z"
  },
  "availableSlots": [
    {
      "startTime": "2026-06-22T16:00:00Z",
      "endTime": "2026-06-22T16:50:00Z",
      "duration": 50,
      "available": true
    }
  ],
  "totalSlots": 48
}

✅ التحقق من التعارضات (200 OK):
{
  "success": true,
  "hasConflict": false,
  "therapistConflict": null,
  "patientConflict": null,
  "message": "✅ لا توجد تعارضات - يمكن حجز الموعد"
}

✅ حالة الجلسة (200 OK):
{
  "success": true,
  "appointment": {
    "id": "appt-1",
    "patientName": "زين",
    "therapistName": "دكتور سارة",
    "scheduledAt": "2026-06-22T16:00:00Z",
    "duration": 50,
    "status": "CONFIRMED"
  },
  "sessionStatus": {
    "status": "IN_PROGRESS",
    "patientJoinedAt": "2026-06-22T16:00:30Z",
    "therapistJoinedAt": "2026-06-22T16:00:45Z",
    "sessionStartedAt": "2026-06-22T16:01:00Z",
    "sessionEndedAt": null
  },
  "monitoring": {
    "phase": "in-progress",
    "isScheduled": true,
    "isLate": false,
    "minutesLate": 0,
    "minutesUntilStart": 0,
    "patientJoined": true,
    "therapistJoined": true,
    "sessionActive": true,
    "sessionCompleted": false
  },
  "actions": {
    "canMarkAsStarted": false,
    "canMarkAsEnded": true,
    "canCancel": true
  }
}

✅ جلسات الأخصائيين (200 OK):
{
  "success": true,
  "dateRange": {
    "start": "2026-06-22T00:00:00Z",
    "end": "2026-06-29T23:59:59Z"
  },
  "specialistsCount": 8,
  "appointmentsCount": 96,
  "specialists": [
    {
      "therapistId": "therapist-1",
      "therapistName": "دكتور سارة",
      "appointments": [
        {
          "id": "appt-1",
          "patientName": "زين",
          "patientEmail": "zain@example.com",
          "scheduledAt": "2026-06-22T16:00:00Z",
          "duration": 50,
          "status": "CONFIRMED",
          "sessionStatus": "IN_PROGRESS",
          "sessionStartedAt": "2026-06-22T16:01:00Z",
          "sessionEndedAt": null,
          "patientJoined": true,
          "therapistJoined": true
        }
      ]
    }
  ]
}

❌ أخطاء شائعة:

❌ (401 Unauthorized):
{
  "error": "Unauthorized"
}

❌ (403 Forbidden):
{
  "error": "Access denied: ADMIN_CUSTOMER_SERVICE role required"
}

❌ (400 Bad Request):
{
  "error": "Missing required params: therapistId, startDate, endDate"
}

❌ (404 Not Found):
{
  "error": "Appointment not found"
}

❌ (500 Internal Server Error):
{
  "error": "Internal server error"
}

EOF
