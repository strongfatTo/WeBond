export enum UserRole {
  RAISER = 'raiser',
  SOLVER = 'solver',
  BOTH = 'both',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  preferredLanguage: string;
  location?: string;
  bio?: string;
  languagesSpoken: string[];
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  preferredLanguage?: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}
