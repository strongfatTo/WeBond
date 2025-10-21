# Feature Specification: WeBond Task Matching Platform (MVP)

**Feature Branch**: `001-task-matching-platform`  
**Created**: 2025-10-20  
**Status**: Draft  
**Input**: Task matching platform connecting non-local residents with local helpers through AI-driven matching, escrow payments, and rating system

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task Posting and Discovery (Priority: P1)

A non-local student (Task Raiser) needs help navigating Hong Kong's Immigration Office to renew their visa. They post a task describing their need, set a reward price of HKD 200, and browse through AI-recommended local helpers. They select a highly-rated helper who speaks their language and has helped with visa tasks before.

**Why this priority**: This is the core value proposition - connecting non-locals who need help with locals who can provide it. Without this, the platform has no purpose. This story validates the entire task lifecycle from creation to matching.

**Independent Test**: Can be fully tested by creating a task raiser account, posting a task with description and reward, viewing AI-recommended solvers, and selecting one. Delivers immediate value by establishing the basic marketplace.

**Acceptance Scenarios**:

1. **Given** a non-local user is logged in, **When** they create a new task with description "Help me renew my visa at Immigration Office" and reward HKD 200, **Then** the task is saved and visible in their task list
2. **Given** a task has been posted, **When** the system processes it, **Then** AI recommends 3-5 suitable local solvers based on location, ratings, and relevant experience
3. **Given** AI recommendations are displayed, **When** the task raiser views a solver's profile, **Then** they see rating, past completed tasks, languages spoken, and distance from task location
4. **Given** the task raiser selects a solver, **When** they confirm the selection, **Then** the solver receives a task request notification
5. **Given** a solver receives a task request, **When** they accept it, **Then** both parties are notified and task status changes to "In Progress"

---

### User Story 2 - Secure Payment and Escrow (Priority: P1)

After the task raiser selects a solver and the solver accepts, the task raiser pays HKD 200 upfront. The payment is held in escrow. Once the visa renewal assistance is completed successfully, the task raiser confirms completion. The platform releases HKD 180 to the solver (Bronze tier, 30% commission = HKD 60 to platform, but solver gets 90% of net = HKD 180 based on 20% commission) and both parties can rate each other.

**Why this priority**: Trust and safety are non-negotiable (Constitution Principle I). Without secure escrow payments, vulnerable non-locals won't use the platform. This validates the financial transaction flow and fraud prevention.

**Independent Test**: Can be fully tested by completing a full payment cycle - task raiser pays, funds held in escrow, task marked complete, funds released to solver. Delivers core safety mechanism.

**Acceptance Scenarios**:

1. **Given** a task raiser has selected a solver, **When** they proceed to payment, **Then** they see a clear breakdown: Task Price HKD 200, Platform Fee (Bronze: 30%), Solver receives HKD 140
2. **Given** payment information is entered, **When** task raiser confirms payment, **Then** funds are deducted from their account and held in escrow, not immediately transferred to solver
3. **Given** funds are in escrow, **When** the task raiser marks the task as complete, **Then** funds are released to the solver's account within 5 seconds
4. **Given** task is complete, **When** either party attempts to modify payment amount, **Then** the system prevents changes and logs the attempt
5. **Given** there is a payment dispute, **When** either party raises a dispute within 48 hours, **Then** funds remain in escrow and both parties are contacted for resolution

---

### User Story 3 - Mutual Rating and Reputation Building (Priority: P2)

After the visa assistance task is completed, both the task raiser and solver rate each other. The task raiser rates the solver 5 stars for being helpful and patient. The solver rates the task raiser 5 stars for clear communication. The solver's rating increases to 4.8/5.0 and their completed task count increases to 11, automatically promoting them from Bronze (30% commission) to Silver tier (20% commission).

**Why this priority**: Reputation systems build trust and incentivize good behavior. This enables the platform to self-regulate quality and reward reliable helpers. Lower priority than P1 because basic matching and payment must work first.

**Independent Test**: Can be fully tested by completing a task, submitting mutual ratings, and verifying rating aggregation and tier promotion. Delivers the gamification and quality control mechanism.

**Acceptance Scenarios**:

1. **Given** a task is marked complete, **When** task raiser submits a 5-star rating with comment "Very helpful!", **Then** the rating is recorded and the solver's average rating is updated
2. **Given** both parties have submitted ratings, **When** ratings are processed, **Then** both parties can view each other's ratings and comments
3. **Given** a solver completes their 11th task, **When** their task count is updated, **Then** their tier automatically upgrades from Bronze (30% fee) to Silver (20% fee) and they receive a notification
4. **Given** a solver has a rating below 3.0 stars, **When** the system reviews their profile, **Then** they receive a warning and guidance on improving service quality
5. **Given** ratings are public, **When** a new task raiser searches for solvers, **Then** they can filter and sort by rating, completion count, and tier level

