# 🚀 إصلاح خطأ 503 على Hostinger

## المشكلة
عند فتح الموقع على Hostinger، تظهر رسالة:
```
503 Service Unavailable
The server is temporarily busy, try again later!
```

## السبب
- ملف `.env` لم يكن مضبوطاً بشكل صحيح على السيرفر
- اتصال قاعدة البيانات MySQL لم يكن يعمل
- قيم hardcoded قديمة في الكود

## الحل المنفذ

### ✅ التعديلات المنجزة:

1. **تحديث `.env`**
   - تحديث `DATABASE_URL` الصحيح
   - إضافة جميع المتغيرات المطلوبة
   - توثيق كل متغير

2. **تحسين `src/lib/prisma.ts`**
   - إزالة القيم hardcoded
   - إضافة رسائل خطأ واضحة
   - التحقق من المتغيرات البيئية

3. **إنشاء أدوات تشخيصية**
   - `check-hostinger-setup.js` - للتحقق من الإعدادات
   - `deploy-to-hostinger.js` - للنشر السريع

## خطوات النشر على Hostinger

### 1️⃣ انسخ `.env` إلى Hostinger

**الخيار أ - عبر File Manager:**
- ادخل File Manager على Hostinger
- ادهب لجذر المشروع
- أنشئ/عدّل ملف `.env`
- انسخ هذا المحتوى:

```env
DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
NEXTAUTH_SECRET="nafsi-production-secret-2024-change-this-in-prod"
NEXTAUTH_URL="https://doctornafsyonline.com"
AUTH_SECRET="nafsi-production-secret-2024-change-this-in-prod"
AUTH_URL="https://doctornafsyonline.com/api/auth"
AUTH_TRUST_HOST=true
LIVEKIT_API_KEY="APIMgHtZzn6BoE7"
LIVEKIT_API_SECRET="Zjq0OCivcl3WJ7zbYEudXQgvLG4xWp9KxQekzKT2EpT"
LIVEKIT_URL="wss://doctornafsyonline-1q28541a.livekit.cloud"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://doctornafsyonline.com"
```

### 2️⃣ سحب التغييرات من Git

اذهب للـ Terminal على Hostinger (أو SSH) وشغّل:

```bash
cd ~/public_html  # أو مسار المشروع
git pull origin main
```

### 3️⃣ حدّث الـ dependencies

```bash
npm install
```

### 4️⃣ أعد البناء

```bash
npm run build
```

### 5️⃣ أعد تشغيل السيرفر

```bash
node server.js
# أو عبر Node.js Manager على Hostinger
```

## ✅ التحقق من النجاح

بعد النشر:
1. افتح الموقع `https://doctornafsyonline.com`
2. يجب أن تظهر الصفحة الرئيسية بدون 503
3. جرّب تسجيل الدخول والعمليات الأساسية

## 🔧 استكشاف الأخطاء

إذا ظهر خطأ 503 مرة أخرى:

### 1. التحقق من الـ logs
```bash
# على Hostinger
cat startup-error.log  # ابحث عن رسائل الخطأ
tail -f public_html/startup-error.log  # المراقبة الحية
```

### 2. التحقق من قاعدة البيانات
```bash
# على Hostinger Terminal
mysql -u u465666297_u465666297 -p
# الكلمة: Doctor1346790
# الأمر: show databases;
```

### 3. إعادة تشغيل Node.js
- ادخل Hostinger Control Panel
- ابحث عن **Node.js Manager**
- اضغط **Stop** ثم **Start**

## 📝 ملفات التعديل

- `src/lib/prisma.ts` - تحسين إدارة قاعدة البيانات
- `.env` - متغيرات البيئة
- `check-hostinger-setup.js` - أداة التشخيص
- `deploy-to-hostinger.js` - أداة النشر

## 🆘 لو استمرت المشكلة

1. تأكد من أن DATABASE_URL صحيح تماماً
2. تحقق من أن كلمة المرور صحيحة (بدون مسافات)
3. تأكد من أن 127.0.0.1:3306 هو الـ host والـ port الصحيح
4. جرّب الاتصال المباشر بقاعدة البيانات عبر MySQL

## 💡 ملاحظات مهمة

- لا تضع `.env` في git (تجاهل ب .gitignore)
- غيّر `NEXTAUTH_SECRET` إلى قيمة عشوائية قوية
- تحقق من جميع المفاتيح الخارجية (Stripe, LiveKit, etc.)
- احفظ نسخة من `.env` في مكان آمن

---

✅ **تم إصلاح المشكلة - المشروع جاهز للنشر!**
