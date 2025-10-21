# Data Model: WeBond Task Matching Platform

**Feature**: Task Matching Platform (MVP)  
**Date**: 2025-10-20  
**Database**: PostgreSQL 15 with Prisma ORM

## Overview

This document defines the database schema and entity relationships for the WeBond MVP. All entities are designed to support constitution requirements (trust & safety, transparency, scalability).

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│    User     │────────▶│     Task     │────────▶│ Transaction  │
│             │  raises │              │ creates │              │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                         │
      │                        │                         │
      │ has many               │ has many                │ belongs to
      ▼                        ▼                         ▼
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│SolverProfile│         │    Rating    │         │   Dispute    │
│             │         │              │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │
      │ receives               │ given to
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│MatchRecom   │         │ Notification │
│ mendation   │         │              │
└─────────────┘         └──────────────┘
```

---

## Core Entities

### 1. User

**Purpose**: Represents all platform users (both Task Raisers and Task Solvers)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| passwordHash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| phoneNumber | VARCHAR(20) | UNIQUE | Phone number (for SMS notifications) |
| role | ENUM | NOT NULL | 'raiser', 'solver', 'both' |
| firstName | VARCHAR(100) | NOT NULL | User's first name |
| lastName | VARCHAR(100) | NOT NULL | User's last name |
| profilePhotoUrl | TEXT | NULLABLE | S3 URL to profile image |
| preferredLanguage | ENUM | DEFAULT 'en' | 'en', 'zh-HK', 'zh-CN' |
| location | VARCHAR(100) | NULLABLE | Hong Kong district (e.g., "Kowloon") |
| latitude | DECIMAL(9,6) | NULLABLE | For proximity matching |
| longitude | DECIMAL(9,6) | NULLABLE | For proximity matching |
| bio | TEXT | NULLABLE | User self-description |
| languagesSpoken | JSONB | DEFAULT '[]' | Array of language codes |
| verificationStatus | ENUM | DEFAULT 'unverified' | 'unverified', 'pending', 'verified', 'rejected' |
| accountStatus | ENUM | DEFAULT 'active' | 'active', 'suspended', 'banned' |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last profile update |
| lastLoginAt | TIMESTAMP | NULLABLE | Last successful login |

**Indexes**:
- `idx_user_email` on (email)
- `idx_user_role` on (role)
- `idx_user_location` on (latitude, longitude) - for proximity search
- `idx_user_verification` on (verificationStatus, role)

**Validation Rules**:
- Email must match regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Phone must be Hong Kong format: `^(\+852)?[0-9]{8}$`
- Password minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number

---

### 2. SolverProfile

**Purpose**: Extended profile for users who act as Task Solvers (locals helping non-locals)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Profile identifier |
| userId | UUID | FOREIGN KEY (User.id), UNIQUE | Links to User table |
| verificationDocumentUrl | TEXT | NULLABLE | S3 URL to ID document |
| selfieUrl | TEXT | NULLABLE | S3 URL to selfie (for KYC) |
| kycStatus | ENUM | DEFAULT 'not_submitted' | 'not_submitted', 'submitted', 'approved', 'rejected' |
| kycRejectionReason | TEXT | NULLABLE | Reason for KYC rejection |
| completedTaskCount | INTEGER | DEFAULT 0 | Number of completed tasks |
| averageRating | DECIMAL(3,2) | DEFAULT 0.0 | Aggregate rating (0.0 - 5.0) |
| totalRatingsReceived | INTEGER | DEFAULT 0 | Number of ratings received |
| tierLevel | ENUM | DEFAULT 'bronze' | 'bronze', 'silver', 'gold' |
| commissionRate | DECIMAL(4,2) | DEFAULT 30.00 | Current commission % |
| totalEarnings | DECIMAL(10,2) | DEFAULT 0.00 | Lifetime earnings (HKD) |
| specializationTags | JSONB | DEFAULT '[]' | ['visa_help', 'translation', 'shopping'] |
| availabilityHours | JSONB | NULLABLE | {"mon": "9-17", "tue": "9-17"} |
| lastActiveAt | TIMESTAMP | DEFAULT NOW() | Last time solver was online |
| createdAt | TIMESTAMP | DEFAULT NOW() | Profile creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last profile update |

**Indexes**:
- `idx_solver_user` on (userId)
- `idx_solver_kyc` on (kycStatus)
- `idx_solver_tier` on (tierLevel)
- `idx_solver_rating` on (averageRating DESC)

**Business Logic**:
- **Tier Promotion**:
  - Bronze: 0-10 completed tasks, 30% commission
  - Silver: 11-50 completed tasks, 20% commission
  - Gold: 50+ completed tasks, 10% commission
- **Auto-update** on task completion: increment completedTaskCount, recalculate averageRating, check tier promotion

---

### 3. Task

**Purpose**: Represents a help request posted by a Task Raiser

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Task identifier |
| raiserId | UUID | FOREIGN KEY (User.id), NOT NULL | User who posted task |
| solverId | UUID | FOREIGN KEY (User.id), NULLABLE | User who accepted task |
| title | VARCHAR(200) | NOT NULL | Short task title |
| description | TEXT | NOT NULL | Detailed task description |
| category | ENUM | NOT NULL | 'translation', 'visa_help', 'navigation', 'shopping', 'admin_help', 'other' |
| location | VARCHAR(200) | NOT NULL | Task location description |
| latitude | DECIMAL(9,6) | NULLABLE | Task location coordinates |
| longitude | DECIMAL(9,6) | NULLABLE | Task location coordinates |
| rewardAmount | DECIMAL(8,2) | NOT NULL | Payment in HKD |
| preferredLanguage | VARCHAR(10) | NULLABLE | Preferred solver language |
| preferredCompletionDate | TIMESTAMP | NULLABLE | When task should be done |
| status | ENUM | DEFAULT 'draft' | 'draft', 'active', 'in_progress', 'completed', 'cancelled', 'disputed' |
| flaggedContent | BOOLEAN | DEFAULT FALSE | Auto-flagged by content filter |
| flagReason | TEXT | NULLABLE | Reason for content flag |
| postedAt | TIMESTAMP | NULLABLE | When task went live |
| acceptedAt | TIMESTAMP | NULLABLE | When solver accepted |
| completedAt | TIMESTAMP | NULLABLE | When marked complete |
| createdAt | TIMESTAMP | DEFAULT NOW() | Task creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last task update |

**Indexes**:
- `idx_task_raiser` on (raiserId)
- `idx_task_solver` on (solverId)
- `idx_task_status` on (status)
- `idx_task_category` on (category)
- `idx_task_location` on (latitude, longitude)
- `idx_task_posted` on (postedAt DESC)
- Composite: `idx_task_active_location` on (status, latitude, longitude) - for browsing available tasks by location

**Validation Rules**:
- Reward amount: minimum HKD 50, maximum HKD 5000
- Description: minimum 20 characters, maximum 2000 characters
- Title: minimum 5 characters, maximum 200 characters

**State Transitions**:
```
draft → active → in_progress → completed
                      ↓
                  disputed → completed/cancelled
                      ↓
                  cancelled
