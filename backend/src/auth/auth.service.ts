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

      if (user.user && user.user.identities && user.user.identities.length === 0) {
        // User needs to verify email
        return {
          message: 'Registration successful. Please check your email to verify your account before logging in.',
          user: null,
          token: null,
        };
      }

      // If auto-login happens (e.g., email verification is off or already verified)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.user.id,
          email: user.user.email,
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
          role: registerDto.role,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, consider logging out the user from Supabase Auth
        await supabase.auth.signOut();
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      const token = jwt.sign(
        { sub: profile.id, email: profile.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'User registered successfully',
        user: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
        },
        token,
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
