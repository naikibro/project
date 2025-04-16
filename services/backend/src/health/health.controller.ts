import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export interface HealthReport {
  postgresConnection: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Check API and microservices health',
    description:
      'Returns the health status of both the PostgreSQL (TypeORM) connection.',
  })
  @ApiResponse({
    status: 200,
    description: 'DB connections are healthy',
    schema: {
      example: {
        postgresConnection: 'healthy',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - the TypeORM  connection failed',
  })
  async checkHealth(): Promise<HealthReport> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new HttpException(
        { message: 'TypeORM database connection failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { postgresConnection: 'healthy' };
  }
}
