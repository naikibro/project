import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from '../entities/alert.type';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Accuracy of the coordinates' })
  @IsString()
  accuracy:
    | 'rooftop'
    | 'parcel'
    | 'point'
    | 'interpolated'
    | 'approximate'
    | 'intersection';
}

class LocationContextDto {
  @ApiProperty({ description: 'Address information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: {
    address_number?: string;
    street_name?: string;
    name?: string;
  };

  @ApiProperty({ description: 'Place information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => PlaceDto)
  place?: {
    name: string;
    wikidata_id?: string;
  };

  @ApiProperty({ description: 'Region information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => RegionDto)
  region?: {
    name: string;
    region_code?: string;
  };

  @ApiProperty({ description: 'Country information', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => CountryDto)
  country?: {
    name: string;
    country_code?: string;
  };
}

class AddressDto {
  @ApiProperty({ required: false })
  address_number?: string;

  @ApiProperty({ required: false })
  street_name?: string;

  @ApiProperty({ required: false })
  name?: string;
}

class PlaceDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  wikidata_id?: string;
}

class RegionDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  region_code?: string;
}

class CountryDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  country_code?: string;
}

export class CreateAlertDto {
  @ApiProperty({ description: 'The title of the alert' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The coordinates of the alert location' })
  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @ApiProperty({
    description: 'The context of the alert location',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationContextDto)
  locationContext?: LocationContextDto;

  @ApiProperty({ description: 'The description of the alert' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The type of the alert', enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({ description: 'The date of the alert' })
  @IsNotEmpty()
  date: Date;
}
