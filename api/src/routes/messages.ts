import { Router } from 'express';
import {
  sendMessage,
  sendMessageValidation,
  getTaskMessages,
  getUnreadCount,
} from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/messages/:taskId
 * @desc    Send a message for a specific task
 * @access  Private (raiser or solver)
 */
router.post(
  '/:taskId',
  authenticateToken,
  sendMessageValidation,
  validate(sendMessageValidation),
  sendMessage
);

/**
 * @route   GET /api/messages/:taskId
 * @desc    Get all messages for a task
 * @access  Private (raiser or solver)
 */
router.get('/:taskId', authenticateToken, getTaskMessages);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get unread message count for current user
 * @access  Private
 */
router.get('/unread/count', authenticateToken, getUnreadCount);

export default router;
