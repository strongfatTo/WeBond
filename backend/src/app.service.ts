import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'webond-backend',
      version: '1.0.0',
    };
  }
}
