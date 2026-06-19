# 🔧 تشخيص خطأ 500 على Hostinger

## الخطأ الحالي:
```
This page couldn't load
A server error occurred. Reload to try again.
```

## ✅ خطوات التشخيص السريعة

### الخطوة 1️⃣: شاهد الـ logs على Hostinger

**الطريقة أ: عبر File Manager**
1. ادخل Hostinger > File Manager
2. ادخل: `/home/u465666297/domains/doctornafsyonline.com/public_html`
3. ابحث عن ملفات:
   - `startup-error.log` - قد تجد رسائل خطأ هنا
   - `.env` - تحقق من أن DATABASE_URL موجود ومشير إلى MySQL

**الطريقة ب: عبر Terminal/SSH**
```bash
# شاهد آخر 100 سطر من الأخطاء
tail -100 startup-error.log

# أو ابحث عن أي رسائل خطأ حديثة
cat .env | grep DATABASE_URL
```

### الخطوة 2️⃣: تحقق من قاعدة البيانات

```bash
# اختبر الاتصال
mysql -u u465666297_u465666297 -p
# كلمة المرور: Doctor1346790
# الأمر: show databases;
# الأمر: use u465666297_u465666297;
# الأمر: show tables;
```

إذا **رأيت جداول** → قاعدة البيانات موجودة ✅
إذا **لم ترَ جداول** → تحتاج تشغيل Prisma migrations

### الخطوة 3️⃣: إذا كانت قاعدة البيانات فارغة

```bash
# ادخل مجلد المشروع
cd ~/public_html

# شغّل migrations
npx prisma migrate deploy

# أو seed البيانات الأولية
npx prisma db seed
```

---

## 🆘 إذا استمرت المشكلة

### جرّب هذا الترتيب:

**من Hostinger Terminal:**

```bash
# 1. ادخل المجلد
cd ~/public_html

# 2. تحقق من .env
cat .env

# 3. جرّب إصلاح .env
node fix-hostinger-env.js

# 4. أعد التثبيت
npm install

# 5. أنشئ قاعدة البيانات والجداول
npx prisma migrate deploy

# 6. أضف بيانات أولية (اختياري)
npx prisma db seed

# 7. أعد البناء
npm run build

# 8. أعد تشغيل السيرفر
# استخدم Node.js Manager في Hostinger Panel
```

---

## 📋 الأشياء التي يجب التحقق منها

### ✅ .env يجب أن يحتوي على:

```env
DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
NEXTAUTH_URL="https://doctornafsyonline.com"
NODE_ENV="production"
```

### ✅ قاعدة البيانات يجب أن تحتوي على جداول:

```
User
TherapistProfile
Appointment
Message
Review
SessionNote
```

### ✅ الملفات المهمة موجودة:

```
/home/u465666297/domains/doctornafsyonline.com/public_html/
├── .env ✅
├── .next/ ✅
├── node_modules/ ✅
├── prisma/ ✅
├── src/ ✅
└── server.js ✅
```

---

## 💡 التشخيص المتقدم

### إذا أردت معلومات تفصيلية:

```bash
# اطبع البيانات البيئية
node -e "console.log(JSON.stringify(process.env, null, 2))" | grep -i database

# اختبر اتصال MySQL مباشرة
mysql -h 127.0.0.1 -u u465666297_u465666297 -pDoctor1346790 u465666297_u465666297 -e "SELECT COUNT(*) FROM User;"

# اطبع رسائل Prisma بالتفصيل
DEBUG=prisma:* npm run build
```

---

## 📞 حل سريع متوازي

إذا ما زالت المشكلة، شغّل هذه الأوامر بالترتيب:

```bash
cd ~/public_html

# 1. تأكد من الكود حديث
git pull origin main

# 2. تحديث المكتبات
npm install

# 3. إصلاح .env
node fix-hostinger-env.js

# 4. حذف الـ cache
rm -rf .next node_modules/.prisma

# 5. إعادة بناء Prisma
npx prisma generate

# 6. البناء النهائي
npm run build

# 7. إعادة تشغيل السيرفر
# (عبر Node.js Manager)
```

---

## ⚠️ علامات الخطر

- ❌ لا توجد جداول في قاعدة البيانات
- ❌ DATABASE_URL تشير إلى `file:./dev.db`
- ❌ ملف `.env` غير موجود
- ❌ Node.js version قديمة (يجب >= 18.x)

---

## ✨ بعد الإصلاح

1. افتح `https://doctornafsyonline.com`
2. جرّب تسجيل الدخول بـ:
   - Email: `sara@nafsi.com`
   - Password: `123456`
3. أو سجل مريض جديد

---

**شارك معي:**
1. محتوى `startup-error.log` (أول 20 سطر)
2. Output من: `cat .env`
3. Output من: `mysql -u u465666297_u465666297 -p -e "show tables;"`

وسأساعدك بحل محدد! 🚀