```

---

### 4. Transaction

**Purpose**: Tracks payment flow through escrow system

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction identifier |
| taskId | UUID | FOREIGN KEY (Task.id), NOT NULL | Associated task |
| payerId | UUID | FOREIGN KEY (User.id), NOT NULL | Task raiser (payer) |
| payeeId | UUID | FOREIGN KEY (User.id), NOT NULL | Task solver (payee) |
| grossAmount | DECIMAL(8,2) | NOT NULL | Total payment (HKD) |
| platformCommissionRate | DECIMAL(4,2) | NOT NULL | Commission % at time of transaction |
| platformCommissionAmount | DECIMAL(8,2) | NOT NULL | Platform fee (HKD) |
| netAmountToSolver | DECIMAL(8,2) | NOT NULL | Solver receives (HKD) |
| paymentProviderReference | VARCHAR(255) | NULLABLE | FPS/PayMe transaction ID |
| status | ENUM | DEFAULT 'pending' | 'pending', 'escrowed', 'released', 'refunded', 'failed' |
| escrowedAt | TIMESTAMP | NULLABLE | When funds moved to escrow |
| releasedAt | TIMESTAMP | NULLABLE | When funds released to solver |
| refundedAt | TIMESTAMP | NULLABLE | When funds refunded to raiser |
| createdAt | TIMESTAMP | DEFAULT NOW() | Transaction creation |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last status update |

**Indexes**:
- `idx_transaction_task` on (taskId)
- `idx_transaction_payer` on (payerId)
- `idx_transaction_payee` on (payeeId)
- `idx_transaction_status` on (status)

**Calculation Logic**:
```
netAmountToSolver = grossAmount × (1 - platformCommissionRate/100)
platformCommissionAmount = grossAmount - netAmountToSolver
```

**Audit Requirements**:
- All status changes logged
- Immutable once status = 'released' or 'refunded'
- Retain for 7 years per PDPO compliance

---

### 5. Rating

**Purpose**: Stores mutual ratings between task raisers and solvers

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Rating identifier |
| taskId | UUID | FOREIGN KEY (Task.id), NOT NULL | Associated task |
| raterId | UUID | FOREIGN KEY (User.id), NOT NULL | User giving rating |
| ratedUserId | UUID | FOREIGN KEY (User.id), NOT NULL | User receiving rating |
| starRating | INTEGER | NOT NULL, CHECK (1-5) | 1 to 5 stars |
| comment | TEXT | NULLABLE | Optional text feedback |
| helpfulVotes | INTEGER | DEFAULT 0 | How many found review helpful |
| flaggedInappropriate | BOOLEAN | DEFAULT FALSE | Admin flagged for review |
| createdAt | TIMESTAMP | DEFAULT NOW() | Rating timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update (if edited) |

**Indexes**:
- `idx_rating_task` on (taskId)
- `idx_rating_rater` on (raterId)
- `idx_rating_rated_user` on (ratedUserId)
- Composite: `idx_rating_unique` UNIQUE on (taskId, raterId) - prevent duplicate ratings

**Validation Rules**:
- Each user can only rate once per task
- Rating only allowed after task status = 'completed'
- Comment maximum 500 characters

**Aggregation Trigger**:
- On INSERT: recalculate SolverProfile.averageRating and totalRatingsReceived
- Formula: `new_avg = (old_avg × old_count + new_rating) / (old_count + 1)`

---

### 6. MatchRecommendation

**Purpose**: Stores AI-generated solver recommendations for tasks

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Recommendation identifier |
| taskId | UUID | FOREIGN KEY (Task.id), NOT NULL | Task being matched |
| solverId | UUID | FOREIGN KEY (User.id), NOT NULL | Recommended solver |
| matchScore | DECIMAL(5,2) | NOT NULL | Overall score (0-100) |
| proximityScore | DECIMAL(5,2) | NOT NULL | Distance-based score (0-100) |
| ratingScore | DECIMAL(5,2) | NOT NULL | Rating-based score (0-100) |
| experienceScore | DECIMAL(5,2) | NOT NULL | Relevant task history score (0-100) |
| languageScore | DECIMAL(5,2) | NOT NULL | Language match score (0-100) |
| explanation | TEXT | NOT NULL | Human-readable explanation |
| displayedRank | INTEGER | NOT NULL | Position in recommendation list |
| aiConfidence | DECIMAL(4,2) | NOT NULL | AI confidence level (0-100) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Recommendation timestamp |
| expiresAt | TIMESTAMP | NOT NULL | Cache expiration (5 minutes) |

**Indexes**:
- `idx_match_task` on (taskId)
- `idx_match_solver` on (solverId)
- Composite: `idx_match_task_rank` on (taskId, displayedRank)
- `idx_match_expires` on (expiresAt) - for cleanup job

**Calculation Logic**:
```
matchScore = (proximityScore × 0.30) + 
             (ratingScore × 0.30) + 
             (experienceScore × 0.25) + 
             (languageScore × 0.15)
