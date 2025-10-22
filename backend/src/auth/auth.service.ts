import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email: registerDto.email,
      password: hashedPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Optionally, create a user entry in your public.users table
    // await this.usersService.create({
    //   id: data.user.id,
    //   email: data.user.email,
    //   // other user data
    // });

    return { message: 'User registered successfully', user: data.user };
  }
}
