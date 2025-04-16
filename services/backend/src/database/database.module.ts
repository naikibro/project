import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../auth/rbac/role/role.entity';
import { User } from '../users/users.entity';
import { DatabaseController } from './database.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [DatabaseController],
  providers: [],
})
export class DatabaseModule {}
