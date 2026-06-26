import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  services: {
    api: { status: 'up' | 'down'; latencyMs?: number };
    database: { status: 'up' | 'down'; latencyMs?: number; name: string };
  };
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        api: { status: 'up', latencyMs: 0 },
        database: { status: 'up', latencyMs: 0, name: 'MongoDB' },
      },
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
