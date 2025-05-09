import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlertsRatingService } from './alerts.rating.service';
import { UpsertAlertRatingDto } from './dto/upsert-alert-rating.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Claims } from '../auth/rbac/claims.decorator';
import { Claim } from '../auth/rbac/claims.enum';

@ApiTags('Alert Ratings')
@Controller('alerts')
export class AlertsRatingController {
  constructor(private readonly alertsRatingService: AlertsRatingService) {}

  @Get('ratings/all')
  @ApiOperation({ summary: 'Get all alert ratings' })
  @ApiResponse({ status: 200, description: 'Returns all alert ratings' })
  getAllAlertRatings() {
    const ratings = this.alertsRatingService.getAllAlertRatings();

    return ratings;
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Claims(Claim.WRITE_OWN_ALERT)
  @ApiOperation({ summary: 'Rate an alert' })
  @ApiResponse({
    status: 200,
    description: 'The alert has been successfully rated.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  rateAlert(
    @Param('id') id: string,
    @Body() rateAlertDto: UpsertAlertRatingDto,
  ) {
    rateAlertDto.alertId = +id;
    // Get the updated rating object after rating
    this.alertsRatingService.rateAlert(rateAlertDto);
    // Return the updated rating for this alert
    return this.alertsRatingService.getAlertRatingsFromAlertId(+id);
  }

  @Get(':id/ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Claims(Claim.READ_OWN_ALERT)
  @ApiOperation({ summary: 'Get alert ratings from alert id' })
  @ApiResponse({ status: 200, description: 'Returns alert ratings' })
  getAlertRatings(@Param('id') id: string) {
    return this.alertsRatingService.getAlertRatingsFromAlertId(+id);
  }

  @Get(':id/ratings/average')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Claims(Claim.READ_OWN_ALERT)
  @ApiOperation({ summary: 'Get average alert rating from alert id' })
  @ApiResponse({ status: 200, description: 'Returns average alert rating' })
  getAverageAlertRating(@Param('id') id: string) {
    return this.alertsRatingService.getAverageAlertRating(+id);
  }
}
