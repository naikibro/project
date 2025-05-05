import { MessagePattern } from '@nestjs/microservices';
import { UpsertAlertRatingDto } from './dto/upsert-alert-rating.dto';
import { AlertsRatingService } from './alerts.rating.service';
import { Controller } from '@nestjs/common';

@Controller()
export class AlertsRatingGateway {
  constructor(private readonly alertsRatingService: AlertsRatingService) {}

  @MessagePattern('rate-alert')
  rateAlert(upsertAlertRatingDto: UpsertAlertRatingDto) {
    return this.alertsRatingService.rateAlert(upsertAlertRatingDto);
  }

  @MessagePattern('get-alert-ratings')
  getAlertRatings(alertId: number) {
    return this.alertsRatingService.getAlertRatingsFromAlertId(alertId);
  }

  @MessagePattern('get-average-alert-rating')
  getAverageAlertRating(alertId: number) {
    return this.alertsRatingService.getAverageAlertRating(alertId);
  }

  @MessagePattern('get-all-alert-ratings')
  getAllAlertRatings() {
    return this.alertsRatingService.getAllAlertRatings();
  }
}
