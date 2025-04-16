/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AuthModule } from '@/auth/auth.module';
import { Role } from '@/auth/rbac/role/role.entity';
import { typeOrmTestConfig } from '@/config/test-configs/typeorm.test.config';
import { User } from '@/users/users.entity';
import { UsersModule } from '@/users/users.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { setup } from './test.setup';
import { idOf } from '@/utils/test/test.utils';

const testName = `AuthController (e2e) - ${new Date().toISOString()}`;

describe(testName, () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let testUserPayload: {
    username: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        TypeOrmModule.forFeature([User, Role]),
        TypeOrmModule.forRoot(typeOrmTestConfig),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await setup();
    await app.init();
  });

  beforeEach(() => {
    testUserPayload = {
      username: `testuser_${idOf(testName)}`,
      email: `testuser${idOf(testName)}@example.com`,
      password: 'StrongPassword123!',
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should successfully register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUserPayload)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');

      const user = await userRepository.findOne({
        where: { email: testUserPayload.email },
      });
      expect(user).toBeDefined();
      expect(user?.username).toBe(testUserPayload.username);
    });

    it('should fail if email is already registered', async () => {
      const tempUser: Partial<User> = {
        id: idOf('tempUser'),
        username: `tempUser-${idOf(testName)}`,
        email: `tempUser-${idOf(testName)}@example.com`,
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        isActive: false,
        createdAt: new Date(),
      };

      // First registration
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...tempUser,
        })
        .expect(201);

      // Second registration should fail with Conflict
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...tempUser,
        })
        .expect(409);
    });

    it('should fail if terms are not accepted', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...testUserPayload, acceptedTerms: false })
        .expect(400);
    });

    it('should fail if privacy policy is not accepted', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...testUserPayload, acceptedPrivacyPolicy: false })
        .expect(400);
    });

    it('should fail if password is weak', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...testUserPayload,
          password: 'weakpassword',
        })
        .expect(400);
    });
  });

  describe('/auth/signin (POST)', () => {
    beforeEach(async () => {
      const existingUser = await userRepository.findOne({
        where: { email: testUserPayload.email },
      });

      if (existingUser) {
        await userRepository.remove(existingUser);
      }
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUserPayload)
        .expect(201);
    });

    it('should successfully sign in with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testUserPayload.email,
          password: testUserPayload.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: testUserPayload.email, password: 'wrongPassword123' })
        .expect(401);
    });

    it('should fail if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nonexistent@example.com', password: 'SomePass123!' })
        .expect(404);
    });

    it('should fail if email is not provided', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ password: 'SomePass123!' })
        .expect(400);
    });

    it('should fail if password is not provided', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: testUserPayload.email })
        .expect(400);
    });

    it('should fail if email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'invalid-email', password: 'SomePass123!' })
        .expect(400);
    });
  });
});
