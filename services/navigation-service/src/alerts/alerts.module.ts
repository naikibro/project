import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { Alert } from './entities/alert.entity';
import { AlertsGateway } from './alerts.gateway';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { AlertsRatingService } from './alerts.rating.service';
import { AlertsRatingGateway } from './alerts.rating.gateway';
import { AlertRating } from './entities/alert.rating.entity';
@Module({
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
  controllers: [AlertsGateway, AlertsRatingGateway],
  providers: [AlertsService, AlertsRatingService],
  exports: [AlertsService, AlertsRatingService],
})
export class AlertsModule {}
