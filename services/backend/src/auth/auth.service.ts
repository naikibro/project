import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Role } from './rbac/role/role.entity';

interface GoogleProfile {
  email: string;
  googleId: string;
  username: string;
  picture: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ accessToken: string }> {
    const {
      username,
      email,
      password,
      acceptedTerms,
      acceptedPrivacyPolicy,
      role,
    } = signUpDto;

    if (!acceptedTerms || !acceptedPrivacyPolicy) {
      throw new BadRequestException(
        'You must accept the terms and privacy policy',
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email or username is already taken');
    }

    const defaultRole = await this.rolesRepository.findOne({
      where: { name: 'User' },
    });
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: User = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      acceptedTerms,
      acceptedPrivacyPolicy,
      role: role ?? defaultRole,
    });

    try {
      const savedUser: User = await this.usersRepository.save(user);

      if (!savedUser.id) {
        throw new InternalServerErrorException('User ID missing after save');
      }

      const accessToken: string = await this.jwtService.signAsync({
        userId: savedUser.id,
        role: defaultRole,
      });
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; user: User }> {
    const { email, password } = signInDto;

    const user: User | null = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.id) {
      throw new InternalServerErrorException('User ID is missing');
    }

    const accessToken: string = await this.jwtService.signAsync({
      userId: user.id,
      role: user.role.name,
    });
    return { accessToken, user };
  }

  async forgotPassword(email: string): Promise<void> {
    const user: User | null = await this.usersRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  resetPassword(token: string, newPassword: string) {
    return { token, newPassword };
  }

  /**
   * Handles Google OAuth login flow
   * @param profile - Google profile information containing email, googleId, username and picture
   * @returns Promise containing access token and user information
   * @throws InternalServerErrorException if default role is not found
   */
  async handleGoogleLogin(
    profile: GoogleProfile,
  ): Promise<{ accessToken: string; user: User }> {
    const { email, googleId, username, picture } = profile;

    const defaultRole = await this.rolesRepository.findOne({
      where: { name: 'User' },
    });

    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }

    let user = await this.usersRepository.findOne({
      where: [{ email }, { googleId }],
      relations: ['role'],
    });

    if (!user) {
      user = this.usersRepository.create({
        email,
        username: username || email.split('@')[0],
        googleId,
        profilePicture: picture,
        role: defaultRole,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        isActive: true,
      });
      await this.usersRepository.save(user);
    } else {
      const updates: Partial<User> = {
        role: user.role || defaultRole,
      };

      if (picture && user.profilePicture !== picture) {
        updates.profilePicture = picture;
      }

      if (googleId && user.googleId !== googleId) {
        updates.googleId = googleId;
      }

      if (Object.keys(updates).length > 0) {
        await this.usersRepository.update(user.id, updates);
        user = (await this.usersRepository.findOne({
          where: { id: user.id },
          relations: ['role'],
        })) as User;
      }
    }

    if (!user || !user.id) {
      throw new InternalServerErrorException('Failed to create or update user');
    }

    const accessToken = await this.jwtService.signAsync({
      userId: user.id,
      role: user.role.name,
    });

    return { accessToken, user };
  }
}
