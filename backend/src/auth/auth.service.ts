import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // For now, let's use a simple approach without Supabase auth
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      
      // Create a mock user
      const mockUser = {
        id: 'user_' + Date.now(),
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        createdAt: new Date(),
      };

      // Generate JWT token
      const token = jwt.sign(
        { sub: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'User registered successfully',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
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
      // For now, let's use a simple approach without Supabase auth
      // In a real app, you'd verify the password against the database
      
      // Create a mock user
      const mockUser = {
        id: 'user_' + Date.now(),
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        role: 'raiser',
      };

      // Generate JWT token
      const token = jwt.sign(
        { sub: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }
}