import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSourceMock: Partial<DataSource>;

  beforeEach(async () => {
    dataSourceMock = {
      query: jest.fn().mockResolvedValue([1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: dataSourceMock }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a healthy status if database is connected', async () => {
    (dataSourceMock.query as jest.Mock).mockResolvedValue([1]);

    const result = await controller.checkHealth();
    expect(result).toEqual({
      postgresConnection: 'healthy',
    });
  });

  it('should throw an error if TypeORM database connection fails', async () => {
    (dataSourceMock.query as jest.Mock).mockRejectedValue(
      new Error('DB Error'),
    );

    await expect(controller.checkHealth()).rejects.toThrow(HttpException);
    await expect(controller.checkHealth()).rejects.toThrow(
      'TypeORM database connection failed',
    );
  });
});
