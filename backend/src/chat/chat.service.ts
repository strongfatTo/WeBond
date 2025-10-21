import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

  async saveMessage(data: { taskId: string; senderId: string; message: string }) {
    const supabase = this.supabaseService.getClient();

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        task_id: data.taskId,
        sender_id: data.senderId,
        content: data.message,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, full_name, profile_picture)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    return message;
  }

  async getMessages(taskId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, full_name, profile_picture)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return messages;
  }
}

