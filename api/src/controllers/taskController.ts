import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const createTaskValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('category').isIn(['translation', 'visa_help', 'navigation', 'shopping', 'admin_help', 'other']).withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('rewardAmount').isFloat({ min: 50, max: 5000 }).withMessage('Reward must be between HKD 50-5000'),
];

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const {
      title,
      description,
      category,
      location,
      latitude,
      longitude,
      rewardAmount,
      preferredLanguage,
      preferredCompletionDate,
    } = req.body;

    const task = await prisma.task.create({
      data: {
        raiserId: req.user.userId,
        title,
        description,
        category,
        location,
        latitude,
        longitude,
        rewardAmount,
        preferredLanguage,
        preferredCompletionDate: preferredCompletionDate ? new Date(preferredCompletionDate) : null,
        status: 'draft',
      },
    });

    logger.info(`Task created: ${task.id} by user ${req.user.userId}`);

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Create task error:', error);
    throw new AppError('Failed to create task', 500);
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status = 'active',
      category,
      minReward,
      maxReward,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (minReward || maxReward) {
      where.rewardAmount = {};
      if (minReward) where.rewardAmount.gte = parseFloat(minReward as string);
      if (maxReward) where.rewardAmount.lte = parseFloat(maxReward as string);
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { postedAt: 'desc' },
        include: {
          raiser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    throw new AppError('Failed to fetch tasks', 500);
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        raiser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            preferredLanguage: true,
          },
        },
        solver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            solverProfile: {
              select: {
                averageRating: true,
                completedTaskCount: true,
                tierLevel: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json(task);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get task error:', error);
    throw new AppError('Failed to fetch task', 500);
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.raiserId !== req.user.userId) {
      throw new AppError('Unauthorized to update this task', 403);
    }

    if (task.status !== 'draft') {
      throw new AppError('Can only update draft tasks', 400);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    logger.info(`Task updated: ${id}`);

    res.json(updated);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update task error:', error);
    throw new AppError('Failed to update task', 500);
  }
};

export const publishTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.raiserId !== req.user.userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (task.status !== 'draft') {
      throw new AppError('Task already published', 400);
    }

    const published = await prisma.task.update({
      where: { id },
      data: {
        status: 'active',
        postedAt: new Date(),
      },
    });

    logger.info(`Task published: ${id}`);

    res.json(published);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Publish task error:', error);
    throw new AppError('Failed to publish task', 500);
  }
};

export const acceptTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.status !== 'active') {
      throw new AppError('Task not available for acceptance', 400);
    }

    if (task.raiserId === req.user.userId) {
      throw new AppError('Cannot accept your own task', 400);
    }

    const accepted = await prisma.task.update({
      where: { id },
      data: {
        solverId: req.user.userId,
        status: 'in_progress',
        acceptedAt: new Date(),
      },
    });

    logger.info(`Task accepted: ${id} by ${req.user.userId}`);

    res.json(accepted);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Accept task error:', error);
    throw new AppError('Failed to accept task', 500);
  }
};
