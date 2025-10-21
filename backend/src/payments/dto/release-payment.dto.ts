import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleasePaymentDto {
  @ApiProperty({ example: 'uuid-task-id' })
  @IsString()
  taskId: string;
}

