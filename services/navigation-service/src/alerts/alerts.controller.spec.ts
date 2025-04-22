/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertType } from './entities/alert.type';

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: AlertsService;

  const mockAlert: Alert = {
    id: 1,
    title: 'Test Alert',
    coordinates: {
      longitude: -77.03655,
      latitude: 38.89768,
      accuracy: 'rooftop',
    },
    description: 'Test Description',
    type: AlertType.INFO,
    date: new Date(),
    locationContext: {
      address: undefined,
      place: undefined,
      region: undefined,
      country: undefined,
    },
  };

  const mockCreateAlertDto: CreateAlertDto = {
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

  const mockUpdateAlertDto: UpdateAlertDto = {
    id: 1,
    title: 'Updated Alert',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAlert),
            findAll: jest.fn().mockResolvedValue([mockAlert]),
            findOne: jest.fn().mockResolvedValue(mockAlert),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockAlert, ...mockUpdateAlertDto }),
            remove: jest.fn().mockResolvedValue(mockAlert),
          },
        },
      ],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new alert', async () => {
      const result = await controller.create(mockCreateAlertDto);
      expect(service.create).toHaveBeenCalledWith(mockCreateAlertDto);
      expect(result).toEqual(mockAlert);
    });
  });

  describe('findAll', () => {
    it('should return an array of alerts', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockAlert]);
    });
  });

  describe('findOne', () => {
    it('should return a single alert', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAlert);
    });
  });

  describe('update', () => {
    it('should update an alert', async () => {
      const result = await controller.update(mockUpdateAlertDto);
      expect(service.update).toHaveBeenCalledWith(
        mockUpdateAlertDto.id,
        mockUpdateAlertDto,
      );
      expect(result).toEqual({ ...mockAlert, ...mockUpdateAlertDto });
    });
  });

  describe('remove', () => {
    it('should remove an alert', async () => {
      const result = await controller.removeAlert(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, deleted: true });
    });
  });
});
