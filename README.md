# WeBond - Task Matching Platform MVP

**Bridging communities through AI-powered task matching**

WeBond connects non-local residents (international students, expats, immigrants) with local helpers for everyday tasks like translation, navigation, visa assistance, and administrative help.

click this link to check out the website: https://webond-v1.netlify.app/

---

## 🎯 MVP Status

### ✅ Implemented Features (Phase 1-2)

**Infrastructure:**
- ✅ Project structure (mobile/, backend/, ai-service/, shared/)
- ✅ Docker Compose setup (PostgreSQL, Redis, services)
- ✅ Complete Prisma schema (8 entities)
- ✅ Authentication system (JWT-based)
- ✅ Core middleware (auth, validation, error handling, logging)
- ✅ Shared TypeScript types

**User Story 1: Task Posting & Discovery (P1 - MVP)**
- ✅ User registration & login
- ✅ Task creation with validation
- ✅ Task browsing with filters
- ✅ Task acceptance workflow
- ✅ Basic profile management

### 🚧 Ready for Implementation

**User Story 2: Secure Payment & Escrow (P1 - MVP)**
- Payment integration (FPS/PayMe)
- Escrow service
- Payment breakdown UI
- Transaction history
- Auto-refund system

**Additional Features (P2-P3)**
- KYC verification & fraud detection
- Mutual rating system
- AI matching optimization
- Multi-language support
- Notifications system

---

## 🏗️ Architecture

```
WeBond/
├── mobile/          # React Native mobile app (iOS/Android)
├── backend/         # Node.js + Express + Prisma Backend
├── ai-service/      # Python + FastAPI AI matching engine
├── shared/          # Shared TypeScript types
├── specs/           # Feature specifications
└── docker-compose.yml
```

**Tech Stack:**
- **Mobile**: React Native 0.72+, TypeScript, Redux Toolkit
- **API**: Node.js 20, Express, Prisma ORM, PostgreSQL 15
- **AI**: Python 3.11, FastAPI, scikit-learn
- **Cache**: Redis 7
- **Storage**: AWS S3 (ID documents, photos)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### 1. Clone and Setup

```bash
git clone https://github.com/yourorg/webond.git
cd webond
```

### 2. Start Infrastructure with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Check status
docker-compose ps
```

### 3. Setup API Service

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://webond:webond_dev_password@localhost:5432/webond

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

API will be available at `http://localhost:3000`

### 4. Setup AI Service

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start development server
python src/main.py
```

AI service will be available at `http://localhost:8000`

### 5. Setup Mobile App

```bash
cd mobile

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..
npx react-native run-ios

# For Android
npx react-native run-android
```

---

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "raiser",  // or "solver" or "both"
  "preferredLanguage": "en"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "raiser"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Task Endpoints

**POST /api/tasks** (Protected)
```json
{
  "title": "Help with visa application",
  "description": "Need assistance filling out Hong Kong work visa forms...",
  "category": "visa_help",
  "location": "Central, Hong Kong",
  "latitude": 22.2793,
  "longitude": 114.1628,
  "rewardAmount": 200,
  "preferredLanguage": "en",
  "preferredCompletionDate": "2025-11-01T10:00:00Z"
}
```

**GET /api/tasks**
Query parameters:
- `status`: active, draft, in_progress, completed (default: active)
- `category`: translation, visa_help, navigation, shopping, admin_help, other
- `minReward`: minimum reward amount (HKD)
- `maxReward`: maximum reward amount (HKD)
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**GET /api/tasks/:id**
Get specific task details with raiser and solver info

**POST /api/tasks/:id/publish** (Protected)
Publish a draft task (makes it active and visible)

**POST /api/tasks/:id/accept** (Protected)
Accept a task as a solver

---

## 🗄️ Database Schema

### Core Entities

**Users** - Task raisers and solvers
- Role-based (raiser/solver/both)
- Verification status
- Location data for proximity matching

**SolverProfile** - Extended info for solvers
- KYC verification documents
- Tier level (Bronze/Silver/Gold)
- Commission rate (30%/20%/10%)
- Average rating & completed tasks

