import { Role } from '@/auth/rbac/role/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the user',
    nullable: true,
  })
  username?: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile picture URL',
    nullable: true,
  })
  profilePicture?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user accepted the terms',
  })
  acceptedTerms: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user accepted the privacy policy',
  })
  acceptedPrivacyPolicy: boolean;

  @ApiProperty({
    example: '2024-02-20T10:00:00.000Z',
    description: 'User account creation date',
  })
  @ApiProperty({ description: 'Role of the user', type: () => Role })
  role: Role;
}
