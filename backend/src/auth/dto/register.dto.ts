import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  RAISER = 'raiser',
  SOLVER = 'solver',
  BOTH = 'both',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
