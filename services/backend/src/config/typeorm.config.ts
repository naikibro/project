import { Role } from '@/auth/rbac/role/role.entity';
import { User } from '@/users/users.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
  entities: [Role, User],
};

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
});
