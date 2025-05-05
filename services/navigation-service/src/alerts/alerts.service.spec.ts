/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from './alerts.service';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { NotFoundException } from '@nestjs/common';
import { AlertType } from './entities/alert.type';
describe('AlertsService', () => {
  let service: AlertsService;
  let repository: Repository<Alert>;

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
    ratings: [],
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
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockAlert]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Alert),
          useValue: {
            create: jest.fn().mockReturnValue(mockAlert),
            save: jest.fn().mockResolvedValue(mockAlert),
            find: jest.fn().mockResolvedValue([mockAlert]),
            findOne: jest.fn().mockResolvedValue(mockAlert),
            findAlertsNearMe: jest.fn().mockResolvedValue([mockAlert]),
            remove: jest.fn().mockResolvedValue(mockAlert),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get<Repository<Alert>>(getRepositoryToken(Alert));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new alert', async () => {
      const result = await service.create(mockCreateAlertDto);
      expect(repository.create).toHaveBeenCalledWith(mockCreateAlertDto);
      expect(repository.save).toHaveBeenCalledWith(mockAlert);
      expect(result).toEqual(mockAlert);
    });
  });

  describe('findAll', () => {
    it('should return an array of alerts', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockAlert]);
    });
  });

  describe('findOne', () => {
    it('should return a single alert', async () => {
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAlertsNearMe', () => {
    it('should return alerts near the given coordinates', async () => {
      const result = await service.findAlertsNearMe(38.89768, -77.03655);
      expect(result).toEqual([mockAlert]);
    });
  });

  describe('update', () => {
    it('should update an alert', async () => {
      const updatedAlert = { ...mockAlert, ...mockUpdateAlertDto };
      jest.spyOn(repository, 'save').mockResolvedValue(updatedAlert);

      const result = await service.update(1, mockUpdateAlertDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith(updatedAlert);
      expect(result).toEqual(updatedAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.update(999, mockUpdateAlertDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an alert', async () => {
      await service.remove(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
