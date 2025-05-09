import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('alert_user_ratings')
export class AlertUserRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alertId: number;

  @Column()
  userId: string;

  @Column()
  isUpvote: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
