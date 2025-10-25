import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}
  async register(registerDto: RegisterDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', registerDto.email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      
      // Create user in database
      const { data: user, error } = await supabase.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            first_name: registerDto.firstName,
            last_name: registerDto.lastName,
            role: registerDto.role,
          },
          emailRedirectTo: process.env.SUPABASE_EMAIL_REDIRECT_TO || 'http://localhost:3000/app.html', // Or your frontend URL
        },
      });

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Always return a message indicating email verification is needed.
      // The actual user profile in our 'users' table will be created upon first successful login after email verification.
      return {
        message: 'Registration successful. Please check your email to verify your account before logging in.',
        user: null,
        token: null,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed: No user or session data.');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        throw new Error('Please verify your email before logging in.');
      }

      // Fetch user profile from our 'users' table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error(`Failed to load user profile: ${profileError?.message || 'Profile not found'}`);
      }

      // Update last login time
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userProfile.id);

      // Generate JWT token
      const token = jwt.sign(
        { sub: userProfile.id, email: userProfile.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'Login successful',
        user: {
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          role: userProfile.role,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }
}
