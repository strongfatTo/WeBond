import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../../supabase/supabase.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    // Try to extract token from multiple places
    const authHeader = client.handshake?.headers?.authorization as string | undefined;
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;

    const authToken = (client.handshake?.auth as any)?.token as string | undefined;
    const supabaseToken = (client.handshake?.auth as any)?.supabaseToken as string | undefined;

    // 1) Try local JWT first
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const candidateToken = authToken || headerToken;

    let userId: string | undefined;
    let userEmail: string | undefined;

    if (candidateToken) {
      try {
        const payload: any = jwt.verify(candidateToken, jwtSecret);
        userId = payload.sub || payload.id;
        userEmail = payload.email;
      } catch (err) {
        // ignore and proceed to Supabase token flow
      }
    }

    // 2) If local JWT failed, try Supabase access token
    if (!userId && supabaseToken) {
      try {
        const authClient = this.supabaseService.getAuthClient(supabaseToken);
        const { data, error } = await authClient.auth.getUser();
        if (error || !data?.user?.id) {
          throw new UnauthorizedException('Invalid Supabase token');
        }
        userId = data.user.id;
        userEmail = data.user.email || undefined;
      } catch (err) {
        throw new UnauthorizedException('Invalid authentication for WebSocket connection');
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Missing or invalid authentication token');
    }

    // Attach user info to socket for downstream handlers
    client.data = client.data || {};
    (client.data as any).user = { id: userId, email: userEmail };
    (client.data as any).supabaseToken = supabaseToken; // may be undefined

    return true;
  }
}