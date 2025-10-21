import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectRedis } from './utils/redis';

// Routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import messageRoutes from './routes/messages';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'webond-api',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Connect Redis and start server
connectRedis()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 WeBond API running on port ${PORT}`);
      console.log(`🚀 WeBond API running on port ${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
      console.log(`📋 Task endpoints: http://localhost:${PORT}/api/tasks/*`);
      console.log(`💬 Message endpoints: http://localhost:${PORT}/api/messages/*`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });

export default app;
