import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertsModule } from './alerts/alerts.module';
import { typeOrmConfig } from './config/typeorm.config';
import { typeOrmTestConfig } from './config/test-configs/typeorm.test.config';
import { DatabaseModule } from './database/database.module';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    TypeOrmModule.forRoot(isTest ? typeOrmTestConfig : typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AlertsModule,
    ClientsModule.register([
      {
        name: 'NAVIGATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'navigation-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
