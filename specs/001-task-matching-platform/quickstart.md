# Quick Start Guide: WeBond MVP Development

**Last Updated**: 2025-10-20  
**Target Audience**: Developers joining the WeBond MVP project

---

## Overview

WeBond is a mobile-first platform connecting non-local residents in Hong Kong with local helpers. This guide will get you set up for development in < 30 minutes.

**Tech Stack Quick Reference**:
- **Mobile**: React Native 0.72+ (TypeScript)
- **API**: Node.js 20 + Express + TypeScript
- **AI Service**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20 LTS ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Docker** & Docker Compose ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **React Native CLI** (`npm install -g react-native-cli`)
- **Xcode** (for iOS development, macOS only)
- **Android Studio** (for Android development)

---

## 1. Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/your-org/webond.git
cd webond

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

---

## 2. Start Development Services (Docker)

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Verify services are running
docker ps
# Should see: postgres:15, redis:7
```

**Docker Compose Configuration** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: webond_dev
      POSTGRES_USER: webond
      POSTGRES_PASSWORD: dev_password_change_in_production
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 3. Setup API Backend

```bash
cd api

# Install dependencies
npm install

# Setup Prisma (database ORM)
npx prisma generate
npx prisma migrate dev

# Seed database with initial data
npm run seed

# Start API server (development mode)
npm run dev
# API running at http://localhost:3000
```

**Environment Variables** (`api/.env`):
```env
DATABASE_URL="postgresql://webond:dev_password_change_in_production@localhost:5432/webond_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-in-production"
AWS_S3_BUCKET="webond-dev"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
NODE_ENV="development"
PORT=3000
```

**Verify API**:
```bash
curl http://localhost:3000/health
# Expected: {"status": "ok", "timestamp": "..."}
```

---

## 4. Setup AI Matching Service

```bash
cd ai-service

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start AI service
python src/main.py
# AI service running at http://localhost:8000
```

**Environment Variables** (`ai-service/.env`):
```env
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://webond:dev_password_change_in_production@localhost:5432/webond_dev"
PORT=8000
```

**Verify AI Service**:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

---

## 5. Setup Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# In separate terminals:
# For iOS:
npm run ios

# For Android:
npm run android
```

**Environment Variables** (`mobile/.env`):
```env
API_BASE_URL="http://localhost:3000/api/v1"
AI_SERVICE_URL="http://localhost:8000"
```

**Troubleshooting**:
- **iOS**: If build fails, ensure Xcode is updated and run `pod install` in `ios/` folder
- **Android**: Ensure Android SDK path is set in `ANDROID_HOME` environment variable

---

## 6. Run Tests

### API Tests
```bash
cd api
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Generate coverage report (must be >= 80%)
```

### Mobile Tests
```bash
cd mobile
npm test                    # Unit tests
npm run test:e2e           # E2E tests (Detox)
```

### AI Service Tests
```bash
cd ai-service
pytest                      # Run all tests
pytest --cov=src --cov-report=html  # Coverage report
```

---

## 7. Database Management

### Run Migrations
```bash
cd api
npx prisma migrate dev --name add_new_field
```

### View Database
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

---

## 8. Key Development Workflows

### Create a New API Endpoint

1. **Define route** in `api/src/routes/`
2. **Create controller** in `api/src/controllers/`
3. **Add service logic** in `api/src/services/`
4. **Write tests** in `api/tests/`
5. **Update API contract** in `specs/001-task-matching-platform/contracts/`

**Example**:
```typescript
// api/src/routes/tasks.ts
router.post('/tasks', authMiddleware, taskController.createTask);

// api/src/controllers/taskController.ts
export const createTask = async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body, req.user.id);
  res.status(201).json({ success: true, data: task });
};

// api/src/services/taskService.ts
export const createTask = async (data: CreateTaskDTO, raiserId: string) => {
  return await prisma.task.create({ data: { ...data, raiserId } });
};
```

### Create a New Mobile Screen

1. **Create screen component** in `mobile/src/screens/`
2. **Add to navigation** in `mobile/src/navigation/`
3. **Connect to Redux** (if needed) in `mobile/src/store/slices/`
4. **Add API service calls** in `mobile/src/services/`
5. **Write component tests** in `mobile/__tests__/`

