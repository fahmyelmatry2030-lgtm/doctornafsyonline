# 📋 الأوامر الموصى بها بالترتيب - Customer Service System

**التاريخ:** 22 يونيو 2026  
**الحالة:** ✅ كل شيء مُستعد - فقط انسخي الأوامر

---

## 🚀 سيناريو 1: اختبر محلياً أولاً (موصى به)

### الخطوة 1: شغلي الخادم المحلي

```bash
npm run dev
```

**المتوقع:**
```
✅ Local:        http://localhost:3000
✅ API:          http://localhost:3000/api
```

### الخطوة 2: افتحي في المتصفح

```
http://localhost:3000/admin/customer-service
```

**تأكدي من:**
- ✅ الصفحة تحمل بدون أخطاء
- ✅ البيانات تظهر
- ✅ الأيقونات والألوان موجودة
- ✅ الأزرار تعمل

### الخطوة 3: اختبري الـ APIs

```bash
# اختبار 1: المواعيد المتاحة
curl "http://localhost:3000/api/customer-service/available-appointments?therapistId=test&startDate=2026-06-22&endDate=2026-06-29"

# اختبار 2: فحص التعارضات
curl -X POST "http://localhost:3000/api/customer-service/check-conflict" \
  -H "Content-Type: application/json" \
  -d '{"therapistId":"test","patientId":"test","scheduledAt":"2026-06-22T16:00:00Z"}'

# اختبار 3: الفترات
curl "http://localhost:3000/api/customer-service/shifts"
```

### الخطوة 4: أوقفي الخادم

```bash
# اضغطي Ctrl + C في Terminal
```

---

## 📤 سيناريو 2: دفع إلى GitHub

### الخطوة 1: تحضير التغييرات

```bash
# تأكدي من الحالة
git status

# أضيفي جميع الملفات
git add -A

# أكّدي الإضافة
git status
```

**المتوقع:**
```
Changes to be committed:
  new file:   src/components/CustomerServiceTabs.tsx
  new file:   src/app/admin/customer-service/page.tsx
  ...
```

### الخطوة 2: احفظي التغييرات

```bash
git commit -m "feat: add customer service dashboard system and fix server/client components"
```

**المتوقع:**
```
[main xxxx] feat: add customer service dashboard...
 29 files changed, 5850 insertions(+)
 create mode 100644 src/components/CustomerServiceTabs.tsx
 ...
```

### الخطوة 3: ادفعي إلى GitHub

```bash
git push origin main
```

**المتوقع:**
```
Counting objects: 35, done.
Compressing objects: 100% (25/25), done.
Writing objects: 100% (35/35), 245.2 KiB | 1.3 MiB/s, done.
```

### الخطوة 4: تحققي من النتيجة

```bash
# عرض آخر 3 commits
git log --oneline -3

# أو افتحي GitHub في المتصفح
# https://github.com/youruser/nafsi-platform
```

---

## 🌐 سيناريو 3: نشر على Hostinger

### عبر SSH Terminal:

#### الخطوة 1: اتصلي بالخادم (اختياري)

```bash
# إذا كنتِ لا تستخدمين SSH من قبل
ssh username@doctornafsyonline.com
```

#### الخطوة 2: انتقلي للمشروع

```bash
cd ~/public_html
```

#### الخطوة 3: سحبي التحديثات

```bash
git pull origin main
```

**المتوقع:**
```
remote: Enumerating objects: 35, done.
...
Fast-forward
 29 files changed, 5850 insertions(+)
```

#### الخطوة 4: ثبّتي التبعيات

```bash
npm install
```

**المتوقع:**
```
added 0 packages, removed 0 packages in 2.5s
```

#### الخطوة 5: طبّقي Migration

```bash
npx prisma migrate deploy
```

**المتوقع:**
```
✓ Successfully applied 1 migration(s)
```

#### الخطوة 6: بناء الإنتاج

```bash
npm run build
```

**المتوقع:**
```
✓ Compiled successfully
```

#### الخطوة 7: أعيدي تشغيل Node.js

