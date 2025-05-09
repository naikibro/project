import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpsertAlertRatingDto } from './dto/upsert-alert-rating.dto';
import { Observable, of } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { AlertRating } from './entities/alert.rating.entity';

@Injectable()
export class AlertsRatingService {
  constructor(
    @Inject('NAVIGATION_SERVICE')
    private readonly clientProxy: ClientProxy,
  ) {}

  rateAlert(upsertAlertRatingDto: UpsertAlertRatingDto) {
    return this.clientProxy.send('rate-alert', upsertAlertRatingDto).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed to rate alert:', err);
        return of(null);
      }),
    );
  }

  getAlertRatingsFromAlertId(alertId: number): Observable<AlertRating[]> {
    return this.clientProxy
      .send<AlertRating[]>('get-alert-ratings', alertId)
      .pipe(
        retry(3),
        catchError((err) => {
          console.error('Failed to get alert ratings:', err);
          return of([]);
        }),
      );
  }

  getAverageAlertRating(alertId: number) {
    return this.clientProxy.send('get-average-alert-rating', alertId).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed to get average alert rating:', err);
        return of(null);
      }),
    );
  }

  getAllAlertRatings() {
    const ratings = this.clientProxy.send('get-all-alert-ratings', {}).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed to get all alert ratings:', err);
        return of([]);
      }),
    );
    return ratings;
  }
}
