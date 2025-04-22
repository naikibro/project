import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Alert } from '../alerts/entities/alert.entity';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
  entities: [Alert],
};

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  entities: [Alert],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: true,
});
