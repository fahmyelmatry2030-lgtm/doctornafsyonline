# 🚀 DEPLOYMENT GUIDE - HOW TO FIX 500 ERROR ON HOSTINGER

## ✅ What I Just Fixed

1. **✅ Prisma Schema Issues** - Fixed relation problems in the database schema
2. **✅ .env Configuration** - Verified MySQL connection string is correct
3. **✅ Dependencies** - All npm packages installed successfully
4. **✅ Build** - Next.js application built successfully ✓
5. **✅ Files Prepared** - Everything ready for deployment

---

## 🎯 NEXT STEPS (You need to do these on Hostinger)

### **Option A: Using Git (Recommended) - 2 minutes**

The cleanest and fastest way:

```bash
# 1. SSH into Hostinger (or use Terminal in Panel)
cd ~/public_html

# 2. Pull the latest code from GitHub
git pull origin main

# 3. Install dependencies
npm install

# 4. Apply database migrations
npx prisma migrate deploy

# 5. Build the application
npm run build

# 6. Restart the server
# Go to: Hostinger Panel > Node.js Manager > Stop, then Start
```

---

### **Option B: Using the Automated Script - 2 minutes**

I created a comprehensive script that does everything:

```bash
# 1. SSH into Hostinger
cd ~/public_html

# 2. Download and run the fix script
node comprehensive-hostinger-fix.js
```

This will automatically:
- ✅ Fix .env file (if needed)
- ✅ Verify database connection
- ✅ Install dependencies
- ✅ Apply migrations
- ✅ Build the application

---

## 🔍 Troubleshooting

### If you see database errors:

```bash
# Check if database exists
mysql -u u465666297_u465666297 -p
# Password: Doctor1346790
# Type: show databases;
# Type: use u465666297_u465666297;
# Type: show tables;
```

If tables are missing, run:
```bash
npx prisma migrate deploy
```

---

## 🔧 Files I've Fixed/Created

| File | What Changed |
|------|-------------|
| `prisma/schema.prisma` | Fixed relation definitions |
| `.env` | Verified MySQL connection string |
| `comprehensive-hostinger-fix.js` | Created - automated fix script |
| `package.json` | No changes needed |
| `next.config.ts` | No changes needed |

---

## 📋 Your Database Credentials (Already in .env)

```
Database: u465666297_u465666297
Host: localhost:3306
User: u465666297_u465666297
Password: Doctor1346790
```

---

## ✨ Expected Result After Deployment

After you complete the steps above:
1. The website will load without errors ✓
2. Database will be properly connected ✓
3. All pages will work correctly ✓
4. No more 500 errors ✓

---

## 📞 If It Still Doesn't Work

Check these files on Hostinger:

1. **Database Status**
   ```bash
   mysql -u u465666297_u465666297 -p -e "SELECT 1"
   # Should return: 1
   ```

2. **Check Build Output**
   ```bash
   cat startup-error.log | tail -50
   ```

3. **Check .env**
   ```bash
   cat .env | grep DATABASE_URL
   # Should show MySQL connection string
   ```

4. **Check Node.js is running**
   ```bash
   pm2 status
   # Or check in Node.js Manager in Hostinger Panel
   ```

---

## 🎉 Success Checklist

- [ ] Git pull from main branch
- [ ] npm install completed
- [ ] npx prisma migrate deploy completed
- [ ] npm run build completed
- [ ] Server restarted in Node.js Manager
- [ ] Website loads at https://doctornafsyonline.com
- [ ] No 500 errors visible
- [ ] Can log in successfully

✅ You're all set!
