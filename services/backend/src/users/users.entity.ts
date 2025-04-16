import { Role } from '../auth/rbac/role/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['email'])
@Unique(['username'])
export class User {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the user',
    nullable: true,
  })
  @Column({ nullable: true })
  username?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: 'hashedPassword123',
    description: 'Hashed password of the user',
    nullable: true,
  })
  @Column({ nullable: true })
  password?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Google ID of the user if signed in with Google',
    nullable: true,
  })
  @Column({ nullable: true })
  googleId?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user account is active',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: "URL of the user's profile picture",
    nullable: true,
  })
  @Column({ nullable: true })
  profilePicture?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user accepted the terms of service',
  })
  @Column({ default: false })
  acceptedTerms: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user accepted the privacy policy',
  })
  @Column({ default: false })
  acceptedPrivacyPolicy: boolean;

  @ApiProperty({
    example: '2024-02-20T10:00:00.000Z',
    description: 'Date when the user account was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Role assigned to the user', type: () => Role })
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
