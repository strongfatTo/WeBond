# 🎬 WeBond MVP Demo Guide

**Quick demo of Task Posting & Discovery features**

---

## 🚀 Step 1: Start the Services

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Check they're running
docker-compose ps
```

### Option B: Local Services

If you have PostgreSQL and Redis installed locally:
```bash
# Start PostgreSQL (port 5432)
# Start Redis (port 6379)
```

---

## 📦 Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start Backend server
npm run dev
```

**Expected output:**
```
🚀 WeBond Backend running on port 3000
📚 Health check: http://localhost:3000/health
```

---

## 🧪 Step 3: Test the Demo

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T...",
  "service": "webond-backend",
  "version": "1.0.0"
}
```

---

### Demo Scenario 1: Task Raiser Journey

**1. Register as a Task Raiser (International Student)**

```bash
curl -X POST http://localhost:3000/backend/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@student.hku.hk",
    "password": "Maria2024!",
    "firstName": "Maria",
    "lastName": "Santos",
    "role": "raiser",
    "preferredLanguage": "en"
  }'
```

**Save the `accessToken` from the response!**

**2. Login**

```bash
curl -X POST http://localhost:3000/backend/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@student.hku.hk",
    "password": "Maria2024!"
  }'
```

**3. Create a Task (Need Visa Help)**

Replace `YOUR_TOKEN` with the token from step 1 or 2:

```bash
curl -X POST http://localhost:3000/backend/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Help with Hong Kong work visa application",
    "description": "I am an international student graduating soon and need help filling out the Hong Kong work visa application forms. The forms are in Chinese and English, but I need someone to guide me through the process.",
    "category": "visa_help",
    "location": "Central, Hong Kong",
    "latitude": 22.2793,
    "longitude": 114.1628,
    "rewardAmount": 300,
    "preferredLanguage": "en"
  }'
```

**4. Publish the Task**

Get the task ID from step 3 response, then:

```bash
curl -X POST http://localhost:3000/backend/tasks/TASK_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Demo Scenario 2: Task Solver Journey

**1. Register as a Task Solver (Local Helper)**

```bash
curl -X POST http://localhost:3000/backend/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "david@helper.hk",
    "password": "David2024!",
    "firstName": "David",
    "lastName": "Wong",
    "role": "solver",
    "preferredLanguage": "zh-HK"
  }'
```

**Save the `accessToken` for David!**

**2. Browse Available Tasks**

```bash
# All active tasks
curl http://localhost:3000/backend/tasks?status=active

# Filter by category
curl http://localhost:3000/backend/tasks?status=active&category=visa_help

# Filter by reward range
curl "http://localhost:3000/backend/tasks?status=active&minReward=200&maxReward=500"
```

**3. View Task Details**

```bash
curl http://localhost:3000/backend/tasks/TASK_ID
```

**4. Accept the Task**

```bash
curl -X POST http://localhost:3000/backend/tasks/TASK_ID/accept \
  -H "Authorization: Bearer DAVID_TOKEN"
```

---

### Demo Scenario 3: Browse as Guest (No Login)

```bash
# Browse all active tasks (public)
curl http://localhost:3000/backend/tasks?status=active&page=1&limit=10

# Search by category
curl http://localhost:3000/backend/tasks?status=active&category=translation

# View specific task details
curl http://localhost:3000/backend/tasks/TASK_ID
```

---

## 🎭 Quick Demo Script (Copy-Paste Ready)

Save this as `demo-test.sh` (Mac/Linux) or `demo-test.ps1` (Windows):

### Bash Script (Mac/Linux)

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🎬 WeBond MVP Demo Starting..."
echo ""

# Register Task Raiser
echo "1️⃣ Registering Task Raiser (Maria)..."
RAISER_RESPONSE=$(curl -s -X POST $API_URL/backend/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@test.com",
    "password": "Maria2024!",
    "firstName": "Maria",
    "lastName": "Santos",
    "role": "raiser"
  }')

