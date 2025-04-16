import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from '../rbac/role/role.entity';

export class SignUpDto {
  @IsOptional()
  username?: string;

  @IsEmail()
  email: string;

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

  @IsBoolean()
  acceptedTerms: boolean;

  @IsBoolean()
  acceptedPrivacyPolicy: boolean;

  @IsOptional()
  role?: Role;
}
