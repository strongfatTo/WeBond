import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const sendMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message content required'),
];

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { taskId } = req.params;
    const { content } = req.body;

    // Verify task exists and user is involved
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { raiserId: true, solverId: true, status: true },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Only raiser and solver can message each other
    if (task.raiserId !== req.user.userId && task.solverId !== req.user.userId) {
      throw new AppError('You are not authorized to message on this task', 403);
    }

    // Determine receiver
    const receiverId = task.raiserId === req.user.userId ? task.solverId : task.raiserId;

    if (!receiverId) {
      throw new AppError('Task has no solver assigned yet', 400);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        taskId,
        senderId: req.user.userId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Message sent: ${message.id} for task ${taskId}`);

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Send message error:', error);
    throw new AppError('Failed to send message', 500);
  }
};

export const getTaskMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { taskId } = req.params;

    // Verify task exists and user is involved
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { raiserId: true, solverId: true },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.raiserId !== req.user.userId && task.solverId !== req.user.userId) {
      throw new AppError('You are not authorized to view messages for this task', 403);
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            role: true,
          },
        },
      },
    });

    // Mark messages as read for current user
    await prisma.message.updateMany({
      where: {
        taskId,
        receiverId: req.user.userId,
        readStatus: false,
      },
      data: {
        readStatus: true,
        readAt: new Date(),
      },
    });

    res.json({ messages, count: messages.length });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get messages error:', error);
    throw new AppError('Failed to retrieve messages', 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const count = await prisma.message.count({
      where: {
        receiverId: req.user.userId,
        readStatus: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    logger.error('Get unread count error:', error);
    throw new AppError('Failed to get unread count', 500);
  }
};
