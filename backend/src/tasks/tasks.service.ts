import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  async createTask(raiserId: string, dto: CreateTaskDto) {
    // Mock task creation
    const task = {
      id: 'task_' + Date.now(),
      raiser_id: raiserId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      location: dto.location,
      reward_amount: dto.rewardAmount,
      deadline: dto.deadline,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: task,
    };
  }

  async getTasks(filters: any) {
    // Mock tasks data
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
        raiser: {
          id: 'user_1',
          full_name: 'John Doe',
          profile_picture: null,
        },
      },
    ];

    return {
      success: true,
      data: mockTasks,
    };
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