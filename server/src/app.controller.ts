import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService, HealthStatus } from './app.service';
import { Public } from './presentation/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check', description: 'Returns the health status of the API and its dependencies' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-06-26T10:00:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        services: {
          type: 'object',
          properties: {
            api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                latencyMs: { type: 'number', example: 0 },
              },
            },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                latencyMs: { type: 'number', example: 0 },
                name: { type: 'string', example: 'MongoDB' },
              },
            },
          },
        },
      },
    },
  })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
