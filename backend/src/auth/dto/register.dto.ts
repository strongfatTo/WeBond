import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserType {
  TASK_RAISER = 'task_raiser',
  TASK_SOLVER = 'task_solver',
  BOTH = 'both',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: UserType, example: UserType.BOTH })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ example: '+852 9123 4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

