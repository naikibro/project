import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AlertType } from './alert.type';
import { AlertRating } from './alert.rating.entity';

@ApiTags('Alerts')
@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The ID of the alert' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The title of the alert' })
  title: string;

  @Column('jsonb')
  @ApiProperty({
    description: 'The coordinates of the alert location',
    example: {
      longitude: -77.03655,
      latitude: 38.89768,
      accuracy: 'rooftop',
    },
  })
  coordinates: {
    longitude: number;
    latitude: number;
    accuracy:
      | 'rooftop'
      | 'parcel'
      | 'point'
      | 'interpolated'
      | 'approximate'
      | 'intersection';
  };

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'The context of the alert location',
    example: {
      address: {
        address_number: '1600',
        street_name: 'Pennsylvania Avenue Northwest',
        name: '1600 Pennsylvania Avenue Northwest',
      },
      place: {
        name: 'Washington',
        wikidata_id: 'Q61',
      },
      region: {
        name: 'District of Columbia',
        region_code: 'DC',
      },
      country: {
        name: 'United States',
        country_code: 'US',
      },
    },
  })
  locationContext: {
    address?: {
      address_number?: string;
      street_name?: string;
      name?: string;
    };
    place?: {
      name: string;
      wikidata_id?: string;
    };
    region?: {
      name: string;
      region_code?: string;
    };
    country?: {
      name: string;
      country_code?: string;
    };
  };

  @Column()
  @ApiProperty({ description: 'The description of the alert' })
  description: string;

  @Column({ type: 'enum', enum: AlertType })
  @ApiProperty({ description: 'The type of the alert' })
  type: AlertType;

  @Column()
  @ApiProperty({ description: 'The date of the alert' })
  date: Date;

  @OneToMany(() => AlertRating, (rating) => rating.alert)
  @ApiProperty({ description: 'The ratings for this alert' })
  ratings: AlertRating[];
}
