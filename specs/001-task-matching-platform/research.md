# Technology Research & Decisions: WeBond MVP

**Feature**: Task Matching Platform (MVP)  
**Date**: 2025-10-20  
**Status**: Completed

## Overview

This document captures technology decisions, rationales, and alternatives considered for the WeBond MVP platform. All decisions align with constitution principles and project requirements.

---

## 1. Mobile Framework Selection

### Decision: React Native 0.72+

**Rationale**:
- **Cross-platform development**: Single codebase for iOS and Android reduces development time by 40-50%
- **Faster MVP delivery**: 7-week timeline requires efficient development (Week 4-6 for MVP)
- **Rich ecosystem**: Large library support for maps, payments, i18n, navigation
- **Performance**: Adequate for task browsing, forms, and light animations (< 2s load time achievable)
- **Team scalability**: JavaScript/TypeScript skills more common than native Swift/Kotlin

**Alternatives Considered**:
- **Flutter**: Rejected due to smaller Hong Kong developer community, team unfamiliar with Dart
- **Native iOS/Android**: Rejected due to duplicate effort, longer timeline incompatible with 7-week deadline
- **PWA**: Rejected due to limited offline capabilities, poor integration with camera (KYC verification), notifications

**Trade-offs**:
- Slightly lower performance than native (acceptable for MVP, can optimize later)
- Some platform-specific features may require native modules (maps, payments)

---

## 2. Backend API Framework

### Decision: Node.js 20 LTS + Express.js + TypeScript

**Rationale**:
- **Type safety**: TypeScript ensures contract alignment between mobile and API
- **Shared types**: Can share TypeScript definitions between mobile and backend
- **Non-blocking I/O**: Handles concurrent requests efficiently (1,000 concurrent users target)
- **JSON native**: Natural fit for REST API and mobile JSON communication
- **Ecosystem**: Extensive middleware for JWT auth, validation, logging, rate limiting
- **Team consistency**: Same language (TypeScript) across mobile and API reduces context switching

**Alternatives Considered**:
- **Python FastAPI**: Rejected for API (but used for AI service) - would create language split for main API
- **Go**: Rejected due to steeper learning curve, overkill for MVP scale
- **Ruby on Rails**: Rejected due to smaller modern ecosystem, slower JSON serialization

**Trade-offs**:
- Lower raw performance than Go/Rust (acceptable for MVP scale 500-1k users)
- Callback complexity mitigated by async/await

---

## 3. AI Matching Service

### Decision: Python 3.11 + scikit-learn + FastAPI

**Rationale**:
- **ML ecosystem**: Python is standard for machine learning, scikit-learn mature and well-documented
- **Faster prototyping**: Can iterate on matching algorithm quickly
- **Separation of concerns**: Isolated service allows independent scaling and updates
- **FastAPI**: Modern async framework, auto-generates OpenAPI docs, fast enough for < 3s matching requirement
- **Redis integration**: Easy caching for recommendation results

**Alternatives Considered**:
- **Node.js ML libraries**: Rejected due to immature ecosystem (TensorFlow.js less battle-tested)
- **Embedding in main API**: Rejected to avoid coupling, allows AI service to scale independently
- **Cloud ML services (AWS SageMaker)**: Rejected for MVP due to cost, complexity, vendor lock-in

**Matching Algorithm Approach**:
- **Phase 1 (MVP)**: Rule-based weighted scoring (proximity 30%, rating 30%, experience 25%, language 15%)
- **Phase 2**: Introduce collaborative filtering based on successful matches
- **Phase 3**: Deep learning for personalized recommendations (if data volume justifies)

---

## 4. Database Selection

### Decision: PostgreSQL 15

**Rationale**:
- **Relational integrity**: User-task-transaction-rating relationships naturally relational
- **ACID compliance**: Critical for payment escrow (consistency required)
- **JSON support**: Can store flexible data (task metadata, AI explanations) without schema changes
- **Full-text search**: Built-in for task description search
- **Mature ecosystem**: Prisma ORM provides type-safe database access
- **Scalability**: Handles 10GB pilot data, can scale to 100GB+ with read replicas

**Alternatives Considered**:
- **MongoDB**: Rejected due to weaker transactional guarantees (risky for payments)
- **MySQL**: Rejected due to PostgreSQL's superior JSON support and full-text search
- **DynamoDB**: Rejected for MVP due to cost, learning curve, relational data better in SQL

**Schema Design Principles**:
- Normalized tables for core entities (users, tasks, transactions)
- Indexes on foreign keys, location columns (for proximity search)
- Composite indexes for common queries (task status + location, user role + verification status)

---

## 5. Caching Strategy

### Decision: Redis 7

