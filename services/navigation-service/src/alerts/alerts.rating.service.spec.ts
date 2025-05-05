/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsRatingService } from './alerts.rating.service';
import { AlertsService } from './alerts.service';
import { AlertRating } from './entities/alert.rating.entity';
import { Alert } from './entities/alert.entity';
import { NotFoundException } from '@nestjs/common';

describe('AlertsRatingService', () => {
  let service: AlertsRatingService;
  let alertsService: AlertsService;
  let alertRatingRepository: Repository<AlertRating>;

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
  } as AlertRating;

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
      ],
    }).compile();

    service = module.get<AlertsRatingService>(AlertsRatingService);
    alertsService = module.get<AlertsService>(AlertsService);
    alertRatingRepository = module.get<Repository<AlertRating>>(
      getRepositoryToken(AlertRating),
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
        service.rateAlert({ alertId: 1, isUpvote: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new rating when none exists', async () => {
      jest.spyOn(alertsService, 'findOne').mockResolvedValue(mockAlert);
      jest.spyOn(alertRatingRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(alertRatingRepository, 'create').mockReturnValue({
        alertId: 1,
        upvotes: 1,
        downvotes: 0,
      } as AlertRating);
      jest.spyOn(alertRatingRepository, 'save').mockResolvedValue({
        id: 1,
        alertId: 1,
        upvotes: 1,
        downvotes: 0,
      } as AlertRating);

      const result = await service.rateAlert({ alertId: 1, isUpvote: true });

      expect(result).toEqual({
        id: 1,
        alertId: 1,
        upvotes: 1,
        downvotes: 0,
      });
      expect(alertRatingRepository.create).toHaveBeenCalledWith({
        alertId: 1,
        upvotes: 1,
        downvotes: 0,
      });
    });

    it('should update existing rating with upvote', async () => {
      jest
        .spyOn(alertsService, 'findOne')
        .mockResolvedValue({ ...mockAlert, ratings: [] });
      jest
        .spyOn(alertRatingRepository, 'findOne')
        .mockResolvedValue({ ...mockAlertRating });
      jest.spyOn(alertRatingRepository, 'save').mockImplementation((rating) =>
        Promise.resolve({
          ...mockAlertRating,
          ...rating,
          id: mockAlertRating.id,
          alert: mockAlert,
        } as AlertRating),
      );

      const result = await service.rateAlert({ alertId: 1, isUpvote: true });

      expect(result.upvotes).toBe(mockAlertRating.upvotes + 1);
      expect(result.downvotes).toBe(mockAlertRating.downvotes);
    });

    it('should update existing rating with downvote', async () => {
      jest
        .spyOn(alertsService, 'findOne')
        .mockResolvedValue({ ...mockAlert, ratings: [] });
      jest
        .spyOn(alertRatingRepository, 'findOne')
        .mockResolvedValue({ ...mockAlertRating });
      jest.spyOn(alertRatingRepository, 'save').mockImplementation((rating) =>
        Promise.resolve({
          ...mockAlertRating,
          ...rating,
          id: mockAlertRating.id,
          alert: mockAlert,
        } as AlertRating),
      );

      const result = await service.rateAlert({ alertId: 1, isUpvote: false });

      expect(result.upvotes).toBe(mockAlertRating.upvotes);
      expect(result.downvotes).toBe(mockAlertRating.downvotes + 1);
    });
  });

  describe('getAlertRatingsFromAlertId', () => {
    it('should return ratings for a specific alert', async () => {
      const mockRatings = [mockAlertRating];
      jest.spyOn(alertRatingRepository, 'find').mockResolvedValue(mockRatings);

      const result = await service.getAlertRatingsFromAlertId(1);

      expect(result).toEqual(mockRatings);
      expect(alertRatingRepository.find).toHaveBeenCalledWith({
        where: { alertId: 1 },
      });
    });
  });

  describe('getAverageAlertRating', () => {
    it('should calculate average rating correctly', async () => {
      const mockRatings = [
        { upvotes: 5, downvotes: 2 },
        { upvotes: 3, downvotes: 1 },
      ] as AlertRating[];
      jest.spyOn(alertRatingRepository, 'find').mockResolvedValue(mockRatings);

      const result = await service.getAverageAlertRating(1);

      // Total votes: (5+2) + (3+1) = 11
      // Number of ratings: 2
      // Average: 11/2 = 5.5
      expect(result).toBe(5.5);
    });

    it('should return 0 when no ratings exist', async () => {
      jest.spyOn(alertRatingRepository, 'find').mockResolvedValue([]);

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