**Tasks** - Help requests
- Categories (translation, visa, navigation, etc.)
- Reward amount (HKD 50-5000)
- Status lifecycle (draft → active → in_progress → completed)

**Transactions** - Escrow payments
- Platform commission tracking
- Payment provider references (FPS/PayMe)
- Immutable audit trail

**Ratings** - Mutual feedback system
**MatchRecommendations** - AI-generated suggestions
**Disputes** - Payment disagreement resolution
**Notifications** - Multi-channel alerts

---

## 🧪 Testing

```bash
# API tests
cd api
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report (target: 80%)

# AI service tests
cd ai-service
pytest                      # Run all tests
pytest --cov                # Coverage report
```

---

## 🔐 Environment Variables

### API (.env)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/webond
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key_change_in_production
AWS_S3_BUCKET=webond-uploads
FPS_API_KEY=your_fps_key
PAYME_API_KEY=your_payme_key
SENTRY_DSN=your_sentry_dsn
```

### AI Service (.env)
```env
PORT=8000
REDIS_HOST=localhost
API_SERVICE_URL=http://localhost:3000
MATCH_CONFIDENCE_THRESHOLD=0.6
PROXIMITY_WEIGHT=0.30
RATING_WEIGHT=0.30
EXPERIENCE_WEIGHT=0.25
LANGUAGE_WEIGHT=0.15
```

---

## 📊 Development Workflow

### Creating a New Feature

1. **Specification**: Create spec.md in `specs/00X-feature-name/`
2. **Planning**: Run `/speckit.plan` to generate architecture
3. **Tasks**: Run `/speckit.tasks` to break down implementation
4. **Implementation**: Run `/speckit.implement` for guided execution
5. **Testing**: Write tests before code (TDD approach)

### Git Workflow

```bash
# Create feature branch
git checkout -b 001-task-matching-platform

# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat(api): implement task creation endpoint"

# Push to remote
git push origin 001-task-matching-platform
```

---

## 🎓 Project Documentation

- **Constitution**: `.specify/memory/constitution.md` - Core principles
- **Feature Specs**: `specs/001-task-matching-platform/spec.md`
- **Implementation Plan**: `specs/001-task-matching-platform/plan.md`
- **Data Model**: `specs/001-task-matching-platform/data-model.md`
- **API Contracts**: `specs/001-task-matching-platform/contracts/`
- **Tasks**: `specs/001-task-matching-platform/tasks.md`

---

## 🚢 Deployment (Coming Soon)

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] Sentry error tracking enabled
- [ ] S3 buckets configured with proper permissions
- [ ] Payment provider credentials configured (FPS/PayMe)
- [ ] Redis cache configured
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Security audit passed

---

## 🤝 Contributing

This project follows the WeBond Constitution principles:

1. **Trust & Safety First** - All features must prioritize user security
2. **Social Inclusion** - Foster cross-cultural connections
3. **AI-Driven Intelligence** - Transparent, explainable algorithms
4. **Transparent Operations** - Clear pricing and visibility
5. **Sustainable Scalability** - Built for 10k+ users

---

## 📞 Support

- **Documentation**: See `specs/` folder
- **Issues**: Create GitHub issues for bugs/features
- **Constitution**: `.specify/memory/constitution.md`

---

## 📄 License

Copyright © 2025 WeBond. All rights reserved.

---

## 🎯 MVP Roadmap

### ✅ Phase 1: Setup & Infrastructure (Complete)
- Project structure
- Docker configuration
- Database schema
- Basic authentication

### ✅ Phase 2: US1 - Task Posting (Complete)
- User registration/login
- Task creation
- Task browsing
- Task acceptance

### 🚧 Phase 3: US2 - Payments (Next)
- Escrow service
- Payment integration
- Transaction tracking
- Auto-refund system

### 📅 Future Phases
- Phase 4: Rating system
- Phase 5: Fraud prevention & KYC
- Phase 6: AI matching optimization
- Phase 7: Multi-language support
- Phase 8: Notifications
- Phase 9: Dispute resolution

---

**Built with ❤️ for Hong Kong's diverse community**
