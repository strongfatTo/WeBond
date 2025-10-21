import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const supabase = this.supabaseService.getClient();

    // Verify task and ownership
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', dto.taskId)
      .single();

    if (!task || task.raiser_id !== userId) {
      throw new ForbiddenException('Not authorized to create payment for this task');
    }

    // Create Stripe payment intent (simulated for MVP)
    const paymentIntent = this.stripe ? await this.stripe.paymentIntents.create({
      amount: Math.round(task.reward_amount * 100), // Convert to cents
      currency: 'hkd',
      metadata: { taskId: dto.taskId },
    }) : null;

    // Record transaction in escrow
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        task_id: dto.taskId,
        payer_id: userId,
        amount: task.reward_amount,
        status: 'escrow',
        payment_intent_id: paymentIntent?.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return {
      success: true,
      data: {
        transaction,
        clientSecret: paymentIntent?.client_secret,
      },
    };
  }

  async releasePayment(userId: string, taskId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify task completion and ownership
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!task || task.raiser_id !== userId) {
      throw new ForbiddenException('Not authorized to release payment');
    }

    if (task.status !== 'completed') {
      throw new ForbiddenException('Task must be completed before releasing payment');
    }

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('task_id', taskId)
      .eq('status', 'escrow')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to release payment: ${error.message}`);
    }

    return {
      success: true,
      data: transaction,
      message: 'Payment released to solver successfully',
    };
  }
}

