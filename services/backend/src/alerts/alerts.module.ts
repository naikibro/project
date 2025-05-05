import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { AlertRating } from './entities/alert.rating.entity';
import { AlertsRatingService } from './alerts.rating.service';
import { AlertsRatingController } from './alerts.rating.controller';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

@Module({
  controllers: [AlertsController, AlertsRatingController],
  imports: [
    TypeOrmModule.forFeature([Alert, AlertRating]),
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
  providers: [AlertsService, AlertsRatingService],
})
export class AlertsModule {}
