#!/bin/bash
# 🚀 أوامر سريعة للـ Hostinger - Nafsi Platform
# انسخ والصق الأوامر التالية في Hostinger Terminal

# ============================================================
# 1️⃣  الحل السريع - إذا رأيت 503 (1 دقيقة)
# ============================================================

# من Hostinger Panel:
# Node.js Manager > Stop > انتظر 5 ثوانٍ > Start

# ثم افتح: https://doctornafsyonline.com


# ============================================================
# 2️⃣  تشخيص المشكلة
# ============================================================

cd ~/public_html

# شاهد آخر الأخطاء
cat startup-error.log | tail -50

# اختبر Database
mysql -h localhost -u u465666297_u465666297 -p -e "SELECT 1;"

# شاهد عمليات Node
ps aux | grep node


# ============================================================
# 3️⃣  الحل الكامل - إذا لم ينجح الحل السريع (10 دقائق)
# ============================================================

cd ~/public_html

# خذ آخر تحديثات
git pull origin main

# ثبت المكتبات
npm install

# ابن المشروع
npm run build

# ثم من Hostinger Panel أعد تشغيل Node.js


# ============================================================
# 4️⃣  إذا لم ينجح - حل شامل (من الصفر)
# ============================================================

cd ~/public_html

# احذف القديم
rm -rf node_modules .next dist build

# خذ جديد من GitHub
git pull origin main

# ثبت من الصفر
npm install

# طبّق database migrations
npx prisma migrate deploy

# ابن
npm run build

# أعد تشغيل Node.js من Panel


# ============================================================
# 5️⃣  تشغيل الأدوات التشخيصية
# ============================================================

cd ~/public_html

# تشخيص 503
node diagnose-503-error.js

# تشخيص Database
node hostinger-db-fix.js

# إصلاح شامل
node comprehensive-hostinger-fix.js


# ============================================================
# 6️⃣  اختبارات يدوية
# ============================================================

# اختبر اتصال Database
mysql -h localhost -u u465666297_u465666297 -p
# Password: Doctor1346790
# ثم اكتب: SELECT 1;
# ثم: exit

# شاهد العمليات النشطة
ps aux | grep node

# شاهد استخدام الـ RAM والـ CPU
top -b -n 1 | head -20

# شاهد الـ logs
tail -f startup-error.log


# ============================================================
# 7️⃣  إذا عطّل Node.js فقط
# ============================================================

# أوقف جميع عمليات Node
pkill -f "node server.js"

# انتظر ثانية
sleep 2

# شغّل جديد (من Hostinger Panel > Start)


# ============================================================
# 8️⃣  إعادة تعيين قاعدة البيانات (إذا استخدمت معك)
# ============================================================

# احذر: هذا يحذف كل البيانات!
# mysql -h localhost -u u465666297_u465666297 -p

# ثم اكتب:
# DROP DATABASE u465666297_u465666297;
# CREATE DATABASE u465666297_u465666297;

# ثم من Terminal:
# npx prisma migrate deploy


# ============================================================
# 9️⃣  الحصول على معلومات تشخيصية
# ============================================================

# معلومات النظام
uname -a

# نسخة Node
node --version

# نسخة npm
npm --version

# معلومات القرص
df -h

# معلومات الذاكرة
free -h


# ============================================================
# 🔟 أوامر مفيدة أخرى
# ============================================================

# إعادة تشغيل آمنة
cd ~/public_html && npm run build && echo "Build complete"

# دخول PM2 (إذا استخدمت)
pm2 logs

# شاهد جميع العمليات
pm2 list

# أوقف PM2
pm2 stop all

# شغّل PM2
pm2 start server.js

# ============================================================
# 📝 ملاحظات مهمة
# ============================================================

# 1. Database Credentials:
#    Host: localhost
#    User: u465666297_u465666297
#    Pass: Doctor1346790
#    DB: u465666297_u465666297

# 2. المشروع في: ~/public_html

# 3. الأخطاء في: startup-error.log

# 4. أعد تشغيل Node.js من Hostinger Panel دائماً
#    لا تحاول pkill إلا في الضرورة

# 5. اصبر 2-3 ثوانٍ بعد Start قبل الدخول للموقع

# ============================================================
# 🆘 معلومات للـ Support
# ============================================================

# اذهب لـ Support مع:
# 1. آخر 50 سطر من logs
# 2. نتيجة npm run build
# 3. نتيجة mysql connection test
# 4. نسخة Node و npm

# اجمع كل شيء:
echo "=== Logs ===" > ~/support-info.txt
cat startup-error.log | tail -50 >> ~/support-info.txt
echo -e "\n=== Node Version ===" >> ~/support-info.txt
node --version >> ~/support-info.txt
echo -e "\n=== npm Version ===" >> ~/support-info.txt
npm --version >> ~/support-info.txt
echo -e "\n=== Disk Space ===" >> ~/support-info.txt
df -h >> ~/support-info.txt

# ثم أرسل الملف للـ Support
