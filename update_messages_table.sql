-- Drop RLS policies that depend on task_id first
DROP POLICY IF EXISTS "Messages viewable by task participants" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their tasks" ON messages;

-- Drop the old task_id column from messages table
ALTER TABLE messages
DROP COLUMN IF EXISTS task_id;

-- Ensure chat_id in messages is a foreign key to chats(id)
-- First, drop any existing foreign key constraint on messages.chat_id if it exists
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;

-- Add the foreign key constraint
ALTER TABLE messages
ADD CONSTRAINT messages_chat_id_fkey
FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

-- Make chat_id NOT NULL
ALTER TABLE messages
ALTER COLUMN chat_id SET NOT NULL;

-- Re-create RLS policy for messages to use chat_id
CREATE POLICY "Messages viewable by chat participants"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND (chats.raiser_id = auth.uid() OR chats.solver_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their chats"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND (chats.raiser_id = auth.uid() OR chats.solver_id = auth.uid())
        )
    );
