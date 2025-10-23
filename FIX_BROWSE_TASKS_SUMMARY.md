# 🔧 修復 Browse Tasks 問題 - 完整指南

## 問題描述
創建了任務但在 Browse Tasks 頁面看不到任務。

## 可能的原因
1. **Supabase `get_tasks` 函數有 SQL 錯誤** (GROUP BY 問題)
2. **RLS (Row Level Security) 政策太嚴格**
3. **任務沒有成功創建到數據庫**
4. **前端錯誤處理不足，沒有顯示錯誤訊息**

## 🎯 解決方案

### 步驟 1: 修復 Supabase 函數

在 **Supabase Dashboard** → **SQL Editor** 中執行：

```sql
-- 運行 diagnose_and_fix_tasks.sql 文件中的所有步驟
```

或者直接執行：

```sql
-- 1. 檢查是否有任務
SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 10;

-- 2. 重新創建 get_tasks 函數（修復 SQL 錯誤）
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

-- 3. 授予權限
GRANT EXECUTE ON FUNCTION get_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks TO anon;

-- 4. 測試
SELECT get_tasks(NULL, NULL, NULL);
```

### 步驟 2: 放寬 RLS 政策（如果需要）

```sql
-- 允許所有人查看 active 狀態的任務
DROP POLICY IF EXISTS "Allow public to view active tasks" ON tasks;

CREATE POLICY "Allow public to view active tasks"
ON tasks
FOR SELECT
TO public
USING (status = 'active');
```

### 步驟 3: 更新前端代碼

前端代碼已經更新，包含：
- ✅ 更好的錯誤處理
- ✅ 詳細的日誌輸出
- ✅ 空值檢查
- ✅ 用戶友好的錯誤訊息

### 步驟 4: 測試

1. **重新部署前端代碼**
   ```bash
   # 如果使用 Netlify
   git add .
   git commit -m "Fix browse tasks functionality"
   git push
   ```

2. **清除瀏覽器緩存**
   - 按 `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac)

3. **測試流程**
   - 登入應用
   - 創建一個新任務
   - 前往 Browse Tasks 頁面
   - 應該能看到剛創建的任務

4. **檢查控制台**
   - 打開瀏覽器開發者工具 (F12)
   - 查看 Console 標籤
   - 應該看到：
     ```
     Loading tasks with filters: {status: null, category: null}
     Tasks loaded: {success: true, data: [...]}
     Displaying X tasks
     ```

## 🐛 調試技巧

### 如果還是看不到任務：

1. **檢查任務是否創建成功**
   ```sql
   SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5;
   ```

2. **直接測試 get_tasks 函數**
   ```sql
   SELECT get_tasks(NULL, NULL, NULL);
   ```

3. **檢查瀏覽器控制台**
   - 是否有 JavaScript 錯誤？
   - 是否有網絡請求失敗？
   - `loadTasks()` 是否被調用？

4. **檢查 RLS 政策**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'tasks';
   ```

## 📝 已修改的文件

1. **app.js**
   - `loadTasks()` - 添加錯誤處理和日誌
   - `displayTasks()` - 添加空值檢查和錯誤處理

2. **Supabase SQL 腳本**
   - `diagnose_and_fix_tasks.sql` - 完整的診斷和修復腳本
   - `fix_browse_tasks.sql` - 快速修復腳本

## ✅ 驗證清單

- [ ] Supabase 中 `get_tasks` 函數已更新
- [ ] RLS 政策已檢查/更新
- [ ] 前端代碼已更新並部署
- [ ] 瀏覽器緩存已清除
- [ ] 能夠創建任務
- [ ] 能夠在 Browse Tasks 中看到任務
- [ ] 控制台沒有錯誤

## 🆘 如果還是不行

請提供以下信息：
1. Supabase SQL Editor 中 `SELECT * FROM tasks LIMIT 5;` 的結果
2. 瀏覽器控制台的完整錯誤訊息
3. Network 標籤中 `get_tasks` 請求的響應
