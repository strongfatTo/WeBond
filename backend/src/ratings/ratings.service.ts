import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private supabaseService: SupabaseService) {}

  async createRating(raterId: string, dto: CreateRatingDto) {
    const supabase = this.supabaseService.getClient();

    // Verify task completion and participation
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', dto.taskId)
      .single();

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'completed') {
      throw new ForbiddenException('Can only rate completed tasks');
    }

    // Determine who to rate based on rater
    let rateeId: string;
    if (task.raiser_id === raterId) {
      rateeId = task.solver_id;
    } else if (task.solver_id === raterId) {
      rateeId = task.raiser_id;
    } else {
      throw new ForbiddenException('Not authorized to rate this task');
    }

    // Create rating
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({
        task_id: dto.taskId,
        rater_id: raterId,
        ratee_id: rateeId,
        rating: dto.rating,
        review: dto.review,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create rating: ${error.message}`);
    }

    return {
      success: true,
      data: rating,
    };
  }

  async getUserRatings(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:users!ratings_rater_id_fkey(id, full_name, profile_picture),
        task:tasks(id, title)
      `)
      .eq('ratee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ratings: ${error.message}`);
    }

    const averageRating = ratings.length
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;

    return {
      success: true,
      data: {
        ratings,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings: ratings.length,
      },
    };
  }
}

