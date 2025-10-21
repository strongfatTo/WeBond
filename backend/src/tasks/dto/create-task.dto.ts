import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskCategory {
  ADMINISTRATIVE = 'administrative',
  EDUCATIONAL = 'educational',
  DAILY_LIFE = 'daily_life',
  PROFESSIONAL = 'professional',
  CULTURAL = 'cultural',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Help with visa renewal' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'I need assistance with renewing my student visa at Immigration Department' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TaskCategory, example: TaskCategory.ADMINISTRATIVE })
  @IsEnum(TaskCategory)
  category: TaskCategory;

  @ApiProperty({ example: 'Wan Chai, Hong Kong' })
  @IsString()
  location: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  rewardAmount: number;

  @ApiProperty({ example: '2025-11-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

