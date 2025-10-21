-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('raiser', 'solver', 'both');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('not_submitted', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TierLevel" AS ENUM ('bronze', 'silver', 'gold');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('translation', 'visa_help', 'navigation', 'shopping', 'admin_help', 'other');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('draft', 'active', 'in_progress', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'escrowed', 'released', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'resolved');

-- CreateEnum
CREATE TYPE "ResolutionOutcome" AS ENUM ('favor_raiser', 'favor_solver', 'split', 'other');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('task_request', 'task_accepted', 'payment_received', 'task_completed', 'rating_received', 'account_status', 'dispute_update');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('in_app', 'email', 'sms', 'push');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "location" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "bio" TEXT,
    "languagesSpoken" JSONB NOT NULL DEFAULT '[]',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solver_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verificationDocumentUrl" TEXT,
    "selfieUrl" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'not_submitted',
    "kycRejectionReason" TEXT,
    "completedTaskCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "totalRatingsReceived" INTEGER NOT NULL DEFAULT 0,
    "tierLevel" "TierLevel" NOT NULL DEFAULT 'bronze',
    "commissionRate" DECIMAL(4,2) NOT NULL DEFAULT 30.00,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "specializationTags" JSONB NOT NULL DEFAULT '[]',
    "availabilityHours" JSONB,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solver_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "raiserId" TEXT NOT NULL,
    "solverId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "rewardAmount" DECIMAL(8,2) NOT NULL,
    "preferredLanguage" VARCHAR(10),
    "preferredCompletionDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'draft',
    "flaggedContent" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "postedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "payeeId" TEXT NOT NULL,
    "grossAmount" DECIMAL(8,2) NOT NULL,
    "platformCommissionRate" DECIMAL(4,2) NOT NULL,
    "platformCommissionAmount" DECIMAL(8,2) NOT NULL,
    "netAmountToSolver" DECIMAL(8,2) NOT NULL,
    "paymentProviderReference" VARCHAR(255),
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "escrowedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "starRating" SMALLINT NOT NULL,
    "comment" TEXT,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "flaggedInappropriate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_recommendations" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "solverId" TEXT NOT NULL,
    "matchScore" DECIMAL(5,2) NOT NULL,
    "proximityScore" DECIMAL(5,2) NOT NULL,
    "ratingScore" DECIMAL(5,2) NOT NULL,
    "experienceScore" DECIMAL(5,2) NOT NULL,
    "languageScore" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT NOT NULL,
    "displayedRank" INTEGER NOT NULL,
    "aiConfidence" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "raisedByUserId" TEXT NOT NULL,
    "disputeReason" TEXT NOT NULL,
    "raiserEvidence" JSONB,
    "solverEvidence" JSONB,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "resolutionOutcome" "ResolutionOutcome",
    "resolutionNotes" TEXT,
    "resolvedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "messageContent" TEXT NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "readStatus" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_latitude_longitude_idx" ON "users"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "users_verificationStatus_role_idx" ON "users"("verificationStatus", "role");

-- CreateIndex
CREATE UNIQUE INDEX "solver_profiles_userId_key" ON "solver_profiles"("userId");

-- CreateIndex
CREATE INDEX "solver_profiles_userId_idx" ON "solver_profiles"("userId");

-- CreateIndex
CREATE INDEX "solver_profiles_kycStatus_idx" ON "solver_profiles"("kycStatus");

-- CreateIndex
CREATE INDEX "solver_profiles_tierLevel_idx" ON "solver_profiles"("tierLevel");

-- CreateIndex
CREATE INDEX "solver_profiles_averageRating_idx" ON "solver_profiles"("averageRating" DESC);

-- CreateIndex
CREATE INDEX "tasks_raiserId_idx" ON "tasks"("raiserId");

-- CreateIndex
CREATE INDEX "tasks_solverId_idx" ON "tasks"("solverId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_category_idx" ON "tasks"("category");

-- CreateIndex
CREATE INDEX "tasks_latitude_longitude_idx" ON "tasks"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "tasks_postedAt_idx" ON "tasks"("postedAt" DESC);

-- CreateIndex
CREATE INDEX "tasks_status_latitude_longitude_idx" ON "tasks"("status", "latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_taskId_key" ON "transactions"("taskId");

-- CreateIndex
CREATE INDEX "transactions_taskId_idx" ON "transactions"("taskId");

-- CreateIndex
CREATE INDEX "transactions_payerId_idx" ON "transactions"("payerId");

-- CreateIndex
CREATE INDEX "transactions_payeeId_idx" ON "transactions"("payeeId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "ratings_taskId_idx" ON "ratings"("taskId");

-- CreateIndex
CREATE INDEX "ratings_raterId_idx" ON "ratings"("raterId");

-- CreateIndex
CREATE INDEX "ratings_ratedUserId_idx" ON "ratings"("ratedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_taskId_raterId_key" ON "ratings"("taskId", "raterId");

-- CreateIndex
CREATE INDEX "match_recommendations_taskId_idx" ON "match_recommendations"("taskId");

-- CreateIndex
CREATE INDEX "match_recommendations_solverId_idx" ON "match_recommendations"("solverId");

-- CreateIndex
CREATE INDEX "match_recommendations_taskId_displayedRank_idx" ON "match_recommendations"("taskId", "displayedRank");

-- CreateIndex
CREATE INDEX "match_recommendations_expiresAt_idx" ON "match_recommendations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_taskId_key" ON "disputes"("taskId");

-- CreateIndex
CREATE INDEX "disputes_taskId_idx" ON "disputes"("taskId");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_raisedByUserId_idx" ON "disputes"("raisedByUserId");

-- CreateIndex
CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");

-- CreateIndex
CREATE INDEX "notifications_readStatus_idx" ON "notifications"("readStatus");

-- CreateIndex
CREATE INDEX "notifications_sentAt_idx" ON "notifications"("sentAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipientId_readStatus_idx" ON "notifications"("recipientId", "readStatus");

-- AddForeignKey
ALTER TABLE "solver_profiles" ADD CONSTRAINT "solver_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_raiserId_fkey" FOREIGN KEY ("raiserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_solverId_fkey" FOREIGN KEY ("solverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_recommendations" ADD CONSTRAINT "match_recommendations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_recommendations" ADD CONSTRAINT "match_recommendations_solverId_fkey" FOREIGN KEY ("solverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raisedByUserId_fkey" FOREIGN KEY ("raisedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
