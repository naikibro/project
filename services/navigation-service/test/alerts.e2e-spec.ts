/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { AppModule } from '../src/app.module';
import { AlertType } from '../src/alerts/entities/alert.type';
import { firstValueFrom } from 'rxjs';

describe('AlertsController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let createdAlertId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          {
            name: 'ALERTS_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 4002,
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4002,
      },
    });

    await app.startAllMicroservices();
    await app.init();

    client = app.get('ALERTS_SERVICE');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  describe('createAlert', () => {
    it('should create a new alert', async () => {
      const createAlertDto = {
        title: 'Test Alert',
        coordinates: {
          longitude: -77.03655,
          latitude: 38.89768,
          accuracy: 'rooftop',
        },
        description: 'Test Description',
        type: AlertType.INFO,
        date: new Date(),
      };

      const response = await firstValueFrom(
        client.send('createAlert', createAlertDto),
      );

      expect(response).toMatchObject({
        title: createAlertDto.title,
        coordinates: createAlertDto.coordinates,
        description: createAlertDto.description,
        type: createAlertDto.type,
      });
      expect(response.id).toBeDefined();
      expect(response.date).toBeDefined();

      createdAlertId = response.id;
    });
  });

  describe('findAllAlerts', () => {
    it('should return an array of alerts', async () => {
      const response = await firstValueFrom(client.send('findAllAlerts', {}));
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
      expect(response[0]).toHaveProperty('id');
      expect(response[0]).toHaveProperty('title');
    });
  });

  describe('findOneAlert', () => {
    it('should return a single alert', async () => {
      const response = await firstValueFrom(
        client.send('findOneAlert', createdAlertId),
      );

      expect(response).toMatchObject({
        id: createdAlertId,
        title: expect.any(String),
        coordinates: expect.any(Object),
        description: expect.any(String),
        type: expect.any(String),
      });
      expect(new Date(response.date)).toBeInstanceOf(Date);
    });

    it('should throw an error for non-existent alert', async () => {
      try {
        await firstValueFrom(client.send('findOneAlert', 999));
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('updateAlert', () => {
    it('should update an alert', async () => {
      const updateAlertDto = {
        id: createdAlertId,
        title: 'Updated Alert',
      };

      const response = await firstValueFrom(
        client.send('updateAlert', updateAlertDto),
      );

      expect(response).toMatchObject({
        id: createdAlertId,
        title: 'Updated Alert',
      });
    });

    it('should throw an error for non-existent alert', async () => {
      const updateAlertDto = {
        id: 999,
        title: 'Updated Alert',
      };

      try {
        await firstValueFrom(client.send('updateAlert', updateAlertDto));
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('removeAlert', () => {
    it('should remove an alert', async () => {
      const response = await firstValueFrom(
        client.send('removeAlert', createdAlertId),
      );
      expect(response).toBeDefined();
      expect(response.id).toBe(createdAlertId);
      expect(response.deleted).toBe(true);

      // Verify the alert is actually deleted
      try {
        await firstValueFrom(client.send('findOneAlert', createdAlertId));
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw an error for non-existent alert', async () => {
      try {
        await firstValueFrom(client.send('removeAlert', 999));
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
