import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../auth/rbac/role/role.entity';
import { User } from './users.entity';
import { isValidEmail } from '../utils/mails/mails.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async createUser(user: User): Promise<User> {
    if (!user.username || !user.email || !user.password) {
      throw new BadRequestException(
        'Username, email, and password are required',
      );
    }

    if (!isValidEmail(user.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { username: user.username },
    });
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(user.password, 10);
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Password hashing failed',
      );
    }

    const defaultRole = await this.rolesRepository.findOne({
      where: { name: 'User' },
    });
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }

    const newUser: User = this.usersRepository.create({
      username: user.username,
      password: hashedPassword,
      email: user.email,
      isActive: true,
      acceptedTerms: false,
      acceptedPrivacyPolicy: false,
      createdAt: new Date(),
      role: user.role || defaultRole,
    });

    return this.usersRepository.save(newUser);
  }

  async getUser(username: string): Promise<User> {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('email is required');
    }
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({ relations: ['role'] });
    return users;
  }

  async updateUserByEmail(
    email: string,
    updates: Partial<User>,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    await this.usersRepository.save({ ...existingUser, ...updates });

    const updatedUser = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async updateUser(username: string, updates: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { username: username },
    });
    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    await this.usersRepository.save({ ...existingUser, ...updates });

    const updatedUser = await this.usersRepository.findOne({
      where: { username: updates.username },
      relations: ['role'],
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async deleteUserByEmail(authenticatedEmail: string) {
    const user = await this.usersRepository.findOne({
      where: { email: authenticatedEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }
    await this.usersRepository.remove(existingUser);
  }
}
