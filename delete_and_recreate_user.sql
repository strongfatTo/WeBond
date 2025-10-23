-- Delete and recreate mawing473@gmail.com account
-- Run this in Supabase SQL Editor

-- Step 1: Delete from public.users table first (due to foreign key)
DELETE FROM public.users WHERE email = 'mawing473@gmail.com';

-- Step 2: Delete from auth.users
DELETE FROM auth.users WHERE email = 'mawing473@gmail.com';

-- Step 3: Verify deletion
SELECT COUNT(*) as auth_count FROM auth.users WHERE email = 'mawing473@gmail.com';
SELECT COUNT(*) as profile_count FROM public.users WHERE email = 'mawing473@gmail.com';

-- After running this, go back to your app and register again with:
-- Email: mawing473@gmail.com
-- Password: Mawing2024!
-- First Name: Ma
-- Last Name: Wing
-- Role: Task Raiser (Need Help)
