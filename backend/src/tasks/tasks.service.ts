import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TasksService {
  constructor(private supabaseService: SupabaseService) {}

  async createTask(raiserId: string, dto: CreateTaskDto) {
    try {
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
          preferred_completion_date: dto.deadline,
          status: 'active', // Set to active when created
          posted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Task creation failed: ${error.message}`);
      }

      return {
        success: true,
        data: task,
      };
    } catch (error) {
      console.error('Task creation error:', error);
      throw new Error('Task creation failed');
    }
  }

  async getTasks(filters: any) {
    try {
      const supabase = this.supabaseService.getClient();
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          raiser:users!tasks_raiser_id_fkey(id, first_name, last_name, profile_photo_url),
          solver:users!tasks_solver_id_fkey(id, first_name, last_name, profile_photo_url)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
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
        data: tasks || [],
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async getMyTasks(userId: string) {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          raiser:users!tasks_raiser_id_fkey(id, first_name, last_name, profile_photo_url),
          solver:users!tasks_solver_id_fkey(id, first_name, last_name, profile_photo_url)
        `)
        .or(`raiser_id.eq.${userId},solver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch my tasks: ${error.message}`);
      }

      return {
        success: true,
        data: tasks || [],
      };
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw new Error('Failed to fetch my tasks');
    }
  }

  async getTaskById(id: string) {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          raiser:users!tasks_raiser_id_fkey(id, first_name, last_name, profile_photo_url),
          solver:users!tasks_solver_id_fkey(id, first_name, last_name, profile_photo_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new NotFoundException(`Task with ID ${id} not found: ${error.message}`);
      }

      return {
        success: true,
        data: task,
      };
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw new Error('Failed to fetch task');
    }
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    try {
      const supabase = this.supabaseService.getClient();

      // First, check if the user is the raiser of the task
      const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('raiser_id, status')
        .eq('id', taskId)
        .single();

      if (fetchError || !existingTask) {
        throw new NotFoundException(`Task with ID ${taskId} not found.`);
      }

      if (existingTask.raiser_id !== userId) {
        throw new ForbiddenException('You are not authorized to update this task.');
      }

      // Only allow updates if the task is not completed or cancelled
      if (existingTask.status === 'completed' || existingTask.status === 'cancelled') {
        throw new ForbiddenException('Cannot update a completed or cancelled task.');
      }

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          title: dto.title,
          description: dto.description,
          category: dto.category,
          location: dto.location,
          reward_amount: dto.rewardAmount,
          preferred_completion_date: dto.deadline,
          status: dto.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(`Task update failed: ${error.message}`);
      }

      return {
        success: true,
        data: updatedTask,
      };
    } catch (error) {
      console.error('Task update error:', error);
      throw new Error('Task update failed');
    }
  }

  async acceptTask(solverId: string, taskId: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Check if task exists and is active
      const { data: taskToAccept, error: fetchError } = await supabase
        .from('tasks')
        .select('id, raiser_id, solver_id, status')
        .eq('id', taskId)
        .single();

      if (fetchError || !taskToAccept) {
        throw new NotFoundException(`Task with ID ${taskId} not found.`);
      }

      if (taskToAccept.raiser_id === solverId) {
        throw new ForbiddenException('You cannot accept your own task.');
      }

      if (taskToAccept.status !== 'active') {
        throw new ForbiddenException('Task is not active and cannot be accepted.');
      }

      if (taskToAccept.solver_id) {
        throw new ForbiddenException('Task already has a solver.');
      }

      // Update task status and assign solver
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({
          solver_id: solverId,
          status: 'in_progress',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Task acceptance failed: ${updateError.message}`);
      }

      // Create a new chat room for the accepted task
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          task_id: taskId,
          raiser_id: updatedTask.raiser_id,
          solver_id: solverId,
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat for accepted task:', chatError);
        // Decide whether to rollback task acceptance or just log the chat creation failure
        // For now, we'll let the task acceptance proceed but log the chat error
      }

      return {
        success: true,
        data: updatedTask,
      };
    } catch (error) {
      console.error('Task acceptance error:', error);
      throw new Error('Task acceptance failed');
    }
  }

  async completeTask(userId: string, taskId: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Check if task exists and if the user is the solver
      const { data: taskToComplete, error: fetchError } = await supabase
        .from('tasks')
        .select('id, solver_id, status')
        .eq('id', taskId)
        .single();

      if (fetchError || !taskToComplete) {
        throw new NotFoundException(`Task with ID ${taskId} not found.`);
      }

      if (taskToComplete.solver_id !== userId) {
        throw new ForbiddenException('You are not authorized to complete this task.');
      }

      if (taskToComplete.status !== 'in_progress') {
        throw new ForbiddenException('Task is not in progress and cannot be completed.');
      }

      const { data: completedTask, error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Task completion failed: ${updateError.message}`);
      }

      return {
        success: true,
        data: completedTask,
      };
    } catch (error) {
      console.error('Task completion error:', error);
      throw new Error('Task completion failed');
    }
  }

  async getRecommendations(userId: string) {
    // Mock recommendations
    const recommendations = [
      {
        id: 'task_1',
        title: 'Help with visa renewal',
        description: 'I need assistance with renewing my student visa',
        category: 'administrative',
        location: 'Wan Chai, Hong Kong',
        reward_amount: 200,
        status: 'open',
        created_at: new Date().toISOString(),
        raiser: {
          id: 'user_1',
          full_name: 'John Doe',
          profile_picture: null,
        },
      },
    ];

    return {
      success: true,
      data: recommendations,
    };
  }
}
