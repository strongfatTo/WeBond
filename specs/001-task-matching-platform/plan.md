# Implementation Plan: WeBond Task Matching Platform (MVP)

**Branch**: `001-task-matching-platform` | **Date**: 2025-10-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-task-matching-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

WeBond is a mobile-first platform connecting non-local residents in Hong Kong with local helpers through AI-driven task matching, secure escrow payments, and mutual rating systems. The MVP targets international students during pilot phase and must prioritize trust, safety, and social inclusion per constitution principles.

**Technical Approach**: Cross-platform mobile app (React Native) + Node.js REST API + PostgreSQL database + Python AI matching service. Integrates with HKMA-licensed payment providers (FPS/PayMe). Implements KYC verification, fraud detection, and multi-language support (English, Cantonese, Mandarin).

## Technical Context

**Language/Version**: 
- **Mobile**: JavaScript/TypeScript (React Native 0.72+)
- **API**: Node.js 20 LTS + TypeScript 5.x
- **AI Service**: Python 3.11
- **Database**: PostgreSQL 15

**Primary Dependencies**: 
- **Mobile**: React Native, React Navigation, Redux Toolkit, Axios, react-native-maps, i18next
- **API**: Express.js, Prisma ORM, JWT authentication, Winston logging, Node-cron
- **AI**: scikit-learn, pandas, FastAPI (ML service endpoint), Redis (caching)
- **Payment**: FPS SDK / PayMe SDK (HKMA-licensed)
- **Testing**: Jest, React Native Testing Library, Supertest, pytest

**Storage**: 
- **Primary**: PostgreSQL 15 (user data, tasks, transactions, ratings)
- **Cache**: Redis 7 (AI recommendations, session management)
- **Files**: AWS S3 / Azure Blob (ID verification documents, profile photos)

**Testing**: 
- **Mobile**: Jest + React Native Testing Library (unit), Detox (E2E)
- **API**: Jest + Supertest (integration), Jest (unit)
- **AI**: pytest (unit + integration)
- **Target**: 80% code coverage minimum (Constitution requirement)

**Target Platform**: 
- **Mobile**: iOS 14+ and Android 10+ (React Native cross-platform)
- **API**: Ubuntu Server 22.04 LTS / Docker containers
- **AI Service**: Linux server / containerized deployment

**Project Type**: **Mobile + API** (cross-platform mobile app with backend services)

**Performance Goals**: 
- AI matching: < 3 seconds response time
- Payment processing: < 5 seconds end-to-end
- App load time: < 2 seconds on 4G networks
- API response time: < 200ms p95 for standard queries
- Database queries: < 100ms for indexed lookups
- Support 1,000 concurrent users without degradation

**Constraints**: 
- **Compliance**: PDPO (Hong Kong data privacy), HKMA payment regulations, KYC/AML requirements
- **Security**: TLS 1.3 for data transmission, encryption at rest, secure token storage
- **Offline**: Basic task browsing available offline; payment/posting requires connection
- **Languages**: Must support English, Traditional Chinese (Cantonese), Simplified Chinese (Mandarin)
- **Accessibility**: WCAG 2.1 Level AA compliance, screen reader support

**Scale/Scope**: 
- **Users**: Pilot: 500-1,000 users (students), Phase 2: 10,000+ users
- **Tasks**: Expected 100-500 tasks/month during pilot
- **Screens**: ~25-30 mobile screens (task flow, profile, payment, ratings, admin)
- **API Endpoints**: ~40-50 REST endpoints
- **Data Volume**: ~10GB database for pilot, 100GB+ for Phase 2

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: User Trust & Safety First (NON-NEGOTIABLE)
- ✅ **Identity Verification**: KYC flow with ID upload + selfie for all solvers (FR-002)
- ✅ **Escrow Payments**: HKMA-licensed payment integration (FPS/PayMe) mandatory (FR-016)
- ✅ **PDPO Compliance**: User data encryption (TLS 1.3), data access/deletion rights (FR-030, FR-031)
- ✅ **Fraud Prevention**: Device/IP detection, automated flagging, account suspension (FR-027, FR-028)
- ✅ **Audit Logging**: All security events logged (login, payments, account changes) (FR-029)

### Principle II: Social Inclusion as Core Mission
- ✅ **Multi-Language Support**: English, Cantonese, Mandarin in MVP (FR-035)
- ✅ **Cultural Sensitivity**: Language matching in AI algorithm (15% weight) (FR-011)
- ✅ **Cross-Cultural Engagement**: Success metric SC-018 tracks positive cross-cultural ratings
- ✅ **Accessibility**: WCAG 2.1 AA compliance, screen reader support

### Principle III: AI-Driven Intelligence
- ✅ **Transparent Matching**: AI explanations shown (e.g., "Nearby + High rating") (FR-013)
- ✅ **Explainable Algorithm**: Weighting disclosed (proximity 30%, rating 30%, experience 25%, language 15%) (FR-011)
- ✅ **User Control**: Manual search override when AI confidence < 60% (FR-014, FR-015)
- ✅ **Performance**: AI matching < 3 seconds (SC-009)

### Principle IV: Transparent Operations
- ✅ **Clear Pricing**: Payment breakdown displayed (Bronze 30%, Silver 20%, Gold 10%) (FR-018)
- ✅ **Public Ratings**: All ratings visible on profiles (FR-026)
- ✅ **Tiered Commission**: Automatic tier promotion based on completed tasks (FR-024)
- ✅ **Notification Transparency**: All updates sent in user's preferred language (FR-034)

