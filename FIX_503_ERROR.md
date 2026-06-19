# 🚨 حل مشكلة 503 Service Unavailable

## المشكلة
```
503
Service Unavailable
The server is temporarily busy, try again later!
```

---

## 🤔 لماذا تظهر 503؟

### الأسباب المحتملة:
1. **Node.js لم يبدأ** - السيرفر معطل
2. **Node.js توقف بسبب خطأ** - مشكلة في الكود
3. **Build غير موجود** - لم يتم بناء التطبيق
4. **مشكلة في قاعدة البيانات** - الاتصال معطل
5. **مشكلة في الـ dependencies** - مكتبات ناقصة

---

## ✅ الحل - 5 خطوات

### **الخطوة 1️⃣: تحقق من Node.js Status**

اذهب إلى:
1. **Hostinger Panel**
2. **Node.js**
3. شاهد الحالة

#### إذا كانت الحالة **Stopped** ❌:
اضغط **Start** - سيبدأ السيرفر

#### إذا كانت **Running** ✅:
اضغط **Stop** ثم **Start** (إعادة تشغيل)

### **الخطوة 2️⃣: شغّل script التشخيص**

من Hostinger Terminal اكتب:

```bash
cd ~/public_html
node diagnose-503-error.js
```

هذا الـ script سيفحص:
- ✅ الملفات المهمة
- ✅ بيانات الـ .env
- ✅ المكتبات المثبتة
- ✅ البناء الحالي
- ✅ الأخطاء السابقة

### **الخطوة 3️⃣: إذا كان كل شيء صحيح - أعد التشغيل**

```bash
cd ~/public_html
npm run build
```

ثم:
1. اذهب: **Hostinger Panel > Node.js**
2. اضغط **Stop**
3. انتظر 5 ثوانٍ
4. اضغط **Start**

### **الخطوة 4️⃣: إذا استمرت المشكلة - شاهد الـ logs**

```bash
cd ~/public_html
cat startup-error.log | tail -50
```

انسخ آخر 50 سطر من الأخطاء وادرسها.

#### الأخطاء الشائعة:

**❌ "Cannot find module '@prisma/client'"**
```bash
npm install
```

**❌ "DATABASE_URL is not set"**
```bash
cat .env | grep DATABASE_URL
```
إذا كان فارغاً، أضف:
```
DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"
```

**❌ "Can't reach database server"**
```bash
mysql -h localhost -u u465666297_u465666297 -p
```
إذا لم يعمل:
1. جرب: `mysql -h 127.0.0.1 ...`
2. أو جرب `mysql -h localhost.localdomain ...`

**❌ "EADDRINUSE: address already in use"**
السيرفر القديم لم يتوقف:
```bash
pkill -f "node server.js"
npm run build
```

### **الخطوة 5️⃣: إذا لم ينجح - أعد كل شيء**

```bash
cd ~/public_html

# 1. احذف كل شيء قديم
rm -rf node_modules .next

# 2. سحب أحدث الكود
git pull origin main

# 3. ثبت من الصفر
npm install

# 4. طبّق migrations
npx prisma migrate deploy

# 5. بناء جديد
npm run build

# 6. اختبر الاتصال
mysql -h localhost -u u465666297_u465666297 -p -e "USE u465666297_u465666297; SHOW TABLES;"
```

ثم أعد تشغيل Node.js من الـ Panel.

---

## 📋 الأوامر السريعة

### إذا أردت أمر واحد:

```bash
cd ~/public_html && \
npm install && \
npm run build && \
echo "✅ Build complete. Restart Node.js in Hostinger Panel"
```

### لـ تشخيص كامل:

```bash
cd ~/public_html && \
node diagnose-503-error.js && \
cat startup-error.log | tail -50
```

---

## 🔍 علامات النجاح

- ✅ **Node.js Manager** يظهر: **Running** (أخضر)
- ✅ **الموقع** يحمّل عند فتح الـ URL
- ✅ **لا توجد** رسائل 503 أو 500
- ✅ **الصفحة الرئيسية** تظهر بدون أخطاء

---

## 🆘 لو لم ينجح

### ✅ تحقق من:

1. **هل البناء نجح؟**
   ```bash
   ls -la .next/
   ```

2. **هل الـ dependencies مثبتة؟**
   ```bash
   ls -la node_modules/ | head -5
   ```

3. **هل Database متصل؟**
   ```bash
   mysql -h localhost -u u465666297_u465666297 -p
   # Type: SELECT 1;
   ```

4. **ما هو آخر خطأ؟**
   ```bash
   cat startup-error.log
   ```

5. **هل Node.js متوقف؟**
   ```bash
   ps aux | grep node
   ```

---

## 📞 إذا استمرت المشكلة

اتصل بـ **Hostinger Support** مع:
- ✅ آخر 50 سطر من `startup-error.log`
- ✅ نتائج: `npm run build`
- ✅ نتائج: `mysql -h localhost -u ... -p -e "SELECT 1;"`
- ✅ حالة Node.js في الـ Panel

---

## ⚡ الحل السريع جداً (إذا كنت مستعجل)

1. اذهب: **Hostinger Panel > Node.js**
2. اضغط **Stop**
3. انتظر 10 ثوانٍ
4. اضغط **Start**
5. افتح الموقع

إذا عاد نفس الخطأ 503، اتبع الخطوات الكاملة أعلاه.

---

## ✨ الأمل 🌟

في 95% من الحالات، 503 يختفي بعد:
- ✅ إعادة تشغيل Node.js
- ✅ أو `npm run build` جديد
- ✅ أو إعادة تشغيل كاملة من الصفر

فقط اتبع الخطوات بالترتيب ستنجح إن شاء الله! 🎉
