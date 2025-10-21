import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('role').isIn(['raiser', 'solver', 'both']).withMessage('Invalid role'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, preferredLanguage } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        preferredLanguage: preferredLanguage || 'en',
        // refreshToken will be added after generation
      },
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Update user with refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info(`User registered: ${user.id}`);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Registration error:', error);
    throw new AppError('Registration failed', 500);
  }
};

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      logger.error('JWT secrets are not configured.');
      throw new AppError('Server configuration error', 500);
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      throw new AppError(`Account is ${user.accountStatus}`, 403);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Update refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info(`User logged in: ${user.id}`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        verificationStatus: user.verificationStatus,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login error:', error);
    throw new AppError('Login failed', 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      logger.error('JWT secrets are not configured.');
      throw new AppError('Server configuration error', 500);
    }

    const payload = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET as jwt.Secret
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.accountStatus !== 'active' || user.refreshToken !== oldRefreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as jwt.Secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Token refresh error:', error);
    throw new AppError('Token refresh failed', 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body; // Assuming userId is passed in the body for logout

    if (!userId) {
      throw new AppError('User ID required for logout', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info(`User logged out: ${userId}`);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Logout error:', error);
    throw new AppError('Logout failed', 500);
  }
};
