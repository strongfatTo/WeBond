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
    // Mock user tasks
    const mockTasks = [
      {
        id: 'task_1',
        title: 'Help with visa renewal',
        description: 'I need assistance with renewing my student visa',
        category: 'administrative',
        location: 'Wan Chai, Hong Kong',
        reward_amount: 200,
        status: 'open',
        created_at: new Date().toISOString(),
        raiser_id: userId,
        solver_id: null,
        raiser: {
          id: userId,
          full_name: 'Current User',
          profile_picture: null,
        },
        solver: null,
      },
    ];

    return {
      success: true,
      data: mockTasks,
    };
  }

  async getTaskById(id: string) {
    // Mock task by ID
    const task = {
      id: id,
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
        languages: ['en', 'zh'],
      },
      solver: null,
    };

    return {
      success: true,
      data: task,
    };
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    // Mock task update
    const updatedTask = {
      id: taskId,
      title: dto.title || 'Updated Task',
      description: dto.description || 'Updated description',
      category: dto.category || 'administrative',
      location: dto.location || 'Hong Kong',
      reward_amount: dto.rewardAmount || 200,
      deadline: dto.deadline,
      status: dto.status || 'open',
      updated_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedTask,
    };
  }

  async acceptTask(solverId: string, taskId: string) {
    // Mock task acceptance
    const task = {
      id: taskId,
      solver_id: solverId,
      status: 'in_progress',
      accepted_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: task,
    };
  }

  async completeTask(userId: string, taskId: string) {
    // Mock task completion
    const task = {
      id: taskId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: task,
    };
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