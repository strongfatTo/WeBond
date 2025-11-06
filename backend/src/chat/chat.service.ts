import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

  async isParticipant(taskId: string, userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, raiser_id, solver_id')
      .eq('id', taskId)
      .single();

    if (error || !task) return false;
    return task.raiser_id === userId || task.solver_id === userId;
  }

  async saveMessage(
    data: { taskId: string; senderId: string; message: string },
    supabaseToken?: string,
  ) {
    // Use an authenticated Supabase client when available to leverage RLS
    const supabase = supabaseToken
      ? this.supabaseService.getAuthClient(supabaseToken)
      : this.supabaseService.getClient();

    // Resolve chat for the given task
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id, raiser_id, solver_id')
      .eq('task_id', data.taskId)
      .single();

    if (chatError || !chat) {
      throw new ForbiddenException('Chat not found for task');
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: data.senderId,
        content: data.message,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, profile_photo_url)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    return message;
  }

  async getMessages(taskId: string, supabaseToken?: string) {
    const supabase = supabaseToken
      ? this.supabaseService.getAuthClient(supabaseToken)
      : this.supabaseService.getClient();

    // Resolve chat by task
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('task_id', taskId)
      .single();

    if (chatError || !chat) {
      throw new Error('Chat not found for task');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, profile_photo_url)
      `)
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return messages;
  }
}

