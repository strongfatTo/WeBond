export enum TaskCategory {
  TRANSLATION = 'translation',
  VISA_HELP = 'visa_help',
  NAVIGATION = 'navigation',
  SHOPPING = 'shopping',
  ADMIN_HELP = 'admin_help',
  OTHER = 'other',
}

export enum TaskStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export interface Task {
  id: string;
  raiserId: string;
  solverId?: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  rewardAmount: number;
  preferredLanguage?: string;
  preferredCompletionDate?: Date;
  status: TaskStatus;
  postedAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  rewardAmount: number;
  preferredLanguage?: string;
  preferredCompletionDate?: Date;
}

export interface TaskFilter {
  category?: TaskCategory;
  minReward?: number;
  maxReward?: number;
  language?: string;
  location?: string;
  status?: TaskStatus;
}
