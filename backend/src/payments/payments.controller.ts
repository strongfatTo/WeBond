import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto, ReleasePaymentDto } from './dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent for task' })
  async createPayment(@Request() req, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user.id, dto);
  }

  @Post('release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release escrow payment to solver' })
  async releasePayment(@Request() req, @Body() dto: ReleasePaymentDto) {
    return this.paymentsService.releasePayment(req.user.id, dto.taskId);
  }
}

