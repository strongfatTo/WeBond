-- 診斷和修復 Browse Tasks 問題
-- Run this in Supabase SQL Editor step by step

-- ========================================
-- STEP 1: 檢查數據庫中是否有任務
-- ========================================
SELECT 
  id, 
  title, 
  description,
  category, 
  status, 
  reward_amount,
  location,
  raiser_id,
  created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- STEP 2: 檢查 RLS 政策
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks';

-- ========================================
-- STEP 3: 修復 get_tasks 函數
-- ========================================
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
  -- Use SECURITY DEFINER to bypass RLS
  SELECT json_build_object(
    'success', true,
    'data', COALESCE(
      (
        SELECT json_agg(task_data)
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
              'id', COALESCE(r.id, t.raiser_id),
              'first_name', COALESCE(r.first_name, 'Unknown'),
              'last_name', COALESCE(r.last_name, 'User'),
              'profile_photo_url', r.profile_photo_url
            ),
            'solver', CASE 
              WHEN t.solver_id IS NOT NULL AND s.id IS NOT NULL THEN json_build_object(
                'id', s.id,
                'first_name', s.first_name,
                'last_name', s.last_name,
                'profile_photo_url', s.profile_photo_url
              )
              ELSE NULL
            END
          ) as task_data
          FROM tasks t
          LEFT JOIN users r ON t.raiser_id = r.id
          LEFT JOIN users s ON t.solver_id = s.id
          WHERE (p_status IS NULL OR t.status = p_status)
            AND (p_category IS NULL OR t.category = p_category)
            AND (p_location IS NULL OR t.location ILIKE '%' || p_location || '%')
          ORDER BY t.created_at DESC
        ) as tasks_query
      ),
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ========================================
-- STEP 4: 授予權限
-- ========================================
GRANT EXECUTE ON FUNCTION get_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks TO anon;

-- ========================================
-- STEP 5: 測試函數
-- ========================================
SELECT get_tasks(NULL, NULL, NULL);

-- ========================================
-- STEP 6: 如果 RLS 太嚴格，暫時放寬政策（僅用於測試）
-- ========================================
-- 檢查當前的 SELECT 政策
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'tasks' AND cmd = 'SELECT';

-- 如果需要，創建一個允許所有人讀取 active 任務的政策
DROP POLICY IF EXISTS "Allow public to view active tasks" ON tasks;

CREATE POLICY "Allow public to view active tasks"
ON tasks
FOR SELECT
TO public
USING (status = 'active');

-- ========================================
-- STEP 7: 驗證修復
-- ========================================
-- 直接查詢應該能看到任務
SELECT id, title, status FROM tasks WHERE status = 'active';

-- 通過函數查詢應該也能看到
SELECT get_tasks('active', NULL, NULL);
