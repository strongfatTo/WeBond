-- Fix mawing473@gmail.com account
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'mawing473@gmail.com';

-- Step 2: If user exists but email not confirmed, confirm it
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'mawing473@gmail.com' 
  AND email_confirmed_at IS NULL;

-- Step 3: Check if profile exists in public.users table
SELECT id, email, first_name, last_name, role, created_at 
FROM public.users 
WHERE email = 'mawing473@gmail.com';

-- Step 4: If profile doesn't exist, create it
-- First, get the auth user ID
DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'mawing473@gmail.com';
    
    -- Insert profile if it doesn't exist
    INSERT INTO public.users (id, email, first_name, last_name, role, created_at)
    VALUES (
        auth_user_id,
        'mawing473@gmail.com',
        'Ma',
        'Wing',
        'raiser',
        NOW()
    )
    ON CONFLICT (email) DO UPDATE 
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;
END $$;

-- Step 5: Verify everything is set up correctly
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.first_name,
    p.last_name,
    p.role
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'mawing473@gmail.com';