**Rationale**:
- **AI recommendation caching**: Cache match results for 5 minutes (reduces AI service load)
- **Session management**: Store JWT refresh tokens, user sessions
- **Rate limiting**: Track API request counts per user
- **Pub/Sub**: Real-time notifications (task updates, payment status)

**Alternatives Considered**:
- **Memcached**: Rejected due to lack of data structures (lists, sets needed for notifications)
- **In-memory caching (Node.js)**: Rejected due to loss on server restart, doesn't scale horizontally

**Cache Invalidation**:
- Task updates → invalidate solver recommendations
- Rating updates → invalidate solver profile cache
- Payment completion → invalidate transaction status cache

---

## 6. File Storage

### Decision: AWS S3 (or Azure Blob as alternative)

**Rationale**:
- **Scalability**: Handles verification documents (ID photos, selfies) and profile images
- **Cost-effective**: Pay-per-use, cheaper than database BLOB storage
- **CDN integration**: Can add CloudFront for faster image loading
- **Security**: Supports encryption at rest, signed URLs for temporary access

**Alternatives Considered**:
- **Local server storage**: Rejected due to backup complexity, doesn't scale across servers
- **Database BLOB storage**: Rejected due to performance impact, expensive for large files

**Upload Flow**:
1. Mobile app requests signed URL from API
2. App uploads directly to S3 (bypasses API, faster)
3. App notifies API of successful upload
4. API stores S3 key in database

---

## 7. Payment Integration

### Decision: FPS (Faster Payment System) + PayMe SDK

**Rationale**:
- **HKMA-licensed**: Meets constitution requirement for regulatory compliance
- **Local adoption**: FPS widely used in Hong Kong (familiar to users)
- **Low fees**: FPS has lower transaction costs than international providers (Stripe)
- **Real-time settlement**: Supports escrow flow (hold → release within 5 seconds)

**Alternatives Considered**:
- **Stripe**: Rejected due to higher international fees, less local adoption
- **Alipay/WeChat Pay**: Considered as Phase 2 addition for Mainland users
- **PayPal**: Rejected due to limited Hong Kong merchant adoption

**Escrow Implementation**:
- API creates "hold" transaction with payment provider
- Funds moved to platform escrow account
- On task completion, API calls "release" to transfer to solver
- On dispute, funds remain held until manual resolution

---

## 8. Authentication & Security

### Decision: JWT (JSON Web Tokens) + Refresh Token Pattern

**Rationale**:
- **Stateless**: API doesn't need to store session state (scales horizontally)
- **Mobile-friendly**: Tokens stored securely in mobile app keychain/keystore
- **Refresh tokens**: Access tokens expire in 15 minutes, refresh tokens in 30 days (balance security + UX)
- **TLS 1.3**: All API communication encrypted in transit

**Password Storage**:
- bcrypt with salt rounds = 12 (balances security + performance)
- Minimum password length: 8 characters, require mix of character types

**Alternatives Considered**:
- **Session-based auth**: Rejected due to stateful nature, harder to scale
- **OAuth2 providers (Google, Facebook)**: Planned for Phase 2, not MVP (reduces registration friction)

**KYC Verification**:
- Manual review for MVP (photos reviewed by admin within 24 hours)
- Phase 2: Integrate automated OCR + face matching service (e.g., Onfido, Jumio)

---

## 9. Multi-Language Support

### Decision: i18next (mobile) + JSON translation files

**Rationale**:
- **React Native standard**: i18next most popular i18n library for React Native
- **Namespace support**: Can organize translations by screen/feature
- **Lazy loading**: Load only active language (reduces app bundle size)
- **Fallback chain**: English (en) → Traditional Chinese (zh-HK) → Simplified Chinese (zh-CN)

**Translation Strategy**:
- **MVP languages**: English, Traditional Chinese (Cantonese), Simplified Chinese (Mandarin)
- **Phase 2 languages**: French, Japanese, Korean, Hindi (based on user demographics)
- **Professional translation**: Hire native speakers to translate (not machine translation)
- **Right-to-left (RTL)**: Not needed for MVP languages, defer to Phase 2 if Arabic added

---

## 10. Testing Strategy

### Decision: Jest (mobile + API) + pytest (AI service) + Detox (E2E)

**Rationale**:
- **80% coverage target**: Constitution requirement met through unit + integration tests
- **Jest**: Standard for React Native and Node.js, fast, built-in mocking
- **Detox**: Best-in-class E2E testing for React Native (tests on real iOS/Android simulators)
- **Contract testing**: Ensures mobile and API agree on endpoint schemas

**Test Pyramid**:
- **Unit tests (70%)**: Individual functions, components, services
- **Integration tests (20%)**: API endpoints, database interactions, payment flows
- **E2E tests (10%)**: Critical user journeys (task posting, payment, rating)