---

### User Story 4 - AI Matching Optimization (Priority: P3)

The AI matching system learns from successful task completions. When a Mainland Chinese student posts a task in Mandarin requiring translation help at a government office in Kowloon, the system prioritizes solvers who: (1) are located in Kowloon, (2) speak Mandarin fluently, (3) have completed translation tasks before, and (4) have high ratings from other Mainland students. The system shows why each solver was recommended (e.g., "Nearby + Speaks Mandarin + 98% task success rate").

**Why this priority**: AI optimization improves user experience but isn't essential for MVP launch. Basic matching (location + rating) works initially; sophisticated ML-based matching can be refined post-launch based on real usage patterns.

**Independent Test**: Can be fully tested by posting tasks with specific requirements (language, location, task type) and verifying that recommended solvers match those criteria with explanations shown. Delivers enhanced matching quality.

**Acceptance Scenarios**:

1. **Given** a task is posted in Mandarin requiring translation help in Kowloon, **When** AI generates recommendations, **Then** solvers who speak Mandarin and are in Kowloon appear at the top of the list
2. **Given** AI recommendations are displayed, **When** task raiser views each solver, **Then** they see an explanation like "Recommended because: Nearby (2.3 km) + Speaks Mandarin + 5★ rating + 15 translation tasks completed"
3. **Given** a solver has completed 10 visa tasks successfully, **When** a new visa task is posted, **Then** this solver receives higher priority in recommendations compared to solvers without visa experience
4. **Given** multiple matching factors exist, **When** AI ranks solvers, **Then** proximity is weighted 30%, rating 30%, task type experience 25%, language match 15%
5. **Given** AI confidence is below 60%, **When** generating recommendations, **Then** system includes a broader range of solvers and allows manual search

---

### User Story 5 - Fraud Prevention and Safety Verification (Priority: P2)

Before a new solver can accept tasks, they must complete identity verification by uploading a Hong Kong ID card or passport, and a selfie. The system performs basic KYC checks. Once verified (badge displayed on profile), they can accept tasks. If suspicious activity is detected (e.g., same device creating multiple accounts, unusual payment patterns), the account is automatically flagged for review.

**Why this priority**: Critical for user safety (Constitution Principle I) but can be partially automated initially. Full verification flow must be ready before public launch to prevent fraud, but simpler version can work for pilot with students.

**Independent Test**: Can be fully tested by creating a solver account, going through verification flow, getting approved/rejected, and testing fraud detection rules. Delivers safety and compliance mechanism.

**Acceptance Scenarios**:

1. **Given** a new user registers as a task solver, **When** they attempt to browse tasks, **Then** they are prompted to complete identity verification first
2. **Given** a solver uploads ID and selfie, **When** KYC verification is processed, **Then** they receive approval within 24 hours and a "Verified" badge appears on their profile
3. **Given** verification is rejected (e.g., blurry photo, mismatched info), **When** solver checks status, **Then** they see specific reasons for rejection and can resubmit
4. **Given** the same device/IP creates 3 accounts in one day, **When** the fraud detection system scans activity, **Then** all accounts are flagged and suspended pending manual review
5. **Given** a solver receives 3 reports of suspicious behavior, **When** the system reviews their account, **Then** their account is temporarily suspended and they're notified within 48 hours

---

### User Story 6 - Multi-Language Platform Access (Priority: P3)

A French international student who speaks limited English and no Cantonese accesses WeBond. They switch the interface language to French. All navigation, task posting forms, and help documentation appear in French. When they post a task, they can specify "French-speaking helper preferred" and the AI prioritizes solvers who marked French as a language they speak.

**Why this priority**: Important for true social inclusion (Constitution Principle II) but not blocking for MVP. Can launch with English, Cantonese, and Mandarin initially, add more languages based on user demographics.

**Independent Test**: Can be fully tested by switching platform language, posting tasks in that language, and verifying solver matching respects language preferences. Delivers accessibility for diverse user base.

**Acceptance Scenarios**:

1. **Given** user opens WeBond app, **When** they select language from settings (English/Cantonese/Mandarin/French/etc.), **Then** entire interface updates to selected language
2. **Given** task raiser posts in French, **When** they add task details, **Then** AI suggests French-speaking solvers at top of recommendation list
3. **Given** platform supports multiple languages, **When** solver marks "I speak: English, Mandarin, French", **Then** they appear in results for task raisers filtering by any of those languages
4. **Given** automated notifications are sent, **When** user receives notification, **Then** it's in their selected language preference
5. **Given** help documentation is accessed, **When** user views FAQ or guides, **Then** content is available in all supported languages

