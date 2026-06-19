# 🆘 خطأ Build على Hostinger - الحل السريع

## المشكلة
```
ERROR: DATABASE_URL must start with 'mysql://'. Got: file:./dev.db...
```

## السبب
على Hostinger كانت نسخة قديمة من `.env` تحتوي على:
```
DATABASE_URL=file:./dev.db
```

بدلاً من قاعدة بيانات MySQL الحقيقية.

## ✅ الحلول المتاحة

### الحل 1️⃣: الإصلاح التلقائي (الأسهل)

إذا كان لديك وصول SSH أو Terminal على Hostinger:

```bash
# ادخل مجلد المشروع
cd ~/public_html

# شغّل script الإصلاح
node fix-hostinger-env.js
```

هذا سيقوم بـ:
- ✅ اكتشاف `.env` القديم
- ✅ استبدال URL قاعدة البيانات تلقائياً
- ✅ إضافة المتغيرات الناقصة

### الحل 2️⃣: تحديث يدوي (File Manager)

1. ادخل Hostinger Control Panel
2. اذهب File Manager
3. افتح ملف `.env` في الجذر
4. **استبدل**:
   ```
   DATABASE_URL=file:./dev.db
   ```
   **بـ**:
   ```
   DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
   ```
5. احفظ الملف

### الحل 3️⃣: عبر Git Pull

```bash
# تحديث الكود
git pull origin main

# تشغيل npm install لتحديث الـ dependencies
npm install

# تشغيل script الإصلاح
node fix-hostinger-env.js

# إعادة البناء
npm run build

# إعادة تشغيل السيرفر
node server.js
```

## 📋 الخطوات الكاملة بعد الإصلاح

```bash
# 1. صعود إلى مجلد المشروع
cd ~/public_html

# 2. إصلاح .env
node fix-hostinger-env.js

# 3. تحديث المكتبات (اختياري إذا لم تكن مثبتة)
npm install

# 4. إعادة البناء
npm run build

# 5. إعادة تشغيل السيرفر
# خيار أ: استخدم Node.js Manager في Hostinger Control Panel
# خيار ب: من Terminal
node server.js
```

## ✅ التحقق من النجاح

بعد الخطوات السابقة:
1. افتح `https://doctornafsyonline.com` في المتصفح
2. يجب أن تظهر الصفحة الرئيسية بدون أخطاء 503 أو 500
3. جرّب تسجيل الدخول والعمليات الأساسية

## 🔍 لو استمرت المشكلة

### 1. تحقق من محتوى `.env`

```bash
cat .env | grep DATABASE_URL
```

يجب أن يظهر:
```
DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
```

### 2. اختبر الاتصال بقاعدة البيانات

```bash
# على Hostinger Terminal
mysql -u u465666297_u465666297 -p
# كلمة المرور: Doctor1346790
# الأمر: show databases;
```

### 3. تحقق من logs البناء

```bash
# عرض آخر 50 سطر من الـ logs
tail -50 startup-error.log
```

### 4. اجعل البناء أكثر تفصيلاً

```bash
# قبل الـ build
export DEBUG=prisma:*
npm run build
```

## 📝 الملفات المستخدمة

- `src/lib/prisma.ts` - يتعامل مع `.env` القديم تلقائياً
- `fix-hostinger-env.js` - script الإصلاح اليدوي
- `.env` - متغيرات البيئة

## 💡 ملاحظات مهمة

- **لا تنسى تحديث `.env` على Hostinger** - هذا هو السبب الرئيسي للخطأ
- تأكد من عدم وجود مسافات في `DATABASE_URL`
- تأكد من أن `localhost` صحيح (قد يكون `127.0.0.1` على بعض الأنظمة)
- احفظ نسخة من `.env` في مكان آمن للطوارئ

---

✅ **يجب أن تعمل الآن!** إذا استمرت المشكلة، شارك معي آخر 50 سطر من:
- `startup-error.log`
- أو output من `npm run build`