```

**Cleanup**:
- Delete recommendations older than 5 minutes (expiresAt < NOW())
- Run cleanup job every 10 minutes via cron

---

### 7. Dispute

**Purpose**: Tracks payment disputes between users

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Dispute identifier |
| taskId | UUID | FOREIGN KEY (Task.id), NOT NULL | Disputed task |
| raisedByUserId | UUID | FOREIGN KEY (User.id), NOT NULL | Who raised dispute |
| disputeReason | TEXT | NOT NULL | Why dispute was raised |
| raiserEvidence | JSONB | NULLABLE | {"text": "...", "photoUrls": [...]} |
| solverEvidence | JSONB | NULLABLE | {"text": "...", "photoUrls": [...]} |
| status | ENUM | DEFAULT 'open' | 'open', 'under_review', 'resolved' |
| resolutionOutcome | ENUM | NULLABLE | 'favor_raiser', 'favor_solver', 'split', 'other' |
| resolutionNotes | TEXT | NULLABLE | Admin decision explanation |
| resolvedByAdminId | UUID | FOREIGN KEY (User.id), NULLABLE | Admin who resolved |
| createdAt | TIMESTAMP | DEFAULT NOW() | Dispute creation |
| resolvedAt | TIMESTAMP | NULLABLE | Resolution timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes**:
- `idx_dispute_task` on (taskId)
- `idx_dispute_status` on (status)
- `idx_dispute_raised_by` on (raisedByUserId)

**Business Rules**:
- Dispute can only be raised within 48 hours of task completion
- Funds remain in escrow until status = 'resolved'
- Resolution must happen within 5 business days (SLA)

---

### 8. Notification

**Purpose**: Tracks notifications sent to users

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification identifier |
| recipientId | UUID | FOREIGN KEY (User.id), NOT NULL | User receiving notification |
| notificationType | ENUM | NOT NULL | 'task_request', 'task_accepted', 'payment_received', 'rating_received', 'account_status', 'dispute_update' |
| title | VARCHAR(200) | NOT NULL | Notification title |
| messageContent | TEXT | NOT NULL | Notification body |
| deliveryMethod | ENUM | NOT NULL | 'in_app', 'email', 'sms', 'push' |
| readStatus | BOOLEAN | DEFAULT FALSE | Whether user has read notification |
| sentAt | TIMESTAMP | DEFAULT NOW() | When notification sent |
| readAt | TIMESTAMP | NULLABLE | When user read notification |
| relatedEntityType | VARCHAR(50) | NULLABLE | 'task', 'transaction', 'rating' |
| relatedEntityId | UUID | NULLABLE | ID of related entity |

**Indexes**:
- `idx_notification_recipient` on (recipientId)
- `idx_notification_read` on (readStatus)
- `idx_notification_sent` on (sentAt DESC)
- Composite: `idx_notification_unread` on (recipientId, readStatus) WHERE readStatus = FALSE

**Retention Policy**:
- Delete notifications older than 90 days
- Keep dispute-related notifications for 7 years (compliance)

---

## Prisma Schema (TypeScript ORM)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  raiser
  solver
  both
}

enum VerificationStatus {
  unverified
  pending
  verified
  rejected
}

enum AccountStatus {
  active
  suspended
  banned
}

model User {
  id                   String              @id @default(uuid())
  email                String              @unique
  passwordHash         String
  phoneNumber          String?             @unique
  role                 UserRole
  firstName            String
  lastName             String
  profilePhotoUrl      String?
  preferredLanguage    String              @default("en")
  location             String?
  latitude             Decimal?
  longitude            Decimal?
  bio                  String?
  languagesSpoken      Json                @default("[]")
  verificationStatus   VerificationStatus  @default(unverified)
  accountStatus        AccountStatus       @default(active)
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  lastLoginAt          DateTime?

  solverProfile        SolverProfile?
  tasksRaised          Task[]              @relation("TaskRaiser")
  tasksSolved          Task[]              @relation("TaskSolver")
  transactionsPaid     Transaction[]       @relation("Payer")
  transactionsReceived Transaction[]       @relation("Payee")
  ratingsGiven         Rating[]            @relation("Rater")
  ratingsReceived      Rating[]            @relation("RatedUser")
  notifications        Notification[]
  disputesRaised       Dispute[]           @relation("DisputeRaiser")
  disputesResolved     Dispute[]           @relation("DisputeResolver")

  @@index([email])
  @@index([role])
  @@index([latitude, longitude])
  @@index([verificationStatus, role])
}

// Additional models follow similar pattern...
```

---

## Data Migration Strategy

### Phase 1 (MVP Launch):
1. Initial schema migration with all core tables
2. Seed data: sample task categories, tier definitions
3. Create admin user for dispute resolution

### Phase 2 (Scaling):
1. Add indexes based on slow query analysis
2. Consider partitioning (Transaction table by month)
3. Implement read replicas for task browsing queries

---

## Data Retention Policy (PDPO Compliance)

| Entity | Retention Period | Notes |
|--------|-----------------|-------|
| User | 7 years after account deletion | PDPO requirement |
| Task | 7 years | Audit trail |
| Transaction | 7 years | Financial records |
| Rating | Indefinite (anonymize after user deletion) | Public reviews |
| Dispute | 7 years | Legal compliance |
| Notification | 90 days | Storage optimization |
| MatchRecommendation | 5 minutes (cache) | Auto-cleanup |

---

**Data Model Status**: ✅ Complete - Ready for Prisma schema generation and database migration