---

### Edge Cases

- What happens when a task raiser pays but the solver never completes the task? (Escrow holds funds; after 7 days of no activity, task raiser can request refund; after 14 days, automatic refund)
- What happens when both parties dispute task completion? (Funds remain in escrow, dispute resolution team reviews evidence from both sides, decision within 5 business days)
- What happens when a solver's rating drops below 2.5 stars? (Account review triggered; after 3 consecutive low ratings, account temporarily suspended; must complete quality improvement before reactivation)
- What happens when payment provider is unavailable? (Task creation allowed but payment held pending; user notified of delay; retry payment automatically; timeout after 24 hours with notification)
- What happens when a task involves illegal activity? (Automated content filtering flags suspicious keywords; flagged tasks reviewed manually before going live; violating accounts permanently banned)
- What happens when a non-local leaves Hong Kong and wants to close their account? (Account closure allowed; any active tasks must be cancelled; funds in escrow returned; data retained for 7 years per audit requirements, then deleted)

## Requirements *(mandatory)*

### Functional Requirements

**User Management:**
- **FR-001**: System MUST support two distinct user roles: Task Raiser (primarily non-locals) and Task Solver (primarily locals), with single users able to have both roles
- **FR-002**: System MUST require identity verification for Task Solvers before they can accept tasks (ID upload, selfie, basic KYC check)
- **FR-003**: System MUST allow users to create profiles with: name, photo, languages spoken, location, bio, and contact preferences
- **FR-004**: System MUST display verification status on solver profiles with a visible "Verified" badge after approval
- **FR-005**: System MUST support account suspension, review, and permanent ban capabilities

**Task Management:**
- **FR-006**: Task Raisers MUST be able to create tasks with: title, detailed description, location, task category, reward amount (HKD), preferred completion date, and language preference
- **FR-007**: System MUST validate task descriptions to filter out prohibited content (violence, illegal activities, adult content, scams)
- **FR-008**: Task Raisers MUST be able to view their posted tasks with statuses: Draft, Active, In Progress, Completed, Cancelled, Disputed
- **FR-009**: Task Solvers MUST be able to browse available tasks and filter by: location, category, reward range, required languages, and posting date
- **FR-010**: System MUST prevent task raisers from modifying reward amount after a solver has accepted the task

**AI Matching:**
- **FR-011**: System MUST generate AI-based solver recommendations for each task considering: proximity (30%), rating (30%), relevant task experience (25%), language match (15%)
- **FR-012**: System MUST display 3-5 recommended solvers per task, ranked by match score
- **FR-013**: System MUST provide explanation for each recommendation (e.g., "Nearby + High rating + 10 similar tasks completed")
- **FR-014**: System MUST allow task raisers to override AI suggestions and manually search for solvers
- **FR-015**: System MUST include manual search fallback when AI matching confidence is below 60%

**Payment & Escrow:**
- **FR-016**: System MUST integrate with HKMA-licensed payment providers (FPS, PayMe, or equivalent) for all transactions
- **FR-017**: System MUST hold task payment in escrow from task acceptance until completion confirmation
- **FR-018**: System MUST display clear payment breakdown before transaction: Task Price, Platform Commission (Bronze 30%/Silver 20%/Gold 10%), Solver receives amount
- **FR-019**: System MUST release escrow funds to solver within 5 seconds of task completion confirmation
- **FR-020**: System MUST support dispute resolution: freeze funds, allow evidence submission, manual review by team
- **FR-021**: System MUST automatically refund task raiser after 14 days if task is not completed and no dispute is raised

**Rating & Reputation:**
- **FR-022**: System MUST require mutual ratings after task completion: both task raiser and solver rate each other (1-5 stars + optional comment)
- **FR-023**: System MUST calculate and display aggregate ratings: average star rating (to 1 decimal place) and total completed tasks
- **FR-024**: System MUST automatically promote solvers based on completed tasks: Bronze (0-10 tasks, 30% fee), Silver (11-50 tasks, 20% fee), Gold (50+ tasks, 10% fee)
- **FR-025**: System MUST flag accounts with average rating below 3.0 stars for quality review
- **FR-026**: System MUST make all ratings and reviews publicly visible on user profiles (with option to hide sensitive task details)

**Fraud Prevention & Security:**
- **FR-027**: System MUST detect and flag suspicious patterns: multiple accounts from same device/IP, unusual payment behavior, rapid account creation
- **FR-028**: System MUST automatically suspend accounts after receiving 3 user reports of scam/misconduct within 30 days
- **FR-029**: System MUST log all security events (login attempts, payment transactions, account changes) for audit purposes
- **FR-030**: System MUST encrypt all personal data at rest and in transit (minimum TLS 1.3 for data transmission)
- **FR-031**: System MUST comply with Hong Kong Personal Data Privacy Ordinance (PDPO) including user rights to access, correct, and delete their data

