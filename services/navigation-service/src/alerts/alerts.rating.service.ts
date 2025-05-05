import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from './alerts.service';
import { UpsertAlertRatingDto } from './dto/upsert-alert.dto';
import { AlertRating } from './entities/alert.rating.entity';

@Injectable()
export class AlertsRatingService {
  constructor(
    private readonly alertsService: AlertsService,
    @InjectRepository(AlertRating)
    private readonly alertRatingRepository: Repository<AlertRating>,
  ) {}

  async rateAlert(upsertAlertRatingDto: UpsertAlertRatingDto) {
    // Check if alert exists
    const alert = await this.alertsService.findOne(
      upsertAlertRatingDto.alertId,
    );
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    // Find existing rating or create new one
    let alertRating = await this.alertRatingRepository.findOne({
      where: { alertId: upsertAlertRatingDto.alertId },
    });

    if (!alertRating) {
      // Create new rating
      alertRating = this.alertRatingRepository.create({
        alertId: upsertAlertRatingDto.alertId,
        upvotes: upsertAlertRatingDto.isUpvote ? 1 : 0,
        downvotes: upsertAlertRatingDto.isUpvote ? 0 : 1,
      });
    } else {
      // Update existing rating
      if (upsertAlertRatingDto.isUpvote) {
        alertRating.upvotes = (alertRating.upvotes || 0) + 1;
      } else {
        alertRating.downvotes = (alertRating.downvotes || 0) + 1;
      }
    }

    // Save the rating
    return this.alertRatingRepository.save(alertRating);
  }

  getAlertRatingsFromAlertId(alertId: number) {
    return this.alertRatingRepository.find({
      where: { alertId },
    });
  }

  async getAverageAlertRating(alertId: number) {
    const ratings = await this.getAlertRatingsFromAlertId(alertId);
    if (ratings.length === 0) {
      return 0;
    }
    const totalRatings = ratings.reduce(
      (acc, rating) => acc + (rating.upvotes || 0) + (rating.downvotes || 0),
      0,
    );
    return totalRatings / ratings.length;
  }

  async getAllAlertRatings() {
    const ratings = await this.alertRatingRepository.find();
    return ratings;
  }
}
