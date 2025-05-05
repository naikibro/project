/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsRatingService } from './alerts.rating.service';
import { AlertsService } from './alerts.service';
import { AlertRating } from './entities/alert.rating.entity';
import { Alert } from './entities/alert.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AlertUserRating } from './entities/alert.user.rating.entity';

describe('AlertsRatingService', () => {
  let service: AlertsRatingService;
  let alertsService: AlertsService;
  let alertRatingRepository: Repository<AlertRating>;
  let alertUserRatingRepository: Repository<AlertUserRating>;

  const mockAlert = {
    id: 1,
    title: 'Test Alert',
    description: 'Test Description',
    type: 'info',
    date: new Date(),
    coordinates: {
      latitude: 0,
      longitude: 0,
      accuracy: 'rooftop',
    },
  } as Alert;

  const mockAlertRating = {
    id: 1,
    alertId: 1,
    upvotes: 5,
    downvotes: 2,
    alert: mockAlert,
  } as AlertRating;

  const mockUserRating = {
    id: 1,
    alertId: 1,
    userId: 'test-user',
    isUpvote: true,
    createdAt: new Date(),
  } as AlertUserRating;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsRatingService,
        {
          provide: AlertsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AlertRating),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AlertUserRating),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlertsRatingService>(AlertsRatingService);
    alertsService = module.get<AlertsService>(AlertsService);
    alertRatingRepository = module.get<Repository<AlertRating>>(
      getRepositoryToken(AlertRating),
    );
    alertUserRatingRepository = module.get<Repository<AlertUserRating>>(
      getRepositoryToken(AlertUserRating),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rateAlert', () => {
    it('should throw NotFoundException when alert does not exist', async () => {
      jest
        .spyOn(alertsService, 'findOne')
        .mockResolvedValue(null as unknown as Alert);

      await expect(
        service.rateAlert({
          alertId: 1,
          isUpvote: true,
          userId: 'test-user',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new rating when none exists', async () => {
      jest.spyOn(alertsService, 'findOne').mockResolvedValue(mockAlert);
      jest.spyOn(alertUserRatingRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(alertUserRatingRepository, 'create')
        .mockReturnValue(mockUserRating);
      jest
        .spyOn(alertUserRatingRepository, 'save')
        .mockResolvedValue(mockUserRating);
      jest
        .spyOn(alertRatingRepository, 'find')
        .mockResolvedValue([mockAlertRating]);

      const result = await service.rateAlert({
        alertId: 1,
        isUpvote: true,
        userId: 'test-user',
      });

      expect(result).toEqual([mockAlertRating]);
      expect(alertUserRatingRepository.create).toHaveBeenCalledWith({
        alertId: 1,
        userId: 'test-user',
        isUpvote: true,
      });
    });

    it('should throw ConflictException when user has already voted the same way', async () => {
      jest.spyOn(alertsService, 'findOne').mockResolvedValue(mockAlert);
      jest.spyOn(alertUserRatingRepository, 'findOne').mockResolvedValue({
        ...mockUserRating,
        isUpvote: true,
      });

      await expect(
        service.rateAlert({
          alertId: 1,
          isUpvote: true,
          userId: 'test-user',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update existing rating when changing vote', async () => {
      jest.spyOn(alertsService, 'findOne').mockResolvedValue(mockAlert);
      jest.spyOn(alertUserRatingRepository, 'findOne').mockResolvedValue({
        ...mockUserRating,
        isUpvote: true,
      });
      jest
        .spyOn(alertUserRatingRepository, 'save')
        .mockImplementation((rating) =>
          Promise.resolve({
            ...mockUserRating,
            ...rating,
          } as AlertUserRating),
        );
      jest
        .spyOn(alertRatingRepository, 'find')
        .mockResolvedValue([mockAlertRating]);

      const result = await service.rateAlert({
        alertId: 1,
        isUpvote: false,
        userId: 'test-user',
      });

      expect(result).toEqual([mockAlertRating]);
      expect(alertUserRatingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          alertId: 1,
          userId: 'test-user',
          isUpvote: false,
        }),
      );
    });
  });

  describe('getAlertRatingsFromAlertId', () => {
    it('should return ratings for a specific alert', async () => {
      jest
        .spyOn(alertUserRatingRepository, 'count')
        .mockResolvedValueOnce(5) // upvotes
        .mockResolvedValueOnce(2); // downvotes
      jest.spyOn(alertsService, 'findOne').mockResolvedValue(mockAlert);

      const result = await service.getAlertRatingsFromAlertId(1);

      expect(result).toEqual({
        alertId: 1,
        upvotes: 5,
        downvotes: 2,
        id: 0,
        alert: mockAlert,
      });
      expect(alertUserRatingRepository.count).toHaveBeenCalledWith({
        where: { alertId: 1, isUpvote: true },
      });
      expect(alertUserRatingRepository.count).toHaveBeenCalledWith({
        where: { alertId: 1, isUpvote: false },
      });
    });
  });

  describe('getAverageAlertRating', () => {
    it('should calculate average rating correctly', async () => {
      jest
        .spyOn(alertUserRatingRepository, 'count')
        .mockResolvedValueOnce(5) // upvotes
        .mockResolvedValueOnce(2); // downvotes

      const result = await service.getAverageAlertRating(1);

      // Total votes: 5 + 2 = 7
      // Average: 7/2 = 3.5
      expect(result).toBe(3.5);
    });

    it('should return 0 when no ratings exist', async () => {
      jest
        .spyOn(alertUserRatingRepository, 'count')
        .mockResolvedValueOnce(0) // upvotes
        .mockResolvedValueOnce(0); // downvotes

      const result = await service.getAverageAlertRating(1);

      expect(result).toBe(0);
    });
  });

  describe('getAllAlertRatings', () => {
    it('should return all alert ratings', async () => {
      const mockRatings = [mockAlertRating];
      jest.spyOn(alertRatingRepository, 'find').mockResolvedValue(mockRatings);

      const result = await service.getAllAlertRatings();

      expect(result).toEqual(mockRatings);
      expect(alertRatingRepository.find).toHaveBeenCalled();
    });
  });
});
