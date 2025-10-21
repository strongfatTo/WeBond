# Tasks: WeBond Task Matching Platform (MVP)

**Input**: Design documents from `/specs/001-task-matching-platform/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, etc.)

---

## Phase 1: Setup

- [x] T001 Create project structure (mobile/, api/, ai-service/, shared/)
- [x] T002 Initialize React Native project in mobile/ with TypeScript
- [x] T003 [P] Initialize Node.js + Express in api/ with Prisma ORM
- [x] T004 [P] Initialize Python + FastAPI in ai-service/
- [x] T005 [P] Setup Docker Compose (PostgreSQL, Redis)
- [ ] T006 [P] Configure linting (ESLint, Prettier, Black)
- [x] T007 [P] Create shared types in shared/types/
- [ ] T008 [P] Setup GitHub Actions CI/CD
- [x] T009 [P] Create .env.example files

---

## Phase 2: Foundational (BLOCKS all user stories)

- [x] T010 Define Prisma schema with 8 entities in api/prisma/schema.prisma
- [ ] T011 [P] Create database migration
- [x] T012 [P] Setup Redis client in api/src/utils/redis.ts
- [x] T013 [P] Implement JWT auth middleware in api/src/middleware/auth.ts
- [x] T014 [P] Implement validation middleware in api/src/middleware/validation.ts
- [x] T015 [P] Implement error handler in api/src/middleware/errorHandler.ts
- [ ] T016 [P] Implement rate limiting in api/src/middleware/rateLimit.ts
- [x] T017 [P] Setup Winston logger in api/src/utils/logger.ts
- [ ] T018 [P] Setup Sentry in api/src/utils/sentry.ts
- [ ] T019 [P] Setup i18next in mobile/src/utils/i18n.ts
- [ ] T020 [P] Create API client in mobile/src/services/api.ts
- [ ] T021 [P] Setup Redux store in mobile/src/store/store.ts
- [ ] T022 [P] Setup React Navigation in mobile/src/navigation/
- [ ] T023 [P] Setup AWS S3 integration in api/src/integrations/s3Storage.ts

---

## Phase 3: US1 - Task Posting & Discovery (P1) 🎯 MVP

**Goal**: Task raisers post tasks, browse AI-matched solvers

### Backend - User & Auth
- [x] T024 [P] [US1] Create User model in api/src/models/user.ts
- [x] T025 [P] [US1] Create authController register in api/src/controllers/authController.ts
- [x] T026 [P] [US1] Create authController login in api/src/controllers/authController.ts
- [ ] T027 [US1] Implement userService in api/src/services/userService.ts
- [x] T028 [US1] Wire auth routes in api/src/routes/auth.ts

### Backend - Tasks
- [x] T029 [P] [US1] Create Task model in api/src/models/task.ts
- [ ] T030 [US1] Implement taskService in api/src/services/taskService.ts
- [x] T031 [US1] Create taskController in api/src/controllers/taskController.ts
- [x] T032 [US1] Wire task routes in api/src/routes/tasks.ts

### Backend - Basic AI Matching
- [ ] T033 [P] [US1] Create MatchRecommendation model in api/src/models/matchRecommendation.ts
- [ ] T034 [US1] Implement matchingService in api/src/services/matchingService.ts
- [ ] T035 [US1] Create aiController in api/src/controllers/aiController.ts

### Mobile - Auth
- [ ] T036 [P] [US1] Create authSlice in mobile/src/store/slices/authSlice.ts
- [ ] T037 [P] [US1] Create authService in mobile/src/services/authService.ts
- [ ] T038 [US1] Create LoginScreen in mobile/src/screens/auth/LoginScreen.tsx
- [ ] T039 [US1] Create RegisterScreen in mobile/src/screens/auth/RegisterScreen.tsx

### Mobile - Tasks
- [ ] T040 [P] [US1] Create taskSlice in mobile/src/store/slices/taskSlice.ts
- [ ] T041 [P] [US1] Create taskService in mobile/src/services/taskService.ts
- [ ] T042 [US1] Create TaskCard component in mobile/src/components/TaskCard/
- [ ] T043 [US1] Create CreateTaskScreen in mobile/src/screens/tasks/CreateTaskScreen.tsx
- [ ] T044 [US1] Create TaskListScreen in mobile/src/screens/tasks/TaskListScreen.tsx
- [ ] T045 [US1] Create TaskDetailScreen in mobile/src/screens/tasks/TaskDetailScreen.tsx
- [ ] T046 [US1] Create SolverProfileCard in mobile/src/components/SolverProfile/

---

## Phase 4: US2 - Secure Payment & Escrow (P1) 🎯 MVP

**Goal**: Escrow payment until task completion

### Backend - Payments
- [ ] T047 [P] [US2] Create Transaction model in api/src/models/transaction.ts
- [ ] T048 [P] [US2] Setup FPS integration in api/src/integrations/fpsPayment.ts
- [ ] T049 [P] [US2] Setup PayMe integration in api/src/integrations/paymePayment.ts
- [ ] T050 [US2] Implement escrowService in api/src/services/escrowService.ts
- [ ] T051 [US2] Create paymentController in api/src/controllers/paymentController.ts
- [ ] T052 [US2] Wire payment routes in api/src/routes/payments.ts
- [ ] T053 [US2] Add task completion logic to taskService
- [ ] T054 [US2] Implement auto-refund job in api/src/jobs/autoRefund.ts

### Mobile - Payments
- [ ] T055 [P] [US2] Create paymentSlice in mobile/src/store/slices/paymentSlice.ts
- [ ] T056 [P] [US2] Create paymentService in mobile/src/services/paymentService.ts
- [ ] T057 [US2] Create PaymentBreakdown component in mobile/src/components/
- [ ] T058 [US2] Create PaymentConfirmScreen in mobile/src/screens/payment/
- [ ] T059 [US2] Create TransactionHistoryScreen in mobile/src/screens/payment/

---

## Phase 5: US5 - Fraud Prevention & KYC (P2)

**Goal**: Identity verification and fraud detection

### Backend - KYC
- [ ] T060 [P] [US5] Update SolverProfile model for KYC
- [ ] T061 [US5] Implement kycService in api/src/services/kycService.ts
- [ ] T062 [US5] Add KYC endpoints to userController
- [ ] T063 [P] [US5] Implement fraudDetectionService in api/src/services/fraudDetectionService.ts
- [ ] T064 [US5] Add fraud middleware in api/src/middleware/fraudDetection.ts
- [ ] T065 [US5] Create audit logger in api/src/utils/auditLogger.ts

### Mobile - KYC
- [ ] T066 [P] [US5] Create SolverVerificationScreen in mobile/src/screens/profile/
- [ ] T067 [US5] Create VerificationStatusScreen in mobile/src/screens/profile/
- [ ] T068 [US5] Add "Verified" badge to SolverProfileCard

---

## Phase 6: US3 - Rating & Reputation (P2)

**Goal**: Mutual ratings and tier promotion

### Backend - Ratings
- [ ] T069 [P] [US3] Create Rating model in api/src/models/rating.ts
- [ ] T070 [US3] Implement ratingService in api/src/services/ratingService.ts
- [ ] T071 [US3] Create ratingController in api/src/controllers/ratingController.ts
- [ ] T072 [US3] Wire rating routes in api/src/routes/ratings.ts
- [ ] T073 [US3] Implement tier promotion logic in ratingService
- [ ] T074 [US3] Create account review job in api/src/jobs/accountReview.ts

### Mobile - Ratings
- [ ] T075 [P] [US3] Create ratingSlice in mobile/src/store/slices/ratingSlice.ts
- [ ] T076 [P] [US3] Create ratingService in mobile/src/services/ratingService.ts
- [ ] T077 [US3] Create RatingStars component in mobile/src/components/
- [ ] T078 [US3] Create RatingSubmitScreen in mobile/src/screens/ratings/
- [ ] T079 [US3] Create RatingListScreen in mobile/src/screens/ratings/
- [ ] T080 [US3] Add ratings to SolverProfileCard

---

## Phase 7: US4 - AI Matching Optimization (P3)

**Goal**: ML-based matching with explanations

### AI Service
- [ ] T081 [P] [US4] Create feature_engineering.py in ai-service/src/services/
- [ ] T082 [P] [US4] Implement distance_calc.py in ai-service/src/utils/
- [ ] T083 [P] [US4] Implement score_weights.py in ai-service/src/utils/
- [ ] T084 [US4] Create matcher.py in ai-service/src/models/
- [ ] T085 [US4] Create recommender.py in ai-service/src/models/
- [ ] T086 [US4] Create FastAPI endpoints in ai-service/src/api/endpoints.py
- [ ] T087 [US4] Setup main.py in ai-service/src/

### Backend & Mobile - AI Integration
- [ ] T088 [US4] Update matchingService to call AI service
- [ ] T089 [US4] Add explain-match endpoint to aiController
- [ ] T090 [P] [US4] Create aiMatchingService in mobile/src/services/
- [ ] T091 [US4] Add match explanations to SolverProfileCard
- [ ] T092 [US4] Create MatchExplanation component in mobile/src/components/

---

## Phase 8: US6 - Multi-Language (P3)

**Goal**: Full multi-language support

- [ ] T093 [P] [US6] Add language endpoints to userController
- [ ] T094 [US6] Update matchingService for language priority
- [ ] T095 [US6] Update notificationService for user language
- [ ] T096 [P] [US6] Add translation files in mobile/src/locales/
- [ ] T097 [US6] Create LanguageSettingsScreen in mobile/src/screens/settings/
- [ ] T098 [US6] Update all screens to use i18next

---

## Phase 9: Additional Features

### Notifications
- [ ] T099 [P] Create Notification model in api/src/models/notification.ts
- [ ] T100 Implement notificationService in api/src/services/notificationService.ts
- [ ] T101 [P] Create NotificationListScreen in mobile/src/screens/notifications/
- [ ] T102 [P] Add Firebase Cloud Messaging in mobile/

### Disputes
- [ ] T103 [P] Create Dispute model in api/src/models/dispute.ts
- [ ] T104 Implement disputeService in api/src/services/disputeService.ts
- [ ] T105 [P] Create DisputeRaiseScreen in mobile/src/screens/disputes/
- [ ] T106 [P] Create DisputeDetailScreen in mobile/src/screens/disputes/

---

## Phase 10: Testing

### Backend Tests
- [ ] T107 [P] Unit tests for authService in api/tests/unit/
- [ ] T108 [P] Unit tests for taskService in api/tests/unit/
- [ ] T109 [P] Unit tests for escrowService in api/tests/unit/
- [ ] T110 [P] Integration test for auth flow in api/tests/integration/
- [ ] T111 [P] Integration test for task flow in api/tests/integration/
- [ ] T112 [P] Integration test for payment flow in api/tests/integration/
- [ ] T113 [P] Contract tests in api/tests/contract/

### Mobile Tests
- [ ] T114 [P] Unit tests for Redux slices in mobile/__tests__/unit/
- [ ] T115 [P] Component tests in mobile/__tests__/unit/components/
- [ ] T116 [P] E2E test for auth with Detox in mobile/__tests__/e2e/
- [ ] T117 [P] E2E test for task posting with Detox
- [ ] T118 [P] E2E test for payment with Detox

### Performance Tests
- [ ] T119 [P] Load test with 1,000 concurrent users
- [ ] T120 [P] Security audit with npm audit and Snyk
- [ ] T121 [P] Validate 80% code coverage
- [ ] T122 [P] Performance test AI matching (< 3s)
- [ ] T123 [P] Performance test payments (< 5s)

---

## Phase 11: Polish

- [ ] T124 [P] API documentation with Swagger
- [ ] T125 [P] Update quickstart.md
- [ ] T126 [P] Create deployment guide
- [ ] T127 [P] Add monitoring dashboards
- [ ] T128 [P] Security hardening
- [ ] T129 [P] Optimize database indexes
- [ ] T130 [P] Optimize mobile bundle size
- [ ] T131 [P] Add analytics tracking
- [ ] T132 Final constitution compliance check
- [ ] T133 Prepare demo data for pilot

---

## Dependencies & Execution Order

**Phase Dependencies**:
- Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phase 3-8) → Additional (Phase 9) → Testing (Phase 10) → Polish (Phase 11)

**User Story Dependencies**:
- US1 (Task Posting - P1) → Foundation only
- US2 (Payment - P1) → Depends on US1
- US3 (Rating - P2) → Depends on US2
- US5 (Fraud - P2) → Depends on US1, parallel with US3
- US4 (AI Optimization - P3) → Depends on US1, parallel with others
- US6 (Multi-Language - P3) → No dependencies, parallel

**Parallel Opportunities**:
- Setup: T003-T009 parallel
- Foundational: T012-T023 parallel
- US1 Backend: T024-T026, T029, T033 parallel
- US1 Mobile: T036-T037, T040-T041 parallel
- After US1+US2: US3, US4, US5, US6 can all run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2 only)
1. Phase 1: Setup (T001-T009)
2. Phase 2: Foundational (T010-T023) - CRITICAL BLOCKER
3. Phase 3: US1 (T024-T046)
4. Phase 4: US2 (T047-T059)
5. Validate and deploy pilot

### Incremental Delivery
1. MVP (US1+US2) → Deploy
2. Add US5 (Fraud) → Deploy
3. Add US3 (Rating) → Deploy
4. Add US4+US6 → Deploy

**Total Tasks**: 133
**Critical Path**: Setup → Foundational → US1 → US2
**MVP Scope**: Phases 1-4 (59 tasks)
