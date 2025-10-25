-- Supabase Database Functions for WeBond
-- Run these in your Supabase SQL Editor

-- Drop function if it exists to avoid "function name not unique" error during redeployment
DROP FUNCTION IF EXISTS create_task(TEXT, TEXT, TEXT, TEXT, DECIMAL, TIMESTAMPTZ) CASCADE;

-- Function to create a task
CREATE OR REPLACE FUNCTION create_task(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_location TEXT,
  p_reward_amount DECIMAL,
  p_deadline TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_task tasks%ROWTYPE;
  result JSON;
BEGIN
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
    auth.uid(),
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

-- Function to get tasks with filters
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
          ) ORDER BY t.created_at DESC
        )
        FROM tasks t
        LEFT JOIN users r ON t.raiser_id = r.id
        LEFT JOIN users s ON t.solver_id = s.id
        WHERE (p_status IS NULL OR t.status = p_status)
          AND (p_category IS NULL OR t.category = p_category)
          AND (p_location IS NULL OR t.location ILIKE '%' || p_location || '%')
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to accept a task
CREATE OR REPLACE FUNCTION accept_task(p_task_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_task tasks%ROWTYPE;
  new_chat chats%ROWTYPE;
  result JSON;
BEGIN
  -- Update the task
  UPDATE tasks 
  SET 
    solver_id = auth.uid(),
    status = 'in_progress',
    accepted_at = NOW()
  WHERE id = p_task_id 
    AND status = 'active'
    AND raiser_id != auth.uid() -- Can't accept your own task
  RETURNING * INTO updated_task;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Task not found or cannot be accepted');
  END IF;
  
  -- Create a new chat room for the accepted task
  INSERT INTO chats (task_id, raiser_id, solver_id)
  VALUES (updated_task.id, updated_task.raiser_id, updated_task.solver_id)
  RETURNING * INTO new_chat;

  -- Return success with chat_id
  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'id', updated_task.id,
      'status', updated_task.status,
      'accepted_at', updated_task.accepted_at,
      'chat_id', new_chat.id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get user's tasks
CREATE OR REPLACE FUNCTION get_my_tasks()
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
        SELECT json_agg(task_data)
        FROM (
          SELECT
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
            ) AS task_data
          FROM tasks t
          LEFT JOIN users r ON t.raiser_id = r.id
          LEFT JOIN users s ON t.solver_id = s.id
          WHERE t.raiser_id = auth.uid() OR t.solver_id = auth.uid()
          ORDER BY t.created_at DESC
        ) AS ordered_tasks
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_task TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION accept_task TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_tasks TO authenticated;
