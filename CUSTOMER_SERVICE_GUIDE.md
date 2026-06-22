# 📊 Customer Service Dashboard - التوثيق الكامل

> منصة دكتور نفسى أونلاين - نظام خدمة العملاء المتقدم

---

## 🎯 نظرة عامة

تم إضافة نظام شامل لـ **خدمة العملاء** يمكّن موظفات خدمة العملاء من:
- 👥 إدارة جداول الأخصائيين والفترات
- 📅 عرض المواعيد المتاحة والمحجوزة
- ✅ التحقق من عدم التعارضات
- 🎥 مراقبة الجلسات الجارية (بدون الدخول للجلسة)

---

## 📁 البنية الجديدة

### جداول قاعدة البيانات الجديدة

#### 1. `Shift` - فترات العمل
```prisma
model Shift {
  id          String   // معرف الفترة
  name        String   // مثل: "الفترة الصباحية"
  startTime   String   // "08:00"
  endTime     String   // "16:00"
  dayOfWeek   String   // "SUNDAY", "MONDAY", etc
}
```

#### 2. `SpecialistShiftAssignment` - تعيين الأخصائي للفترة
```prisma
model SpecialistShiftAssignment {
  shiftId     String
  therapistId String
  isActive    Boolean
}
```

#### 3. `AvailableSlot` - المواعيد الفارغة
```prisma
model AvailableSlot {
  therapistId   String
  slotStartTime DateTime
  slotEndTime   DateTime
  duration      Int
  isBooked      Boolean
  appointmentId String? // إن كانت محجوزة
}
```

#### 4. `SessionStatus` - حالة الجلسة
```prisma
model SessionStatus {
  appointmentId       String  // معرف الجلسة
  status             String  // SCHEDULED, PATIENT_JOINED, THERAPIST_JOINED, IN_PROGRESS, COMPLETED
  patientJoinedAt    DateTime?
  therapistJoinedAt  DateTime?
  sessionStartedAt   DateTime?
  sessionEndedAt     DateTime?
}
```

---

## 🔌 API Endpoints الجديدة

### 1. المواعيد المتاحة
```
GET /api/customer-service/available-appointments?therapistId=xxx&startDate=2026-06-22&endDate=2026-06-29&duration=50
```

**الاستجابة:**
```json
{
  "success": true,
  "availableSlots": [
    {
      "startTime": "2026-06-22T16:00:00Z",
      "endTime": "2026-06-22T16:50:00Z",
      "duration": 50,
      "available": true
    }
  ]
}
```

---

### 2. التحقق من التعارضات
```
POST /api/customer-service/check-conflict
```

**طلب:**
```json
{
  "therapistId": "xxx",
  "patientId": "yyy",
  "scheduledAt": "2026-06-22T16:00:00Z",
  "duration": 50
}
```

**الاستجابة:**
```json
{
  "success": true,
  "hasConflict": false,
  "message": "✅ لا توجد تعارضات - يمكن حجز الموعد"
}
```

---

### 3. حالة الجلسة
```
GET /api/customer-service/session-status?appointmentId=xxx
```

**الاستجابة:**
```json
{
  "success": true,
  "sessionStatus": {
    "status": "IN_PROGRESS",
    "patientJoinedAt": "2026-06-22T16:00:30Z",
    "therapistJoinedAt": "2026-06-22T16:00:45Z",
    "sessionStartedAt": "2026-06-22T16:01:00Z"
  },
  "monitoring": {
    "phase": "in-progress",
    "isLate": false,
    "patientJoined": true,
    "therapistJoined": true,
    "sessionActive": true
  }
}
```

---

### 4. تحديث حالة الجلسة
```
PUT /api/customer-service/session-status
```

**الإجراءات المتاحة:**
- `mark-patient-joined` - تسجيل دخول المريض
- `mark-therapist-joined` - تسجيل دخول الأخصائي
- `mark-started` - بدء الجلسة
- `mark-ended` - إنهاء الجلسة
- `cancel` - إلغاء الجلسة

---

### 5. جلسات الأخصائيين
```
GET /api/customer-service/specialists-sessions?startDate=2026-06-22&endDate=2026-06-29&shiftId=xxx (اختياري)
```

**الاستجابة:**
```json
{
  "success": true,
  "specialists": [
    {
      "therapistId": "xxx",
      "therapistName": "دكتور سارة",
      "appointments": [
        {
          "id": "appt1",
          "patientName": "زين",
          "scheduledAt": "2026-06-22T16:00:00Z",
          "status": "CONFIRMED",
          "sessionStatus": "IN_PROGRESS",
          "patientJoined": true,
          "therapistJoined": true
        }
      ]
    }
  ]
}
```

---

### 6. إدارة الفترات (Shifts)
```
GET /api/customer-service/shifts
POST /api/customer-service/shifts
PUT /api/customer-service/shifts
```

---

## 🎨 UI Components الجديدة

### 1. `SpecialistShiftDashboard`
لوحة تحكم شاملة توضح:
- جميع الأخصائيين في الفترة
- جميع جلساتهم المجدولة
- حالة كل جلسة (مجدولة، جارية، مكتملة)
- من دخل وسيشارك (المريض، الأخصائي)
- Timer للجلسات الجارية

