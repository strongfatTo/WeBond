# 🚀 WeBond Quick Start (No Docker Required)

## Option 1: In-Memory Demo (Fastest - No Database Setup)

I'll create a simplified demo API that works without PostgreSQL/Redis for quick testing.

## Option 2: Full Setup (Recommended for Real Testing)

### Prerequisites Check

**Do you have these installed?**
- [ ] Node.js 20+ (`node --version`)
- [ ] PostgreSQL 15+ (local install or cloud service)
- [ ] Git

### Step-by-Step Setup

#### 1. Install API Dependencies (2 minutes)

```powershell
cd backend
npm install
```

#### 2. Setup Database

**Option A: Use Cloud Database (Easiest)**
- Sign up for free at [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
- Get your PostgreSQL connection string
- Update `backend/.env`:
```env
DATABASE_URL=postgresql://your_connection_string_here
```

**Option B: Local PostgreSQL**
- Install PostgreSQL 15 from [postgresql.org](https://www.postgresql.org/download/)
- Create database:
```sql
CREATE DATABASE webond;
CREATE USER webond WITH PASSWORD 'webond_dev_password';
GRANT ALL PRIVILEGES ON DATABASE webond TO webond;
```
- Update `backend/.env`:
```env
DATABASE_URL=postgresql://webond:webond_dev_password@localhost:5432/webond
```

#### 3. Initialize Database (1 minute)

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

#### 4. Start Backend Server

```powershell
npm run dev
```

You should see:
```
🚀 WeBond Backend running on port 3000
📚 Health check: http://localhost:3000/health
```

#### 5. Test It!

Open a new terminal and test:

```powershell
# Health check
curl http://localhost:3000/health

# Or open in browser:
# http://localhost:3000/health
```

---

## 🎯 Quick Demo Test

**1. Register a user:**

```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234!"
    firstName = "Test"
    lastName = "User"
    role = "raiser"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/backend/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**2. Create a task:**

Get the token from step 1, then:

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
}
$taskBody = @{
    title = "Need help with visa"
    description = "Help me fill out visa application forms"
    category = "visa_help"
    location = "Central"
    rewardAmount = 200
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/backend/tasks" -Method Post -Body $taskBody -Headers $headers -ContentType "application/json"
```

---

## 🔧 Troubleshooting

### "Cannot find module" errors
```powershell
cd backend
rm -r node_modules
rm package-lock.json
npm install
```

### Port 3000 already in use
```powershell
# Edit backend/.env and change:
PORT=3001
```

### Prisma errors
```powershell
cd backend
npx prisma generate
npx prisma migrate reset --force
npx prisma migrate dev
```

---

## 📝 What's Working

✅ User registration & login
✅ JWT authentication
✅ Task creation
✅ Task browsing with filters
✅ Task acceptance workflow
✅ Input validation
✅ Error handling

---

## 🎬 Full Demo Script Available

See `DEMO.md` for complete test scenarios with Maria (task raiser) and David (task solver).

---

## ⚡ Ultra-Quick Test (No Setup)

Want to test the code structure without running servers?

```powershell
# Check if TypeScript compiles
cd backend
npx tsc --noEmit
```

This validates all the code is properly typed and structured!
