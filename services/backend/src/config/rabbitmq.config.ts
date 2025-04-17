import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config();

// For general messaging
export const rabbitMqMicroserviceOptions: MicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'message-queue',
    queueOptions: {
      durable: false,
    },
  },
};

// For Mailer Service
export const mailerRabbitMqMicroserviceOptions: MicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'mailer-service',
    queueOptions: {
      durable: false,
    },
  },
};
