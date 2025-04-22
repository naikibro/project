import { testDataSource } from '@/config/test-configs/typeorm.test.config';
import { dataSource } from '@/config/typeorm.config';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const AppDataSource: DataSource = isTest ? testDataSource : dataSource;

export default AppDataSource;
