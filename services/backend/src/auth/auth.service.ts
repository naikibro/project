/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Role } from './rbac/role/role.entity';
import { OAuth2Client, TokenPayload, LoginTicket } from 'google-auth-library';
import { UsersService } from '../users/users.service';

interface GoogleProfile {
  email: string;
  googleId: string;
  username: string;
  picture: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    private jwtService: JwtService,

    @Inject('MAILER_SERVICE')
    private clientProxy: ClientProxy,

    private readonly usersService: UsersService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials are not configured');
    }

    this.googleClient = new OAuth2Client(clientId, clientSecret);
  }

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

    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    await this.usersRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: tokenExpiry,
    });

    this.clientProxy.emit('sendEmail', {
      to: user.email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the following link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    this.clientProxy.emit('sendEmail', {
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset. If you did not perform this action, please contact support immediately.',
    });
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

  async handleGoogleMobileLogin(idToken: string) {
    console.log('idToken', idToken);
    try {
      const ticket: LoginTicket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload: TokenPayload | undefined = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, sub: googleId, name: username, picture } = payload;
      if (!email) {
        throw new UnauthorizedException('Email not found in Google token');
      }

      // Find or create user
      let user: User | null = await this.usersRepository.findOne({
        where: [{ email }, { googleId }],
        relations: ['role'],
      });

      if (!user) {
        const defaultRole = await this.rolesRepository.findOne({
          where: { name: 'User' },
        });
        if (!defaultRole) {
          throw new InternalServerErrorException('Default role not found');
        }

        user = this.usersRepository.create({
          email,
          googleId,
          username: username || email.split('@')[0],
          profilePicture: picture,
          role: defaultRole,
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
          isActive: true,
        });
        await this.usersRepository.save(user);
      } else {
        // Update user if needed
        const updates: Partial<User> = {};
        if (picture && user.profilePicture !== picture) {
          updates.profilePicture = picture;
        }
        if (googleId && user.googleId !== googleId) {
          updates.googleId = googleId;
        }
        if (Object.keys(updates).length > 0) {
          await this.usersRepository.update(user.id, updates);
          user = await this.usersRepository.findOne({
            where: { id: user.id },
            relations: ['role'],
          });
        }
      }

      if (!user || !user.id) {
        throw new InternalServerErrorException(
          'Failed to create or update user',
        );
      }

      // Generate JWT token
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role.name,
      });

      return {
        accessToken,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