**من لوحة تحكم Hostinger:**
1. اذهبي إلى **Node.js**
2. اختاري التطبيق
3. اضغطي **Stop**
4. انتظري 5 ثوانٍ
5. اضغطي **Start**

**أو عبر Terminal:**
```bash
# إذا كان موجوداً
pm2 restart app  # أو الاسم الفعلي
```

---

## 🔍 سيناريو 4: التحقق من النجاح

### الخطوة 1: افتحي الموقع

```
https://doctornafsyonline.com/admin/customer-service
```

### الخطوة 2: تسجيل الدخول

- استخدمي حساب **ADMIN**
- أو **ADMIN_CUSTOMER_SERVICE**

### الخطوة 3: تحققي من:

```
✅ الصفحة تحمل بدون 404/500
✅ البيانات تظهر بشكل صحيح
✅ الـ 3 تبويبات موجودة
✅ بطاقات الإحصائيات موجودة
✅ الأزرار تعمل
✅ الصور واضحة
```

### الخطوة 4: اختبري الوظائف الأساسية

```
1. ادخلي "لوحة الفترات"
   ✅ يجب أن ترين جدول الأخصائيين

2. ادخلي "المواعيد المتاحة"
   ✅ يجب أن ترين نموذج البحث

3. ادخلي "مراقبة الجلسات"
   ✅ يجب أن ترين قائمة الجلسات
```

---

## ⚡ سيناريو 5: أوامر سريعة (اختياري)

### استخدام السكريبتات المُجهزة:

```bash
# اختبار شامل
bash test-customer-service.sh

# أوامر سريعة تفاعلية
bash quick-commands.sh

# نشر كامل مع أسئلة
bash FINAL_DEPLOY.sh
```

---

## 📋 الملفات الموصى بقراءتها

### قبل البدء:
```
👉 START_IMMEDIATELY.md      (2 دقيقة)
```

### خلال الاستخدام:
```
👉 QUICK_START.md            (5 دقائق)
👉 CUSTOMER_SERVICE_GUIDE.md (15 دقيقة)
```

### للمشاكل:
```
👉 FIX_REPORT.md             (للمشاكل)
👉 DEPLOYMENT_CHECKLIST.md   (للتحقق)
```

---

## 🆘 حل المشاكل السريعة

### ❌ خطأ: Cannot find module

```bash
# الحل
rm -rf node_modules
npm install
npm run build
```

### ❌ خطأ: Database connection

```bash
# تحققي من .env
cat .env | grep DATABASE_URL

# أو جربي:
npx prisma db push
```

### ❌ خطأ: Port 3000 already in use

```bash
# في Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# في Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### ❌ خطأ: Git push failed

```bash
# تحققي من الفرع
git branch -a

# جربي:
git pull origin main
git push origin main

# أو فرض الدفع (حذر!)
git push -f origin main
```

---

## ✅ قائمة التحقق النهائية

```
قبل دفع إلى GitHub:
☐ npm run build ناجح
☐ git status نظيف
☐ git add -A تم
☐ git commit تم
☐ git push اكتمل

بعد النشر على Hostinger:
☐ git pull origin main اكتمل
☐ npm install اكتمل
☐ npx prisma migrate deploy اكتمل
☐ npm run build اكتمل
☐ Node.js معاد التشغيل
☐ الموقع يحمل بدون أخطاء
☐ الوظائف الأساسية تعمل
```

---

## 🎯 الخطوة التالية الآن

اختاري:

### ✅ الخيار 1 (موصى به): اختبر أولاً

```bash
npm run dev
# افتح http://localhost:3000/admin/customer-service
```

### ✅ الخيار 2: انشر مباشرة

```bash
bash FINAL_DEPLOY.sh
```

### ✅ الخيار 3: اقرأي أولاً

اقرأي `QUICK_START.md`

---

## 💡 نصيحة ذهبية

```
إذا حصل أي خطأ في أي مرحلة:

1. لا تتوقفي
2. اقرأي الخطأ بعناية
3. ابحثي في FIX_REPORT.md
4. حاولي الخطوة مرة أخرى
5. تواصلي للمساعدة
```

---

**اختاري واحدة من الخيارات أعلاه الآن! 🚀✨**

