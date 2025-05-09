import { AuthModule } from '@/auth/auth.module';
import { Role } from '@/auth/rbac/role/role.entity';
import { typeOrmTestConfig } from '@/config/test-configs/typeorm.test.config';
import { User } from '@/users/users.entity';
import { UsersModule } from '@/users/users.module';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export async function setup() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AuthModule,
      UsersModule,
      UsersModule,
      TypeOrmModule.forFeature([User, Role]),
      TypeOrmModule.forRoot(typeOrmTestConfig),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const userRepository = moduleFixture.get<Repository<User>>(
    getRepositoryToken(User),
  );

  await userRepository.delete({});
}
