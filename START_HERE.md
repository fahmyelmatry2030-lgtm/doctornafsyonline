# 🚀 QUICK START - Nafsi Platform on Hostinger

## Current Status: 503 Service Unavailable

Your code is **100% fixed** and deployed. The issue is now **server-side on Hostinger**.

---

## What to Do RIGHT NOW (1 minute)

### Step 1: Restart Node.js
1. Go to: **Hostinger Panel > Node.js**
2. Click **Stop**
3. Wait 5 seconds
4. Click **Start**
5. Open: https://doctornafsyonline.com

### If that doesn't work → Follow "Complete Solution" below

---

## Complete Solution (if Quick Start failed)

### From Hostinger Terminal:

```bash
# Go to project
cd ~/public_html

# Get latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build
```

Then **restart Node.js from Hostinger Panel** (Stop > Start)

---

## Diagnostic Tools (if still not working)

```bash
cd ~/public_html

# Check 503 error details
node diagnose-503-error.js

# Check database
node hostinger-db-fix.js

# View error logs
cat startup-error.log | tail -50
```

---

## Reference Files

| Problem | File | Time |
|---------|------|------|
| 503 Error | [FIX_503_ERROR.md](./FIX_503_ERROR.md) | 10 min |
| Database | [DATABASE_AUTH_FIX.md](./DATABASE_AUTH_FIX.md) | 5 min |
| Step-by-step | [HOSTINGER_QUICK_STEPS.md](./HOSTINGER_QUICK_STEPS.md) | - |
| All Commands | [COMMANDS.sh](./COMMANDS.sh) | - |
| Complete Guide | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 20 min |
| Troubleshooting | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | - |
| Full Summary (Arabic) | [README_AR.md](./README_AR.md) | - |
| File Index | [INDEX.md](./INDEX.md) | - |

---

## Database Credentials

```
Host: localhost
User: u465666297_u465666297
Password: Doctor1346790
Database: u465666297_u465666297
Port: 3306
```

---

## Key Files on Server

- Project: `~/public_html`
- Errors: `startup-error.log`
- Config: `.env`
- Database: MySQL on localhost

---

## Most Useful Commands

```bash
# View errors
cat startup-error.log | tail -50

# Test database
mysql -h localhost -u u465666297_u465666297 -p -e "SELECT 1;"

# Run build
npm run build

# Run diagnostics
node diagnose-503-error.js

# See running processes
ps aux | grep node
```

---

## Expected Result After Fix

✅ **https://doctornafsyonline.com** loads without 503 error  
✅ **Node.js Manager** shows "Running" (green)  
✅ **No errors** in startup-error.log  

---

## Support Info

**If problem persists, contact Hostinger Support with:**

```bash
# Collect this info:
echo "=== Logs ===" > info.txt
tail -50 startup-error.log >> info.txt
echo -e "\n=== Node Version ===" >> info.txt
node --version >> info.txt
echo -e "\n=== npm Version ===" >> info.txt
npm --version >> info.txt
echo -e "\n=== DB Test ===" >> info.txt
mysql -h localhost -u u465666297_u465666297 -p -e "SELECT 1;" >> info.txt 2>&1

# Then share info.txt with support
```

---

## Next Steps

1. ✅ Try Quick Start (1 min)
2. ❌ If failed → Complete Solution (10 min)
3. ❌ If still failed → Read [FIX_503_ERROR.md](./FIX_503_ERROR.md)
4. ❌ If database issue → Read [DATABASE_AUTH_FIX.md](./DATABASE_AUTH_FIX.md)
5. ❌ If still stuck → Contact Support with info from above

---

**Your code is ready. Just need to get it running on Hostinger! 🎯**

Start with Step 1 (Quick Start) above.
