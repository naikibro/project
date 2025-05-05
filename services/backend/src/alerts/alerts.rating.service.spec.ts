/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsRatingService } from './alerts.rating.service';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { UpsertAlertRatingDto } from './dto/upsert-alert.dto';

describe('AlertsRatingService', () => {
  let service: AlertsRatingService;
  let clientProxy: ClientProxy;

  const mockClientProxy = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsRatingService,
        { provide: 'NAVIGATION_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<AlertsRatingService>(AlertsRatingService);
    clientProxy = module.get<ClientProxy>('NAVIGATION_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rateAlert should call clientProxy.send with correct args and return observable', (done) => {
    const dto: UpsertAlertRatingDto = { alertId: 1, isUpvote: true };
    const expected = { success: true };
    (clientProxy.send as jest.Mock).mockReturnValue(of(expected));

    service.rateAlert(dto).subscribe((result) => {
      expect(clientProxy.send).toHaveBeenCalledWith('rate-alert', dto);
      expect(result).toEqual(expected);
      done();
    });
  });

  it('rateAlert should handle errors and return null', (done) => {
    const dto: UpsertAlertRatingDto = { alertId: 1, isUpvote: true };
    (clientProxy.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('fail')),
    );

    service.rateAlert(dto).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('getAlertRatingsFromAlertId should call clientProxy.send and return observable', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(of(['rating1', 'rating2']));

    service.getAlertRatingsFromAlertId(42).subscribe((result) => {
      expect(clientProxy.send).toHaveBeenCalledWith('get-alert-ratings', 42);
      expect(result).toEqual(['rating1', 'rating2']);
      done();
    });
  });

  it('getAlertRatingsFromAlertId should handle errors and return null', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('fail')),
    );

    service.getAlertRatingsFromAlertId(42).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('getAverageAlertRating should call clientProxy.send and return observable', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(of(3.5));

    service.getAverageAlertRating(42).subscribe((result) => {
      expect(clientProxy.send).toHaveBeenCalledWith(
        'get-average-alert-rating',
        42,
      );
      expect(result).toBe(3.5);
      done();
    });
  });

  it('getAverageAlertRating should handle errors and return null', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('fail')),
    );

    service.getAverageAlertRating(42).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('getAllAlertRatings should call clientProxy.send and return observable', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(of(['a', 'b']));

    service.getAllAlertRatings().subscribe((result) => {
      expect(clientProxy.send).toHaveBeenCalledWith(
        'get-all-alert-ratings',
        {},
      );
      expect(result).toEqual(['a', 'b']);
      done();
    });
  });

  it('getAllAlertRatings should handle errors and return empty array', (done) => {
    (clientProxy.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('fail')),
    );

    service.getAllAlertRatings().subscribe((result) => {
      expect(result).toEqual([]);
      done();
    });
  });
});
