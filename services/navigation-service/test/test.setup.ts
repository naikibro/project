import { Alert } from '@/alerts/entities/alert.entity';
import { typeOrmTestConfig } from '@/config/test-configs/typeorm.test.config';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export async function setup() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forFeature([Alert]),
      TypeOrmModule.forRoot(typeOrmTestConfig),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const alertRepository = moduleFixture.get<Repository<Alert>>(
    getRepositoryToken(Alert),
  );

  await alertRepository.delete({});

  return { app, alertRepository };
}
