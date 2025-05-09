import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alert } from './alert.entity';

@Entity('alert_ratings')
export class AlertRating {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The ID of the rating' })
  id: number;

  @ManyToOne(() => Alert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alert_id' })
  @ApiProperty({ description: 'The alert this rating belongs to' })
  alert: Alert;

  @Column({ name: 'alert_id' })
  @ApiProperty({ description: 'The ID of the alert' })
  alertId: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of upvotes for this alert' })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of downvotes for this alert' })
  downvotes: number;
}
