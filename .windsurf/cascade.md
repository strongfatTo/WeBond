# WeBond Development Guidelines

Auto-generated from feature plans. Last updated: 2025-10-20

## Active Technologies

**Mobile App**:
- React Native 0.72+ with TypeScript 5.x
- React Navigation for routing
- Redux Toolkit for state management
- i18next for multi-language support (en, zh-HK, zh-CN)
- Jest + React Native Testing Library for testing
- Detox for E2E testing

**Backend API**:
- Node.js 20 LTS with Express.js and TypeScript 5.x
- Prisma ORM for database access
- PostgreSQL 15 for primary database
- Redis 7 for caching and session management
- JWT for authentication
- Winston for logging
- Jest + Supertest for testing

**AI Matching Service**:
- Python 3.11
- FastAPI for API endpoints
- scikit-learn for ML algorithms
- pandas for data processing
- pytest for testing

**Infrastructure**:
- Docker Compose for local development
- AWS S3 for file storage (ID documents, profile photos)
- FPS/PayMe SDK for payments (HKMA-licensed)

## Project Structure
```
mobile/                          # React Native cross-platform app
├── src/
│   ├── screens/                 # Screen components (25-30 screens)
│   ├── components/             # Reusable UI components
│   ├── navigation/             # React Navigation setup
│   ├── store/                  # Redux Toolkit state management
│   ├── services/               # API client services
│   ├── utils/                  # i18n, validation, formatting
│   └── types/                  # TypeScript type definitions
├── __tests__/
└── package.json

api/                            # Node.js + Express REST API
├── src/
│   ├── models/                 # Prisma ORM models
│   ├── controllers/            # Request handlers
│   ├── services/               # Business logic
│   ├── middleware/             # Auth, validation, error handling
│   ├── routes/                 # API routes
│   ├── integrations/           # FPS, PayMe, S3, email
│   ├── utils/                  # Logger, encryption, validation
│   └── server.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/
├── tests/
└── package.json

ai-service/                     # Python ML service
├── src/
│   ├── models/                 # AI matching algorithm
│   ├── services/               # Matching service
│   ├── api/                    # FastAPI endpoints
│   └── utils/                  # Distance calc, score weights
├── tests/
└── requirements.txt
```

## Commands

### Development Setup
```bash
# Start database services
docker-compose up -d

# API setup
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# AI service setup
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py

# Mobile setup
cd mobile
npm install
npm start
npm run ios  # or npm run android
```

### Testing
```bash
# API tests (80% coverage required)
cd api
npm test
npm run test:coverage

# Mobile tests
cd mobile
npm test
npm run test:e2e

# AI service tests
cd ai-service
pytest --cov=src
```

### Database
```bash
cd api
npx prisma studio              # GUI at localhost:5555
npx prisma migrate dev         # Create migration
npx prisma migrate reset       # Reset database (⚠️ deletes data)
```

### Code Quality
```bash
npm run lint                   # Check linting
npm run lint:fix              # Auto-fix issues
npm run format                # Format with Prettier
npm run type-check            # TypeScript validation
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript strict mode
- Async/await over callbacks
- Functional components with hooks (React)
- No `any` types - use proper typing
- Arrow functions for inline callbacks
- Destructuring for cleaner code

### Python
- Follow PEP 8 style guide
- Type hints for all functions
- Docstrings for public methods
- f-strings for string formatting

### Database
- Use Prisma for all database queries
- Index foreign keys and commonly queried fields
- Use transactions for multi-step operations
- Validate data before database insertion

### API Design
- RESTful conventions (GET/POST/PUT/DELETE)
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
- Consistent response format: `{ success: true/false, data: {...}, error: {...} }`
- Rate limiting on all endpoints

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user journeys
- Minimum 80% code coverage (constitution requirement)
- Mock external services (payment providers, S3)

## Recent Changes

### Feature: Task Matching Platform (001-task-matching-platform)
**Added**: 2025-10-20
**Technologies**: React Native, Node.js, Python, PostgreSQL, Redis
**Key Components**:
- Mobile app with task posting, browsing, payment, rating
- REST API with 40-50 endpoints across 5 modules
- AI matching service with transparent scoring (proximity 30%, rating 30%, experience 25%, language 15%)
- Escrow payment system with FPS/PayMe integration
- Multi-language support (English, Cantonese, Mandarin)
- KYC verification flow for solvers

**Database Entities**: User, SolverProfile, Task, Transaction, Rating, MatchRecommendation, Dispute, Notification

**Constitution Alignment**:
- Trust & Safety: KYC verification, escrow payments, fraud detection
- Social Inclusion: Multi-language, cross-cultural ratings
- AI Intelligence: Transparent matching with explanations
- Transparency: Clear commission structure (Bronze 30%, Silver 20%, Gold 10%)
- Scalability: Supports 1,000 concurrent users, 99.5% uptime target

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
