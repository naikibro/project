import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import {
  mailerRabbitMqMicroserviceOptions,
  rabbitMqMicroserviceOptions,
} from './config/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  const PROJECT_NAME = process.env.PROJECT_NAME ?? '';
  const config = new DocumentBuilder()
    .setTitle(`${PROJECT_NAME} API`)
    .setDescription(`Discover ${PROJECT_NAME} API`)
    .setVersion('1.0')
    .addTag(`${PROJECT_NAME}`)
    .build();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config), {
    customSiteTitle: `${PROJECT_NAME} API Documentation`,
    customfavIcon: '/favicon.ico',
  });

  try {
    app.connectMicroservice(rabbitMqMicroserviceOptions);
    app.connectMicroservice(mailerRabbitMqMicroserviceOptions);
    await app.startAllMicroservices();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