RAISER_TOKEN=$(echo $RAISER_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
echo "✅ Maria registered! Token: ${RAISER_TOKEN:0:20}..."
echo ""

# Create Task
echo "2️⃣ Creating Task..."
TASK_RESPONSE=$(curl -s -X POST $API_URL/backend/tasks \
  -H "Authorization: Bearer $RAISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need help with visa application",
    "description": "International student needs assistance with Hong Kong work visa forms and documentation",
    "category": "visa_help",
    "location": "Central",
    "rewardAmount": 250
  }')

TASK_ID=$(echo $TASK_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Task created! ID: $TASK_ID"
echo ""

# Publish Task
echo "3️⃣ Publishing Task..."
curl -s -X POST $API_URL/backend/tasks/$TASK_ID/publish \
  -H "Authorization: Bearer $RAISER_TOKEN" > /dev/null
echo "✅ Task published!"
echo ""

# Register Solver
echo "4️⃣ Registering Task Solver (David)..."
SOLVER_RESPONSE=$(curl -s -X POST $API_URL/backend/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "david@test.com",
    "password": "David2024!",
    "firstName": "David",
    "lastName": "Wong",
    "role": "solver"
  }')

SOLVER_TOKEN=$(echo $SOLVER_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
echo "✅ David registered! Token: ${SOLVER_TOKEN:0:20}..."
echo ""

# Browse Tasks
echo "5️⃣ David browsing available tasks..."
curl -s $API_URL/backend/tasks?status=active | head -20
echo ""

# Accept Task
echo "6️⃣ David accepting the task..."
curl -s -X POST $API_URL/backend/tasks/$TASK_ID/accept \
  -H "Authorization: Bearer $SOLVER_TOKEN" > /dev/null
echo "✅ Task accepted!"
echo ""

# View Task Details
echo "7️⃣ Final task status:"
curl -s $API_URL/backend/tasks/$TASK_ID | python -m json.tool
echo ""

echo "🎉 Demo Complete!"
echo ""
echo "Summary:"
echo "- Task Raiser: maria@test.com"
echo "- Task Solver: david@test.com"
echo "- Task ID: $TASK_ID"
echo "- Status: in_progress"
```

### PowerShell Script (Windows)

```powershell
# demo-test.ps1
$API_URL = "http://localhost:3000"

Write-Host "🎬 WeBond MVP Demo Starting..." -ForegroundColor Green
Write-Host ""

# Register Task Raiser
Write-Host "1️⃣ Registering Task Raiser (Maria)..." -ForegroundColor Cyan
$raiserBody = @{
    email = "maria@test.com"
    password = "Maria2024!"
    firstName = "Maria"
    lastName = "Santos"
    role = "raiser"
} | ConvertTo-Json

$raiserResponse = Invoke-RestMethod -Uri "$API_URL/backend/auth/register" -Method Post -Body $raiserBody -ContentType "application/json"
$raiserToken = $raiserResponse.accessToken
Write-Host "✅ Maria registered!" -ForegroundColor Green
Write-Host ""

# Create Task
Write-Host "2️⃣ Creating Task..." -ForegroundColor Cyan
$taskBody = @{
    title = "Need help with visa application"
    description = "International student needs assistance with Hong Kong work visa forms and documentation"
    category = "visa_help"
    location = "Central"
    rewardAmount = 250
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $raiserToken"
    "Content-Type" = "application/json"
}

$taskResponse = Invoke-RestMethod -Uri "$API_URL/backend/tasks" -Method Post -Body $taskBody -Headers $headers
$taskId = $taskResponse.id
Write-Host "✅ Task created! ID: $taskId" -ForegroundColor Green
Write-Host ""

# Publish Task
Write-Host "3️⃣ Publishing Task..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$API_URL/backend/tasks/$taskId/publish" -Method Post -Headers $headers | Out-Null
Write-Host "✅ Task published!" -ForegroundColor Green
Write-Host ""

# Register Solver
Write-Host "4️⃣ Registering Task Solver (David)..." -ForegroundColor Cyan
$solverBody = @{
    email = "david@test.com"
    password = "David2024!"
    firstName = "David"
    lastName = "Wong"
    role = "solver"
} | ConvertTo-Json

$solverResponse = Invoke-RestMethod -Uri "$API_URL/backend/auth/register" -Method Post -Body $solverBody -ContentType "application/json"
$solverToken = $solverResponse.accessToken
Write-Host "✅ David registered!" -ForegroundColor Green
Write-Host ""

# Accept Task
Write-Host "5️⃣ David accepting the task..." -ForegroundColor Cyan
$solverHeaders = @{
    Authorization = "Bearer $solverToken"
}
Invoke-RestMethod -Uri "$API_URL/backend/tasks/$taskId/accept" -Method Post -Headers $solverHeaders | Out-Null
Write-Host "✅ Task accepted!" -ForegroundColor Green
Write-Host ""

# View Final Status
Write-Host "6️⃣ Final task status:" -ForegroundColor Cyan
$finalTask = Invoke-RestMethod -Uri "$API_URL/backend/tasks/$taskId"
$finalTask | ConvertTo-Json -Depth 3
Write-Host ""

Write-Host "🎉 Demo Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Task Raiser: maria@test.com"
Write-Host "- Task Solver: david@test.com"
Write-Host "- Task ID: $taskId"
Write-Host "- Status: in_progress"
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
# Mac/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database URL in .env
# Should be: DATABASE_URL=postgresql://webond:webond_dev_password@localhost:5432/webond
```

### Prisma Client Not Generated

```bash
cd backend
npx prisma generate
```

### Redis Connection Error

```bash
# Check if Redis is running
docker-compose ps

# Test Redis connection
docker exec -it webond-redis redis-cli ping
# Should return: PONG
```

---

## 📊 What to Test

✅ **User Management**
- Register with different roles (raiser, solver, both)
- Login with correct/incorrect credentials
- Token-based authentication

✅ **Task Management**
- Create draft tasks
- Publish tasks
- Browse with filters (category, reward, status)
- View task details
- Update draft tasks
- Accept tasks as solver

✅ **Validation**
- Weak passwords rejected
- Duplicate emails rejected
- Invalid reward amounts rejected (< 50 or > 5000 HKD)
- Short descriptions rejected (< 20 chars)

✅ **Authorization**
- Only task owners can update/publish
- Can't accept your own task
- Protected endpoints require authentication

---

## 🎥 Demo Video Script

1. **Show health check** - API is running
2. **Register Maria** - International student (task raiser)
3. **Create visa task** - Need help with work visa
4. **Publish task** - Make it visible
5. **Register David** - Local helper (solver)
6. **David browses tasks** - See active tasks
7. **David accepts task** - Task status changes to "in_progress"
8. **Show final state** - Task linked to both users

---

## ✨ Next Steps After Demo

1. **Add more test data** - Create multiple users and tasks
2. **Test edge cases** - Invalid inputs, unauthorized access
3. **Monitor logs** - Check `logs/combined.log` for API activity
4. **Database inspection** - Use `npx prisma studio` to view data
5. **Phase 4** - Add payment integration when ready

---

**Demo Time:** ~5 minutes  
**Status:** ✅ Ready to run
