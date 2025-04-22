import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const testDatabaseConnectionUrl = process.env.POSTGRES_TEST_URI;

export const typeOrmTestConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: testDatabaseConnectionUrl,
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
  entities: [],
};

export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: testDatabaseConnectionUrl,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
  synchronize: false,
};

export const testDataSource = new DataSource(testDataSourceOptions);
