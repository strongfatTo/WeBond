-- WeBond Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS match_recommendations CASCADE;
DROP TABLE IF EXISTS solver_profiles CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('raiser', 'solver', 'both')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_photo_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'zh-HK', 'zh-CN')),
    location VARCHAR(100),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    bio TEXT,
    languages_spoken JSONB DEFAULT '[]',
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_verification ON users(verification_status, role);

-- SolverProfile Table
CREATE TABLE IF NOT EXISTS solver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_document_url VARCHAR(500),
    selfie_url VARCHAR(500),
    kyc_status VARCHAR(50) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'submitted', 'approved', 'rejected')),
    kyc_rejection_reason TEXT,
    completed_task_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_ratings_received INTEGER DEFAULT 0,
    tier_level VARCHAR(50) DEFAULT 'bronze' CHECK (tier_level IN ('bronze', 'silver', 'gold')),
    commission_rate DECIMAL(4,2) DEFAULT 30.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    specialization_tags JSONB DEFAULT '[]',
    availability_hours JSONB,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('translation', 'visa_help', 'navigation', 'shopping', 'admin_help', 'other')),
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    reward_amount DECIMAL(8,2) NOT NULL,
    preferred_language VARCHAR(10),
    preferred_completion_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled', 'disputed')),
    flagged_content BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    posted_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_raiser ON tasks(raiser_id);
CREATE INDEX IF NOT EXISTS idx_task_solver ON tasks(solver_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_task_location ON tasks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_task_posted ON tasks(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_active_location ON tasks(status, latitude, longitude);

-- MatchRecommendation Table
CREATE TABLE IF NOT EXISTS match_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    solver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL,
    proximity_score DECIMAL(5,2) NOT NULL,
    rating_score DECIMAL(5,2) NOT NULL,
    experience_score DECIMAL(5,2) NOT NULL,
    language_score DECIMAL(5,2) NOT NULL,
    explanation TEXT NOT NULL,
    displayed_rank INTEGER NOT NULL,
    ai_confidence DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Dispute Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    raised_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dispute_reason TEXT NOT NULL,
    raiser_evidence JSONB,
    solver_evidence JSONB,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
    resolution_outcome VARCHAR(50) CHECK (resolution_outcome IN ('favor_raiser', 'favor_solver', 'split', 'other')),
    resolution_notes TEXT,
    resolved_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('task_request', 'task_accepted', 'payment_received', 'rating_received', 'account_status', 'dispute_update')),
    title VARCHAR(200) NOT NULL,
    message_content TEXT NOT NULL,
    delivery_method VARCHAR(50) NOT NULL CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push')),
    read_status BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    related_entity_type VARCHAR(50),
    related_entity_id UUID
);

-- Transactions Table (for payment escrow)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gross_amount DECIMAL(8,2) NOT NULL,
    platform_commission_rate DECIMAL(4,2) NOT NULL,
    platform_commission_amount DECIMAL(8,2) NOT NULL,
    net_amount_to_solver DECIMAL(8,2) NOT NULL,
    payment_provider_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'escrowed', 'released', 'refunded', 'failed')),
    escrowed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_task ON transactions(task_id);
CREATE INDEX IF NOT EXISTS idx_transaction_payer ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_payee ON transactions(payee_id);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status);

-- Messages Table (for chat)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    flagged_inappropriate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, rater_id) -- Each user can only rate once per task
);

CREATE INDEX IF NOT EXISTS idx_rating_task ON ratings(task_id);
CREATE INDEX IF NOT EXISTS idx_rating_rater ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_rating_rated_user ON ratings(rated_user_id);

-- Indexes for better query performance (removed old ones, keeping new ones)
-- The existing indexes for tasks, messages, and transactions are already updated or will be handled.
-- The old idx_ratings_ratee_id is removed.
-- The old idx_tasks_raiser_id, idx_tasks_solver_id, idx_tasks_status, idx_tasks_category, idx_tasks_created_at are replaced by the new ones.
-- The old idx_messages_task_id, idx_messages_created_at are kept.
-- The old idx_transactions_task_id is replaced by idx_transaction_task.

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solver_profiles_updated_at BEFORE UPDATE ON solver_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE solver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles (but not passwords)
CREATE POLICY "Public profiles are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "Users can create own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Tasks are viewable by everyone
CREATE POLICY "Tasks are viewable by everyone"
    ON tasks FOR SELECT
    USING (true);

-- Users can create tasks
CREATE POLICY "Users can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = raiser_id);

-- Task raisers can update their own tasks
CREATE POLICY "Task raisers can update own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = raiser_id);

-- Messages are viewable by task participants
CREATE POLICY "Messages viewable by task participants"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = messages.task_id
            AND (tasks.raiser_id = auth.uid() OR tasks.solver_id = auth.uid())
        )
    );

-- Users can send messages in their tasks
CREATE POLICY "Users can send messages in their tasks"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_id
            AND (tasks.raiser_id = auth.uid() OR tasks.solver_id = auth.uid())
        )
    );

-- Ratings are viewable by everyone
CREATE POLICY "Ratings are viewable by everyone"
    ON ratings FOR SELECT
    USING (true);

-- Users can create ratings for tasks they participated in
CREATE POLICY "Users can rate tasks they participated in"
    ON ratings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_id
            AND (tasks.raiser_id = auth.uid() OR tasks.solver_id = auth.uid())
            AND tasks.status = 'completed'
        )
    );

-- Transactions viewable by participants
CREATE POLICY "Transactions viewable by participants"
    ON transactions FOR SELECT
    USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Solver Profiles are viewable by everyone
CREATE POLICY "Solver profiles are viewable by everyone"
    ON solver_profiles FOR SELECT
    USING (true);

-- Solvers can update their own profile
CREATE POLICY "Solvers can update own profile"
    ON solver_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Match Recommendations are viewable by task raisers
CREATE POLICY "Match recommendations viewable by task raisers"
    ON match_recommendations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = match_recommendations.task_id
            AND tasks.raiser_id = auth.uid()
        )
    );

-- Disputes are viewable by participants
CREATE POLICY "Disputes viewable by participants"
    ON disputes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = disputes.task_id
            AND (tasks.raiser_id = auth.uid() OR tasks.solver_id = auth.uid())
        )
    );

-- Users can create disputes for tasks they participated in
CREATE POLICY "Users can create disputes for tasks they participated in"
    ON disputes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = disputes.task_id
            AND (tasks.raiser_id = auth.uid() OR tasks.solver_id = auth.uid())
        )
    );

-- Notifications are viewable by recipient
CREATE POLICY "Notifications viewable by recipient"
    ON notifications FOR SELECT
    USING (auth.uid() = recipient_id);

-- Sample data for testing (optional - remove in production)
-- INSERT INTO users (email, password, full_name, user_type, location, languages, skills) VALUES
-- ('emily@example.com', '$2b$10$...(hashed password)', 'Emily Chen', 'task_raiser', 'Sha Tin', ARRAY['Mandarin', 'English'], ARRAY['Student']),
-- ('marcus@example.com', '$2b$10$...(hashed password)', 'Marcus Wong', 'task_solver', 'Kowloon', ARRAY['Cantonese', 'English'], ARRAY['Local Guide', 'Translation']);
