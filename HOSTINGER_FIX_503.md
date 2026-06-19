# 🔧 حل مشكلة 503 على Hostinger

## المشكلة
عند فتح الموقع على Hostinger، يظهر خطأ **503 Service Unavailable**

## السبب
المشكلة كانت في ملفات الإعدادات:
- `.env` كان يشير إلى قاعدة بيانات SQLite محلية بدلاً من MySQL
- `prisma/schema.prisma` كان معد للتطوير وليس الإنتاج

## ✅ الحل الذي تم تطبيقه

تم دفع التحديثات التالية إلى GitHub:

### 1. تحديث `.env` 
```env
DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://doctornafsyonline.com"
```

### 2. تحديث `prisma/schema.prisma`
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. إصلاح Footer Component
أضيف import المتغيرات المفقودة في `src/components/Footer.tsx`

## 📋 الخطوات التالية على Hostinger

### الخطوة 1: سحب التحديثات
```bash
cd ~/public_html  # أو المسار الصحيح للتطبيق
git pull origin main
```

### الخطوة 2: تشغيل Prisma Migrations
```bash
npx prisma migrate deploy
```
**ملاحظة:** إذا حدث خطأ، قد تحتاج إلى:
```bash
npx prisma db push --force-reset  # ⚠️ هذا سيحذف البيانات
```

### الخطوة 3: بناء الموقع
```bash
npm run build
```

### الخطوة 4: إعادة تشغيل Node.js
- ادخل لوحة تحكم Hostinger
- اذهب إلى **Web Application Console** أو **Node.js Manager**
- أعد تشغيل التطبيق

### الخطوة 5: تحقق من الموقع
افتح `https://doctornafsyonline.com` وتحقق من أن الموقع يعمل

## 🆘 إذا استمرت المشكلة

### 1. تحقق من السجلات
```bash
cat ~/.pm2/logs/app-error.log
cat ~/.pm2/logs/app-out.log
```

### 2. تحقق من اتصال قاعدة البيانات
```bash
node -e "
const prisma = require('@prisma/client').PrismaClient;
const p = new prisma();
p.\$queryRaw\`SELECT 1\`.then(() => {
  console.log('✅ Database connection OK');
  process.exit(0);
}).catch(e => {
  console.error('❌ Database error:', e.message);
  process.exit(1);
});
"
```

### 3. تحقق من متغيرات البيئة
```bash
echo "DATABASE_URL=$DATABASE_URL"
```

يجب أن ترى:
```
DATABASE_URL=mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297
```

## 📊 الملفات المحدثة
- ✅ `.env` - MySQL credentials
- ✅ `prisma/schema.prisma` - MySQL provider
- ✅ `src/components/Footer.tsx` - Fixed imports
- ✅ Commit: `fae1fa6` على GitHub

## 🚀 التحقق من النجاح
عند نجاح جميع الخطوات:
- الموقع يحمل بدون 503
- الصفحات تعرض بدون 500 errors
- قاعدة البيانات تتصل بنجاح
- المستخدمون يستطيعون التسجيل والدخول
