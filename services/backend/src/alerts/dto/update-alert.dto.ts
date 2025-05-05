import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertDto } from './create-alert.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertDto extends PartialType(CreateAlertDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the alert' })
  id: number;
}
