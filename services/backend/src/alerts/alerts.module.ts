import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

@Module({
  controllers: [AlertsController],
  imports: [
    TypeOrmModule.forFeature([Alert]),
    ClientsModule.register([
      {
        name: 'NAVIGATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'navigation-service',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [AlertsService],
})
export class AlertsModule {}
