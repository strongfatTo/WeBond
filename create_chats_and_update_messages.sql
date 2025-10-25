-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    raiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id) -- Ensure only one chat per task
);

-- Add chat_id to messages table and remove task_id
ALTER TABLE messages
ADD COLUMN chat_id UUID REFERENCES chats(id) ON DELETE CASCADE;

-- Migrate existing messages to new chat structure (optional, if there's existing data)
-- For now, we assume no existing messages or they will be handled separately.
-- If there were existing messages, we would need to create chat entries for them
-- and then update the messages with the new chat_id.

-- Make chat_id NOT NULL after migration (if applicable)
ALTER TABLE messages
ALTER COLUMN chat_id SET NOT NULL;

-- Drop the old task_id column from messages table
ALTER TABLE messages
DROP COLUMN task_id;

-- Re-create RLS policy for messages to use chat_id
DROP POLICY IF EXISTS "Messages viewable by task participants" ON messages;
CREATE POLICY "Messages viewable by chat participants"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND (chats.raiser_id = auth.uid() OR chats.solver_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages in their tasks" ON messages;
CREATE POLICY "Users can send messages in their chats"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND (chats.raiser_id = auth.uid() OR chats.solver_id = auth.uid())
        )
    );

-- Grant permissions for chats table
GRANT SELECT ON chats TO authenticated;
GRANT INSERT ON chats TO authenticated;
GRANT UPDATE ON chats TO authenticated;
GRANT DELETE ON chats TO authenticated;

-- Add updated_at trigger for chats table
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for chats table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Chat participants can view their chats
CREATE POLICY "Chat participants can view their chats"
    ON chats FOR SELECT
    USING (auth.uid() = raiser_id OR auth.uid() = solver_id);

-- Chat participants can update their chats (e.g., for status changes)
CREATE POLICY "Chat participants can update their chats"
    ON chats FOR UPDATE
    USING (auth.uid() = raiser_id OR auth.uid() = solver_id);

-- Only task raiser/solver can create chats (via RPC)
CREATE POLICY "Only task raiser/solver can create chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = raiser_id OR auth.uid() = solver_id);