**Critical Integration Tests**:
- Payment escrow flow (hold → release → refund)
- AI matching recommendations (input → output validation)
- KYC verification workflow (upload → review → approval)
- Rating aggregation (new rating → updated average)

---

## 11. CI/CD Pipeline

### Decision: GitHub Actions (code repository assumed GitHub)

**Rationale**:
- **Free for public repos**: Reduces infrastructure cost during MVP
- **YAML configuration**: Pipeline as code, version controlled
- **Matrix builds**: Test iOS and Android in parallel
- **Deployment automation**: Auto-deploy to staging after tests pass

**Pipeline Stages**:
1. **Lint**: ESLint (TypeScript), Prettier (formatting), pylint (Python)
2. **Test**: Run Jest, pytest, check 80% coverage threshold
3. **Build**: Compile TypeScript, build React Native bundles
4. **E2E**: Run Detox tests on simulators
5. **Deploy**: Push to staging environment (manual approve for production)

**Alternatives Considered**:
- **GitLab CI**: Rejected unless using GitLab as repo
- **Jenkins**: Rejected due to self-hosting complexity, slower setup

---

## 12. Monitoring & Logging

### Decision: Winston (API logging) + Sentry (error tracking)

**Rationale**:
- **Winston**: Structured JSON logs, supports multiple transports (console, file, cloud)
- **Sentry**: Real-time error tracking, performance monitoring, user context
- **Constitution requirement**: Audit logging for security events

**Log Levels**:
- **ERROR**: Payment failures, API crashes, authentication failures
- **WARN**: Rate limit hits, KYC rejections, dispute creations
- **INFO**: Task creation, payment completion, user registration
- **DEBUG**: AI matching scores, detailed request logs (only in dev)

**Metrics to Track**:
- API response times (p50, p95, p99)
- AI matching duration
- Payment success/failure rates
- User registration completion funnel
- Task acceptance rate

---

## 13. Development Environment

### Decision: Docker Compose (local) + Ubuntu Server (staging/production)

**Rationale**:
- **Docker**: Consistent environment across developers, easy PostgreSQL + Redis setup
- **docker-compose.yml**: Single command to start all services locally
- **Ubuntu Server**: Industry standard, free, well-documented, supports Docker

**Local Development Stack**:
```yaml
services:
  - postgres (port 5432)
  - redis (port 6379)
  - api (port 3000)
  - ai-service (port 8000)
  - mobile (Expo/Metro bundler)
```

**Alternatives Considered**:
- **Kubernetes**: Overkill for MVP scale, deferred to Phase 2 scaling
- **Heroku/Vercel**: Considered but Docker gives more control, easier to migrate

---

## 14. API Documentation

### Decision: OpenAPI 3.0 (Swagger) + Postman Collections

**Rationale**:
- **OpenAPI**: Industry standard, auto-generates interactive docs
- **Swagger UI**: Free, hosted alongside API for developer reference
- **Postman**: Useful for manual testing, share collections with team

**Documentation Requirements**:
- All endpoints documented with request/response schemas
- Example payloads for each endpoint
- Error codes and meanings
- Authentication requirements

---

## Summary of Key Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Mobile | React Native 0.72+ | Cross-platform, faster MVP delivery |
| API | Node.js 20 + Express + TypeScript | Type safety, shared types with mobile |
| AI Service | Python 3.11 + scikit-learn + FastAPI | ML ecosystem, isolated service |
| Database | PostgreSQL 15 | ACID compliance for payments, relational data |
| Cache | Redis 7 | AI results caching, sessions, pub/sub |
| Storage | AWS S3 | Scalable file storage for KYC docs |
| Payments | FPS + PayMe SDK | HKMA-licensed, local adoption |
| Auth | JWT + Refresh Tokens | Stateless, mobile-friendly |
| i18n | i18next | React Native standard, lazy loading |
| Testing | Jest + Detox + pytest | 80% coverage, E2E critical paths |
| Logging | Winston + Sentry | Structured logs, error tracking |
| CI/CD | GitHub Actions | Free, pipeline as code |

---

## Open Questions / Future Research

1. **Phase 2 Payment Providers**: Research Alipay/WeChat Pay integration for Mainland users
2. **Automated KYC**: Evaluate Onfido vs Jumio for Phase 2 automated verification
3. **Scalability**: Research PostgreSQL read replicas + connection pooling when hitting 5k+ users
4. **Push Notifications**: Decide between Firebase Cloud Messaging vs OneSignal (deferred to implementation)
5. **App Store Optimization**: Research ASO best practices for Hong Kong market

---

**Research Status**: ✅ Complete - All major technology decisions documented and justified.
