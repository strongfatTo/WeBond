import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    private supabaseService: SupabaseService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async createTask(raiserId: string, dto: CreateTaskDto) {
    const supabase = this.supabaseService.getClient();

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        raiser_id: raiserId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        location: dto.location,
        reward_amount: dto.rewardAmount,
        deadline: dto.deadline,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return {
      success: true,
      data: task,
    };
  }

  async getTasks(filters: any) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('tasks')
      .select(`
        *,
        raiser:users!tasks_raiser_id_fkey(id, full_name, profile_picture)
      `)
      .eq('status', 'open');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return {
      success: true,
      data: tasks,
    };
  }

  async getMyTasks(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        raiser:users!tasks_raiser_id_fkey(id, full_name, profile_picture),
        solver:users!tasks_solver_id_fkey(id, full_name, profile_picture)
      `)
      .or(`raiser_id.eq.${userId},solver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user tasks: ${error.message}`);
    }

    return {
      success: true,
      data: tasks,
    };
  }

  async getTaskById(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        raiser:users!tasks_raiser_id_fkey(id, full_name, profile_picture, languages),
        solver:users!tasks_solver_id_fkey(id, full_name, profile_picture, languages)
      `)
      .eq('id', id)
      .single();

    if (error || !task) {
      throw new NotFoundException('Task not found');
    }

    return {
      success: true,
      data: task,
    };
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const supabase = this.supabaseService.getClient();

    // Verify ownership
    const { data: task } = await supabase
      .from('tasks')
      .select('raiser_id')
      .eq('id', taskId)
      .single();

    if (!task || task.raiser_id !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        location: dto.location,
        reward_amount: dto.rewardAmount,
        deadline: dto.deadline,
        status: dto.status,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return {
      success: true,
      data: updatedTask,
    };
  }

  async acceptTask(solverId: string, taskId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        solver_id: solverId,
        status: 'in_progress',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('status', 'open')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to accept task: ${error.message}`);
    }

    return {
      success: true,
      data: task,
    };
  }

  async completeTask(userId: string, taskId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Both raiser and solver must confirm completion
    const updateData: any = { status: 'completed' };

    if (userId === task.raiser_id) {
      updateData.completion_confirmed_raiser = true;
    } else if (userId === task.solver_id) {
      updateData.completion_confirmed_solver = true;
    } else {
      throw new ForbiddenException('Not authorized to complete this task');
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete task: ${error.message}`);
    }

    return {
      success: true,
      data: updatedTask,
    };
  }

  async getRecommendations(userId: string) {
    const aiServiceUrl = this.configService.get('AI_SERVICE_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${aiServiceUrl}/matching/find-tasks`, {
          userId,
        }),
      );

      return {
        success: true,
        data: (response as any).data,
      };
    } catch (error) {
      // Fallback to simple recommendations if AI service is unavailable
      return this.getTasks({});
    }
  }
}