**Notifications:**
- **FR-032**: System MUST send real-time notifications for: task requests, task acceptance, payment received, task completion, ratings received, account status changes
- **FR-033**: System MUST support notification delivery via: in-app notifications, email, and SMS (user configurable)
- **FR-034**: System MUST send notifications in user's preferred language

**Multi-Language Support:**
- **FR-035**: System MUST support interface languages: English, Traditional Chinese (Cantonese), Simplified Chinese (Mandarin) at minimum for MVP
- **FR-036**: System MUST allow users to specify languages they speak in their profile
- **FR-037**: System MUST allow task raisers to specify preferred language for solver in task posting

### Key Entities

- **User**: Represents both Task Raisers and Task Solvers. Attributes include: user ID, role type (raiser/solver/both), name, email, phone, profile photo, languages spoken, location (district), verification status, account creation date, status (active/suspended/banned)

- **Task**: Represents a request for help posted by a Task Raiser. Attributes include: task ID, task raiser ID, title, description, category (translation, navigation, administrative help, shopping assistance, etc.), location, reward amount (HKD), preferred language, status (draft/active/in-progress/completed/cancelled/disputed), posted date, deadline, selected solver ID, acceptance date, completion date

- **Transaction**: Represents financial movement through the platform. Attributes include: transaction ID, task ID, payer ID (task raiser), payee ID (solver), amount, platform commission percentage, platform commission amount, solver net amount, status (pending/escrowed/released/refunded), payment provider reference, created date, released date

- **Rating**: Represents feedback given after task completion. Attributes include: rating ID, task ID, rater ID, rated user ID, star rating (1-5), comment text, created date, helpful votes count

- **Solver Profile**: Extends User entity for Task Solvers. Additional attributes include: completed task count, average rating, tier level (Bronze/Silver/Gold), current commission rate, total earnings, specialization tags (visa help, translation, shopping, etc.), verification documents, KYC status

- **Match Recommendation**: Represents AI-generated solver suggestions for a task. Attributes include: recommendation ID, task ID, solver ID, match score (0-100), explanation factors (proximity score, rating score, experience score, language score), displayed rank, timestamp

- **Dispute**: Represents disagreements between task raiser and solver. Attributes include: dispute ID, task ID, raised by ID, dispute reason, raiser evidence (text, photos), solver evidence (text, photos), status (open/under review/resolved), resolution outcome, resolved date, resolver admin ID

- **Notification**: Represents messages sent to users. Attributes include: notification ID, recipient user ID, notification type, message content, delivery method (in-app/email/SMS), read status, sent date

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Experience & Adoption:**
- **SC-001**: Task raisers can complete task posting flow (from login to task published) in under 3 minutes on average
- **SC-002**: 90% of posted tasks receive at least 3 AI-matched solver recommendations within 10 seconds
- **SC-003**: Task acceptance rate (tasks accepted by solvers) reaches 60% within first 30 days of pilot launch
- **SC-004**: 80% of users successfully complete their first task end-to-end (posting, matching, payment, completion) without contacting support

**Trust & Safety:**
- **SC-005**: Identity verification completion rate for new solvers reaches 85% (15% dropout acceptable)
- **SC-006**: Fraud detection system flags suspicious accounts with 95% accuracy (less than 5% false positives)
- **SC-007**: Payment dispute rate remains below 5% of total completed tasks
- **SC-008**: Average time to resolve disputes is under 3 business days

**Platform Performance:**
- **SC-009**: AI matching recommendations generated in under 3 seconds per task
- **SC-010**: Payment processing (escrow deposit and release) completes in under 5 seconds
- **SC-011**: Platform supports 1,000 concurrent users without performance degradation (load time < 2 seconds)
- **SC-012**: System uptime maintains 99.5% monthly average

**Business & Engagement:**
- **SC-013**: Average task completion rate (accepted tasks that get marked complete) reaches 85%
- **SC-014**: Solver retention rate: 70% of solvers who complete 1 task complete at least 2 more within 60 days
- **SC-015**: Platform GMV (Gross Merchandise Value - total task payments) grows 20% month-over-month during pilot phase
- **SC-016**: Average solver earns HKD 800-1200 per month (indicative of active participation)

**Social Impact:**
- **SC-017**: User satisfaction rating: 80% of task raisers rate their experience 4+ stars
- **SC-018**: Cross-cultural engagement: 70% of completed tasks involve users from different cultural backgrounds rating each other positively (4+ stars)
- **SC-019**: Repeat usage: 60% of task raisers post at least one additional task within 90 days

