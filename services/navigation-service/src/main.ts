import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import {
  mailerRabbitMqMicroserviceOptions,
  rabbitMqMicroserviceOptions,
  navigationRabbitMqMicroserviceOptions,
} from './config/rabbitmq.config';

const ALLOWED_ORIGINS = [
  `http://${process.env.FRONTEND_URL}`,
  'https://www.supmap.fr',
  'http://www.supmap.fr',
  'https://supmap.fr',
  'http://supmap.fr',
  'http://localhost:3000',
  'http://localhost:4001',
  'http://localhost:8080',
  'http://localhost:19006', // For mobile development
  'http://10.0.2.2:4001', // Android emulator localhost
  'http://10.0.2.2:3000', // Android emulator localhost
  'http://10.0.2.2:8080', // Android emulator localhost
  'http://192.168.1.*', // Local network for physical devices
  'http://172.16.*.*', // Local network for physical devices
  'http://10.0.*.*', // Local network for physical devices
];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        ALLOWED_ORIGINS.some((allowedOrigin) => {
          if (allowedOrigin.includes('*')) {
            const pattern = new RegExp(
              '^' + allowedOrigin.replace('*', '.*') + '$',
            );
            return pattern.test(origin);
          }
          return allowedOrigin === origin;
        })
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-API-Key',
      'Access-Control-Allow-Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
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
    app.connectMicroservice(navigationRabbitMqMicroserviceOptions);
    await app.startAllMicroservices();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }

  await app.listen(process.env.PORT ?? 4002);
}
void bootstrap();
