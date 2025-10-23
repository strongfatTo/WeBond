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
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: registerDto.email,
          password_hash: hashedPassword,
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
          role: registerDto.role,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
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
      
      // Look up user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginDto.email)
        .single();

      if (error || !user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login time
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Generate JWT token
      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }
}