### Principle V: Sustainable Scalability
- ✅ **Modular Architecture**: Mobile app, API server, AI service, database independently scalable
- ✅ **Performance Targets**: 1,000 concurrent users, 99.5% uptime (SC-011, SC-012)
- ✅ **Phased Rollout**: Pilot with students (500-1k users) before Phase 2 expansion (10k+)
- ✅ **Caching Strategy**: Redis for AI recommendations and session management
- ✅ **Database Optimization**: Indexed queries < 100ms, prepared for horizontal scaling

### Technical Excellence Standards
- ✅ **Code Coverage**: 80% minimum (Jest, pytest) per constitution
- ✅ **Integration Tests**: Payment flows, AI matching, authentication, rating system
- ✅ **Performance Monitoring**: API response < 200ms p95, app load < 2s on 4G
- ✅ **Code Reviews**: All PRs require approval before merge

**GATE RESULT**: ✅ **PASSED** - All constitution principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```
specs/001-task-matching-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-endpoints.yaml      # OpenAPI spec for REST API
│   ├── user-management.md      # User/auth endpoints
│   ├── task-management.md      # Task CRUD endpoints
│   ├── payment-escrow.md       # Payment/transaction endpoints
│   ├── ai-matching.md          # AI recommendation endpoints
│   └── rating-system.md        # Rating/review endpoints
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
mobile/                          # React Native cross-platform app
├── src/
│   ├── screens/                 # Screen components (25-30 screens)
│   │   ├── auth/               # Login, register, verification
│   │   ├── tasks/              # Browse, create, detail, status
│   │   ├── profile/            # User profile, solver profile
│   │   ├── payment/            # Payment, escrow, transaction history
│   │   ├── ratings/            # Rating submission, view ratings
│   │   └── settings/           # Language, notifications, account
│   ├── components/             # Reusable UI components
│   │   ├── TaskCard/
│   │   ├── SolverProfile/
│   │   ├── PaymentBreakdown/
│   │   └── RatingStars/
│   ├── navigation/             # React Navigation setup
│   ├── store/                  # Redux Toolkit state management
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── taskSlice.ts
│   │   │   ├── paymentSlice.ts
│   │   │   └── ratingSlice.ts
│   │   └── store.ts
│   ├── services/               # API client services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── paymentService.ts
│   │   └── aiMatchingService.ts
│   ├── utils/
│   │   ├── i18n.ts            # Multi-language (en, zh-HK, zh-CN)
│   │   ├── validation.ts
│   │   └── formatting.ts
│   └── types/                  # TypeScript type definitions
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/                    # Detox E2E tests
├── android/                    # Android native code
├── ios/                        # iOS native code
├── package.json
└── tsconfig.json

api/                            # Node.js + Express REST API
├── src/
│   ├── models/                 # Prisma ORM models
│   │   ├── user.ts
│   │   ├── task.ts
│   │   ├── transaction.ts
│   │   ├── rating.ts
│   │   └── dispute.ts
│   ├── controllers/            # Request handlers
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   ├── paymentController.ts
│   │   ├── ratingController.ts
│   │   └── aiController.ts
│   ├── services/               # Business logic
│   │   ├── userService.ts
│   │   ├── taskService.ts
│   │   ├── escrowService.ts
│   │   ├── kycService.ts
│   │   ├── fraudDetectionService.ts
│   │   └── notificationService.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── payments.ts
│   │   ├── ratings.ts
│   │   └── users.ts
│   ├── integrations/           # External service integrations
│   │   ├── fpsPayment.ts      # FPS payment provider
│   │   ├── paymePayment.ts    # PayMe payment provider
│   │   ├── s3Storage.ts       # AWS S3 for file uploads
│   │   └── emailService.ts    # Email notifications
│   ├── utils/
│   │   ├── logger.ts          # Winston logging
│   │   ├── encryption.ts
│   │   └── validation.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/           # Supertest API tests
│   └── contract/              # Contract tests
├── package.json
└── tsconfig.json

ai-service/                     # Python ML service for matching
├── src/
│   ├── models/
│   │   ├── matcher.py         # AI matching algorithm
│   │   └── recommender.py     # Recommendation engine
│   ├── services/
│   │   ├── matching_service.py
│   │   └── feature_engineering.py
│   ├── api/
│   │   └── endpoints.py       # FastAPI endpoints
│   ├── utils/
│   │   ├── distance_calc.py   # Proximity calculation
│   │   └── score_weights.py   # Weighting logic (30/30/25/15)
│   └── main.py
├── tests/
│   ├── test_matcher.py
│   └── test_recommendations.py
├── requirements.txt
└── Dockerfile

shared/                         # Shared types and constants
├── types/
│   ├── user.ts
│   ├── task.ts
│   └── payment.ts
└── constants/
    ├── taskCategories.ts
    └── tiers.ts
```

**Structure Decision**: **Mobile + API architecture** selected based on cross-platform mobile requirement (iOS + Android) with backend services. React Native chosen for code sharing across platforms (faster development, single codebase). Node.js API provides REST endpoints. Python AI service isolated for ML-specific workload. PostgreSQL for relational data (users, tasks, transactions). Redis for caching AI recommendations and sessions.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected.** Constitution check passed. All architecture decisions align with principles.

