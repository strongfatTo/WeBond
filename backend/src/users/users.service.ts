import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    // Remove sensitive data
    delete user.password;

    return {
      success: true,
      data: user,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: dto.fullName,
        bio: dto.bio,
        location: dto.location,
        languages: dto.languages,
        skills: dto.skills,
        profile_picture: dto.profilePicture,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    delete user.password;

    return {
      success: true,
      data: user,
    };
  }

  async getUserStats(userId: string) {
    const supabase = this.supabaseService.getClient();

    // Get tasks created
    const { count: tasksCreated } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('raiser_id', userId);

    // Get tasks completed as solver
    const { count: tasksCompleted } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('solver_id', userId)
      .eq('status', 'completed');

    // Get average rating
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('ratee_id', userId);

    const averageRating = ratings?.length
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;

    return {
      success: true,
      data: {
        tasksCreated: tasksCreated || 0,
        tasksCompleted: tasksCompleted || 0,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings: ratings?.length || 0,
      },
    };
  }
}

