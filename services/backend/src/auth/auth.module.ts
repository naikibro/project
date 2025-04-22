import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/users/users.entity';
import { Role } from './rbac/role/role.entity';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { JwtStrategy } from './jwt/jwt.strategy';
import { GoogleStrategy } from './google/google.strategy.oauth';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from '@/users/users.service';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    UsersService,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Role]),
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'mailer-service',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
