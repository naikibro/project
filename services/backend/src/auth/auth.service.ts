import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/users.entity';
import { Role } from './rbac/role/role.entity';

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

    // TODO : later : Send email with password reset link
  }

  resetPassword(token: string, newPassword: string) {
    // TODO : later : Implement password reset
    return { token, newPassword };
  }
}
