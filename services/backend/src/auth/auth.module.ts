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

dotenv.config();

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
