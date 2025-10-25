import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SupabaseModule } from '../supabase/supabase.module'; // Import SupabaseModule

@Module({
  imports: [SupabaseModule], // Add SupabaseModule to imports
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
