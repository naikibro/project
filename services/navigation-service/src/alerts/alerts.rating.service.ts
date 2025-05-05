import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from './alerts.service';
import { UpsertAlertRatingDto } from './dto/upsert-alert-rating.dto';
import { AlertRating } from './entities/alert.rating.entity';
import { AlertUserRating } from './entities/alert.user.rating.entity';

@Injectable()
export class AlertsRatingService {
  constructor(
    private readonly alertsService: AlertsService,
    @InjectRepository(AlertRating)
    private readonly alertRatingRepository: Repository<AlertRating>,
    @InjectRepository(AlertUserRating)
    private readonly alertUserRatingRepository: Repository<AlertUserRating>,
  ) {}

  async rateAlert(upsertAlertRatingDto: UpsertAlertRatingDto) {
    // Check if alert exists
    const alert = await this.alertsService.findOne(
      upsertAlertRatingDto.alertId,
    );
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    // Check if user has already rated this alert
    const existingUserRating = await this.alertUserRatingRepository.findOne({
      where: {
        alertId: upsertAlertRatingDto.alertId,
        userId: upsertAlertRatingDto.userId,
      },
    });

    if (existingUserRating) {
      // If user is trying to vote the same way again
      if (existingUserRating.isUpvote === upsertAlertRatingDto.isUpvote) {
        throw new ConflictException('You have already voted this way');
      }

      // If user is changing their vote, modify the alert user rating
      await this.upsertAlertRating(upsertAlertRatingDto, true);
    } else {
      // Create new user rating
      const userRating = this.alertUserRatingRepository.create({
        alertId: upsertAlertRatingDto.alertId,
        userId: upsertAlertRatingDto.userId,
        isUpvote: upsertAlertRatingDto.isUpvote,
      });
      await this.alertUserRatingRepository.save(userRating);
    }

    // Return the updated ratings
    const updatedRatings = await this.alertRatingRepository.find({
      where: { alertId: upsertAlertRatingDto.alertId },
    });
    return updatedRatings;
  }

  private async upsertAlertRating(
    upsertAlertRatingDto: UpsertAlertRatingDto,
    isVoteChange: boolean,
  ) {
    const alertUserRating = await this.alertUserRatingRepository.findOne({
      where: {
        alertId: upsertAlertRatingDto.alertId,
        userId: upsertAlertRatingDto.userId,
      },
    });

    if (alertUserRating) {
      // If user is changing their vote, modify the alert user rating
      if (isVoteChange) {
        alertUserRating.isUpvote = upsertAlertRatingDto.isUpvote;
        await this.alertUserRatingRepository.save(alertUserRating);
      }
    } else {
      // Create new user rating
      const newUserRating = this.alertUserRatingRepository.create({
        alertId: upsertAlertRatingDto.alertId,
        userId: upsertAlertRatingDto.userId,
        isUpvote: upsertAlertRatingDto.isUpvote,
      });
      await this.alertUserRatingRepository.save(newUserRating);
    }
  }

  async getAlertRatingsFromAlertId(alertId: number) {
    const upvotes = await this.alertUserRatingRepository.count({
      where: { alertId, isUpvote: true },
    });
    const downvotes = await this.alertUserRatingRepository.count({
      where: { alertId, isUpvote: false },
    });

    const alert = await this.alertsService.findOne(alertId);

    const resultAlertRating: AlertRating = {
      alertId,
      upvotes,
      downvotes,
      id: 0,
      alert: alert,
    };
    return resultAlertRating;
  }

  async getAverageAlertRating(alertId: number) {
    const ratings = await this.getAlertRatingsFromAlertId(alertId);
    if (ratings.downvotes === 0 && ratings.upvotes === 0) {
      return 0;
    }
    const totalRatings = ratings.upvotes + ratings.downvotes;
    return totalRatings / 2;
  }

  async getAllAlertRatings() {
    const ratings = await this.alertRatingRepository.find();
    return ratings;
  }
}
