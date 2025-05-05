import { IsNumber, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertAlertRatingDto {
  @ApiProperty({ description: 'The ID of the alert to rate' })
  @IsNumber()
  alertId: number;

  @ApiProperty({
    description: 'Whether this is an upvote (true) or downvote (false)',
  })
  @IsBoolean()
  isUpvote: boolean;

  @ApiProperty({
    description: 'The ID of the user submitting the rating',
  })
  @IsString()
  userId: string;
}
