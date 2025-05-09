import 'tsconfig-paths/register';
import { testDataSourceOptions } from '@/config/test-configs/typeorm.test.config';
import { DataSource } from 'typeorm';

export default async function globalSetup(): Promise<void> {
  const dataSource = new DataSource(testDataSourceOptions);
  await dataSource.initialize();

  await dataSource.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await dataSource.runMigrations();
  await dataSource.destroy();
}