```tsx
<SpecialistShiftDashboard
  shiftId="optional-shift-id"
  startDate="2026-06-22"
  endDate="2026-06-29"
/>
```

---

### 2. `AvailableAppointmentsPool`
أداة البحث عن المواعيد الفارغة:
- اختيار الأخصائي
- اختيار نطاق التاريخ
- اختيار مدة الجلسة
- عرض جميع المواعيد الفارغة
- يمكن النقر على موعد لاختياره

```tsx
<AvailableAppointmentsPool
  onSlotSelect={(slot) => {
    // Handle slot selection
  }}
/>
```

---

### 3. `SessionStatusMonitor`
مراقب الجلسة الحالية:
- حالة الجلسة (مجدولة، جارية، مكتملة)
- من دخل المريض والأخصائي
- وقت البدء والانتهاء
- أزرار للتحكم اليدوي (بدء، إنهاء، إلغاء)
- تنبيهات التأخير

```tsx
<SessionStatusMonitor
  appointmentId="appt-id"
  onClose={() => {}}
/>
```

---

## 🗂️ الملفات الجديدة

```
src/
├── app/
│   └── admin/
│       └── customer-service/
│           ├── page.tsx              # الصفحة الرئيسية
│           └── layout.tsx            # الـ Layout
├── api/
│   └── customer-service/
│       ├── available-appointments/route.ts
│       ├── check-conflict/route.ts
│       ├── session-status/route.ts
│       ├── specialists-sessions/route.ts
│       └── shifts/route.ts
└── components/
    ├── SpecialistShiftDashboard.tsx
    ├── AvailableAppointmentsPool.tsx
    └── SessionStatusMonitor.tsx
```

---

## 👥 الصلاحيات (Roles)

تم إضافة صلاحية جديدة: `ADMIN_CUSTOMER_SERVICE`

**الأدوار المدعومة:**
- `ADMIN` - مسؤول الموقع (يمكنه كل شيء)
- `ADMIN_CUSTOMER_SERVICE` - موظف خدمة العملاء
- `ADMIN_HR` - موظف الموارد البشرية

---

## 💡 حالات الاستخدام

### الحالة 1: موظفة تستقبل طلب حجز من WhatsApp

1. تذهب إلى **لوحة المواعيد المتاحة**
2. تختار اسم الأخصائي المطلوب
3. تختار نطاق التاريخ
4. ترى جميع المواعيد الفارغة
5. تخبر العميل بالمواعيد المتاحة
6. الموظفة تقوم بالحجز

---

### الحالة 2: مراقبة الجلسات الجارية

1. الموظفة تذهب إلى **لوحة الفترات**
2. ترى جميع الأخصائيين والجلسات
3. إذا كان هناك تأخير، ترى **Timer** للجلسة
4. إذا لم يدخل أحد الطرفين، ترى **⏳**
5. يمكنها التواصل مع الأخصائي عبر WhatsApp
6. عند دخول الطرفين، ترى **✅**

---

### الحالة 3: التأكد من عدم التعارضات

الـ API يتحقق تلقائياً من:
- ✅ الأخصائي لا يوجد لديه جلسة أخرى في نفس الوقت
- ✅ المريض لا يوجد لديه جلسة أخرى في نفس الوقت
- ✅ الموعد في الفترة الصحيحة للأخصائي

---

## 🔄 التدفق الكامل

```
موظفة خدمة العملاء
    ↓
    ├→ لوحة الفترات: ترى الجلسات المجدولة والجارية
    │
    ├→ المواعيد المتاحة: تبحث عن مواعيد فارغة
    │   ├→ API يحسب المواعيد الفارغة
    │   ├→ API يحذف الجلسات الموجودة
    │   ├→ API يحترم فترات الأخصائي
    │   └→ عرض النتائج
    │
    └→ مراقبة الجلسات
        ├→ API يسحب حالة الجلسة كل 5 ثوانٍ
        ├→ تنبيه التأخيرات
        ├→ تحديث حالة الدخول
        └→ تحديث وقت البدء/الانتهاء
```

---

## 🚀 المتطلبات المستقبلية

- [ ] تقارير شاملة عن الجلسات
- [ ] إشعارات فورية عند التأخيرات
- [ ] نموذج يدوي لإضافة الجلسات بدون حجز
- [ ] إدارة الأعطال والإجازات
- [ ] إحصائيات الأخصائيين

---

## 📝 ملاحظات مهمة

✅ **الخصوصية:** موظفة خدمة العملاء **لا يمكنها** الدخول للجلسة الفعلية  
✅ **المراقبة:** فقط معلومات الحالة (دخول، بدء، انتهاء)  
✅ **التأخيرات:** تنبيهات تلقائية عند التأخير  
✅ **التعارضات:** فحص تلقائي عند أي محاولة حجز  
✅ **الوقت الفعلي:** تحديث البيانات كل 5-30 ثانية

---

## 📞 التواصل

في حالة أي استفسارات أو مشاكل:
- 📧 البريد الإلكتروني: support@doctornafsyonline.com
- 💬 WhatsApp: [رقم خدمة العملاء]
- 📱 Telegram: @doctornafsyonline
