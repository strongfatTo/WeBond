-- Fix RLS policies to allow registration
-- Run this in your Supabase SQL Editor

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous user registration" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Task raisers can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Messages are viewable by task participants" ON messages;

-- Allow anonymous users to insert new users (for registration)
CREATE POLICY "Allow anonymous user registration"
    ON users FOR INSERT
    WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (true);

-- Allow anonymous users to read tasks
CREATE POLICY "Tasks are viewable by everyone"
    ON tasks FOR SELECT
    USING (true);

-- Allow authenticated users to create tasks
CREATE POLICY "Users can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (true);

-- Allow users to update their own tasks
CREATE POLICY "Task raisers can update own tasks"
    ON tasks FOR UPDATE
    USING (true);

-- Allow users to send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (true);

-- Allow users to read messages
CREATE POLICY "Messages are viewable by task participants"
    ON messages FOR SELECT
    USING (true);
