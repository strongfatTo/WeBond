import { Router } from 'express';
import {
  createTask,
  createTaskValidation,
  getTasks,
  getTaskById,
  updateTask,
  publishTask,
  acceptTask,
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', authenticateToken, createTaskValidation, validate(createTaskValidation), createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filters
 * @access  Public
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Public
 */
router.get('/:id', getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private (task owner only)
 */
router.put('/:id', authenticateToken, updateTask);

/**
 * @route   POST /api/tasks/:id/publish
 * @desc    Publish a draft task
 * @access  Private (task owner only)
 */
router.post('/:id/publish', authenticateToken, publishTask);

/**
 * @route   POST /api/tasks/:id/accept
 * @desc    Accept a task as solver
 * @access  Private
 */
router.post('/:id/accept', authenticateToken, acceptTask);

export default router;