**Example**:
```typescript
// mobile/src/screens/tasks/CreateTaskScreen.tsx
export const CreateTaskScreen = () => {
  const dispatch = useDispatch();
  const handleSubmit = async (data) => {
    await dispatch(createTask(data));
    navigation.navigate('TaskList');
  };
  return <TaskForm onSubmit={handleSubmit} />;
};
```

---

## 9. Code Quality Checks

### Linting
```bash
# API
cd api && npm run lint

# Mobile
cd mobile && npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Type Checking
```bash
# TypeScript check
cd api && npm run type-check
cd mobile && npm run type-check
```

### Formatting
```bash
# Format with Prettier
npm run format

# Check formatting
npm run format:check
```

---

## 10. Common Development Tasks

### Add a New Database Table

1. Update `api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_table_name`
3. Generate Prisma client: `npx prisma generate`
4. Update data model docs: `specs/001-task-matching-platform/data-model.md`

### Add a New Translation Language

1. Add language file in `mobile/src/utils/i18n/locales/{lang}.json`
2. Update language dropdown in settings
3. Test all screens with new language

### Debug API Issues

```bash
# View API logs
docker logs -f webond-api

# View database queries
# Set in .env:
DATABASE_LOG_LEVEL=debug

# Use Prisma Studio for data inspection
npx prisma studio
```

### Debug Mobile App

```bash
# View React Native logs
npx react-native log-ios    # iOS
npx react-native log-android # Android

# Debug with React DevTools
npm install -g react-devtools
react-devtools
```

---

## 11. Useful Commands Cheat Sheet

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d && cd api && npm run dev` |
| Stop all services | `docker-compose down` |
| Reset database | `cd api && npx prisma migrate reset` |
| View DB data | `cd api && npx prisma studio` |
| Run API tests | `cd api && npm test` |
| Run mobile tests | `cd mobile && npm test` |
| Check test coverage | `cd api && npm run test:coverage` |
| Generate API docs | `cd api && npm run docs:generate` |
| Build mobile release | `cd mobile && npm run build:ios` or `build:android` |

---

## 12. Project Structure Reference

```
webond/
├── api/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Prisma models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, etc.
│   │   └── server.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── tests/             # API tests
├── mobile/                # React Native app
│   ├── src/
│   │   ├── screens/       # Screen components
│   │   ├── components/    # Reusable components
│   │   ├── store/         # Redux state
│   │   ├── services/      # API clients
│   │   └── navigation/    # Navigation config
│   └── __tests__/         # Mobile tests
├── ai-service/            # Python ML service
│   ├── src/
│   │   ├── models/        # ML models
│   │   ├── services/      # Matching logic
│   │   └── api/           # FastAPI endpoints
│   └── tests/             # AI service tests
├── specs/                 # Feature specifications
│   └── 001-task-matching-platform/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── research.md
│       └── contracts/     # API contracts
└── docker-compose.yml     # Local dev services
```

---

## 13. Next Steps

After setup, start with:

1. **Read the spec**: `specs/001-task-matching-platform/spec.md`
2. **Review API contracts**: `specs/001-task-matching-platform/contracts/`
3. **Check current tasks**: `specs/001-task-matching-platform/tasks.md` (created by `/speckit.tasks`)
4. **Join team Slack/Discord**: [Link to team communication]
5. **Review constitution**: `.specify/memory/constitution.md` - understand project principles

---

## 14. Getting Help

- **Documentation**: `specs/` folder
- **API Reference**: http://localhost:3000/api-docs (Swagger UI)
- **Codebase Questions**: Check `README.md` in each subfolder
- **Team Chat**: [Your team communication channel]
- **Office Hours**: [If applicable]

---

## 15. Pre-Commit Checklist

Before committing code:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Code formatted (`npm run format`)
- [ ] Test coverage >= 80% (constitution requirement)
- [ ] API contracts updated if endpoints changed
- [ ] Environment variables documented in `.env.example`

---

**Happy Coding! 🚀**

For more detailed information, refer to:
- **Feature Spec**: `spec.md`
- **Implementation Plan**: `plan.md`
- **Data Model**: `data-model.md`
- **API Contracts**: `contracts/*.md`
