import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [SupabaseModule],
  providers: [ChatGateway, ChatService, WsJwtGuard],
})
export class ChatModule {}

