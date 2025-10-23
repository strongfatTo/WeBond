-- Fix Browse Tasks功能 - 修復 get_tasks 函數的 SQL 錯誤
-- Run this in Supabase SQL Editor

-- Drop and recreate get_tasks function with fixed SQL
DROP FUNCTION IF EXISTS get_tasks(TEXT, TEXT, TEXT);

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
        SELECT json_agg(task_row)
        FROM (
          SELECT json_build_object(
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
          ) as task_row
          FROM tasks t
          LEFT JOIN users r ON t.raiser_id = r.id
          LEFT JOIN users s ON t.solver_id = s.id
          WHERE (p_status IS NULL OR t.status = p_status)
            AND (p_category IS NULL OR t.category = p_category)
            AND (p_location IS NULL OR t.location ILIKE '%' || p_location || '%')
          ORDER BY t.created_at DESC
        ) as tasks_subquery
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks TO anon;

-- Test the function
SELECT get_tasks(NULL, NULL, NULL);

-- Check if there are any tasks in the database
SELECT 
  id, 
  title, 
  category, 
  status, 
  created_at,
  raiser_id
FROM tasks
ORDER BY created_at DESC
LIMIT 10;
