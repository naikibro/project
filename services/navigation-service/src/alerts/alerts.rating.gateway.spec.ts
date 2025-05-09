/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsRatingGateway } from './alerts.rating.gateway';
import { AlertsRatingService } from './alerts.rating.service';
import { UpsertAlertRatingDto } from './dto/upsert-alert-rating.dto';

describe('AlertsRatingGateway', () => {
  let gateway: AlertsRatingGateway;
  let service: AlertsRatingService;

  const mockService = {
    rateAlert: jest.fn(),
    getAlertRatingsFromAlertId: jest.fn(),
    getAverageAlertRating: jest.fn(),
    getAllAlertRatings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsRatingGateway,
        { provide: AlertsRatingService, useValue: mockService },
      ],
    }).compile();

    gateway = module.get<AlertsRatingGateway>(AlertsRatingGateway);
    service = module.get<AlertsRatingService>(AlertsRatingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should call rateAlert on service', async () => {
    const dto: UpsertAlertRatingDto = {
      alertId: 1,
      isUpvote: true,
      userId: '',
    };
    (service.rateAlert as jest.Mock).mockResolvedValue('result');
    const result = await gateway.rateAlert(dto);
    expect(service.rateAlert).toHaveBeenCalledWith(dto);
    expect(result).toBe('result');
  });

  it('should call getAlertRatingsFromAlertId on service', async () => {
    (service.getAlertRatingsFromAlertId as jest.Mock).mockResolvedValue(
      'ratings',
    );
    const result = await gateway.getAlertRatings(42);
    expect(service.getAlertRatingsFromAlertId).toHaveBeenCalledWith(42);
    expect(result).toBe('ratings');
  });

  it('should call getAverageAlertRating on service', async () => {
    (service.getAverageAlertRating as jest.Mock).mockResolvedValue(3.5);
    const result = await gateway.getAverageAlertRating(42);
    expect(service.getAverageAlertRating).toHaveBeenCalledWith(42);
    expect(result).toBe(3.5);
  });

  it('should call getAllAlertRatings on service', async () => {
    (service.getAllAlertRatings as jest.Mock).mockResolvedValue(['a', 'b']);
    const result = await gateway.getAllAlertRatings();
    expect(service.getAllAlertRatings).toHaveBeenCalled();
    expect(result).toEqual(['a', 'b']);
  });
});
