import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
  imports: [
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'mailer-service',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
})
export class MailerModule {}
