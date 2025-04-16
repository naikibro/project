import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from '../rbac/role/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'Username of the user',
    required: false,
    example: 'johndoe',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Email address of the user',
    required: true,
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    required: true,
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Whether the user has accepted the terms of service',
    required: true,
    example: true,
  })
  @IsBoolean()
  acceptedTerms: boolean;

  @ApiProperty({
    description: 'Whether the user has accepted the privacy policy',
    required: true,
    example: true,
  })
  @IsBoolean()
  acceptedPrivacyPolicy: boolean;

  @ApiProperty({
    description: 'Role of the user',
    required: false,
    type: Role,
  })
  @IsOptional()
  role?: Role;
}
