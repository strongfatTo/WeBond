-- Fixed Supabase Database Functions for WeBond
-- These functions work with localStorage-based authentication
-- Run this script in your Supabase SQL Editor

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS create_task(TEXT, TEXT, TEXT, TEXT, DECIMAL, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_tasks(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS accept_task(UUID);
DROP FUNCTION IF EXISTS get_my_tasks();

-- Function to create a task (fixed for localStorage auth)
CREATE OR REPLACE FUNCTION create_task(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_location TEXT,
  p_reward_amount DECIMAL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_raiser_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_task tasks%ROWTYPE;
  result JSON;
  user_id UUID;
BEGIN
  -- Use provided raiser_id or try to get from auth context
  user_id := COALESCE(p_raiser_id, auth.uid());
  
  -- If no user_id available, return error
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User authentication required');
  END IF;

  -- Insert the new task
  INSERT INTO tasks (
    raiser_id,
    title,
    description,
    category,
    location,
    reward_amount,
    preferred_completion_date,
    status,
    posted_at
  ) VALUES (
    user_id,
    p_title,
    p_description,
    p_category,
    p_location,
    p_reward_amount,
    p_deadline,
    'active',
    NOW()
  )
  RETURNING * INTO new_task;
  
  -- Return the created task with user info
  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', new_task.id,
      'title', new_task.title,
      'description', new_task.description,
      'category', new_task.category,
      'location', new_task.location,
      'reward_amount', new_task.reward_amount,
      'status', new_task.status,
      'created_at', new_task.created_at,
      'raiser', (
        SELECT json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'profile_photo_url', u.profile_photo_url
        )
        FROM users u
        WHERE u.id = new_task.raiser_id
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get tasks with filters (fixed - no auth required)
CREATE OR REPLACE FUNCTION get_tasks(
  p_status TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'success', true,
    'data', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'category', t.category,
            'location', t.location,
            'reward_amount', t.reward_amount,
            'status', t.status,
            'created_at', t.created_at,
            'raiser', json_build_object(
              'id', r.id,
              'first_name', r.first_name,
              'last_name', r.last_name,
              'profile_photo_url', r.profile_photo_url
            ),
            'solver', CASE 
              WHEN s.id IS NOT NULL THEN json_build_object(
                'id', s.id,
                'first_name', s.first_name,
                'last_name', s.last_name,
                'profile_photo_url', s.profile_photo_url
              )
              ELSE NULL
            END
          )
        )
        FROM tasks t
        LEFT JOIN users r ON t.raiser_id = r.id
        LEFT JOIN users s ON t.solver_id = s.id
        WHERE (p_status IS NULL OR t.status = p_status)
          AND (p_category IS NULL OR t.category = p_category)
          AND (p_location IS NULL OR t.location ILIKE '%' || p_location || '%')
        ORDER BY t.created_at DESC
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to accept a task (fixed for localStorage auth)
CREATE OR REPLACE FUNCTION accept_task(
  p_task_id UUID,
  p_solver_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_task tasks%ROWTYPE;
  result JSON;
  user_id UUID;
BEGIN
  -- Use provided solver_id or try to get from auth context
  user_id := COALESCE(p_solver_id, auth.uid());
  
  -- If no user_id available, return error
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User authentication required');
  END IF;

  -- Update the task
  UPDATE tasks 
  SET 
    solver_id = user_id,
    status = 'in_progress',
    accepted_at = NOW()
  WHERE id = p_task_id 
    AND status = 'active'
    AND raiser_id != user_id -- Can't accept your own task
  RETURNING * INTO updated_task;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Task not found or cannot be accepted');
  END IF;
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', updated_task.id,
      'status', updated_task.status,
      'accepted_at', updated_task.accepted_at
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get user's tasks (fixed for localStorage auth)
CREATE OR REPLACE FUNCTION get_my_tasks(
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  user_id UUID;
BEGIN
  -- Use provided user_id or try to get from auth context
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- If no user_id available, return empty result
  IF user_id IS NULL THEN
    RETURN json_build_object('success', true, 'data', '[]'::json);
  END IF;

  SELECT json_build_object(
    'success', true,
    'data', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'category', t.category,
            'location', t.location,
            'reward_amount', t.reward_amount,
            'status', t.status,
            'created_at', t.created_at,
            'raiser_id', t.raiser_id,
            'solver_id', t.solver_id,
            'raiser', json_build_object(
              'id', r.id,
              'first_name', r.first_name,
              'last_name', r.last_name,
              'profile_photo_url', r.profile_photo_url
            ),
            'solver', CASE 
              WHEN s.id IS NOT NULL THEN json_build_object(
                'id', s.id,
                'first_name', s.first_name,
                'last_name', s.last_name,
                'profile_photo_url', s.profile_photo_url
              )
              ELSE NULL
            END
          )
        )
        FROM tasks t
        LEFT JOIN users r ON t.raiser_id = r.id
        LEFT JOIN users s ON t.solver_id = s.id
        WHERE t.raiser_id = user_id OR t.solver_id = user_id
        ORDER BY t.created_at DESC
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_task TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION accept_task TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_tasks TO authenticated;

-- Also grant to anon users for basic functionality
GRANT EXECUTE ON FUNCTION get_tasks TO anon;
