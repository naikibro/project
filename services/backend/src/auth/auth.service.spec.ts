/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/users.entity';
import { Role } from './rbac/role/role.entity';
import { idOf } from '../utils/test/test.utils';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1, name: 'User' }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(rolesRepository).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw BadRequestException if terms are not accepted', async () => {
      const dto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
      };

      await expect(authService.signUp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(new User());

      const dto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      await expect(authService.signUp(dto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user and return an access token', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      jest.spyOn(usersRepository, 'create').mockImplementation(
        (user) =>
          ({
            ...user,
            id: idOf('testuser'),
            createdAt: new Date(),
          }) as User,
      );

      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce({
        id: idOf('testuser1'),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        createdAt: new Date(),
      } as User);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('test-token');

      const dto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      const result = await authService.signUp(dto);

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if saving user fails', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      jest.spyOn(usersRepository, 'create').mockImplementation(
        (user) =>
          ({
            ...user,
            id: idOf('testuser1'),
          }) as User,
      );

      jest.spyOn(usersRepository, 'save').mockRejectedValueOnce(new Error());

      const dto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      await expect(authService.signUp(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signIn', () => {
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const dto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.signIn(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = new User();
      user.password = await bcrypt.hash('correctpassword', 10);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      const dto: SignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.signIn(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return an access token on successful sign-in', async () => {
      const user = new User();
      const role = new Role();
      role.id = 1;
      role.name = 'User';
      role.claims = [];

      user.id = idOf('testuser1');
      user.password = await bcrypt.hash('password123', 10);
      user.role = role;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('test-token');

      const dto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signIn(dto);

      expect(result).toEqual({ accessToken: 'test-token', user });
    });
  });

  describe('forgotPassword', () => {
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        authService.forgotPassword('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not throw an error if user exists', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(new User());

      await expect(
        authService.forgotPassword('test@example.com'),
      ).resolves.toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should return the provided token and new password', () => {
      const result = authService.resetPassword('test-token', 'newPassword123');

      expect(result).toEqual({
        token: 'test-token',
        newPassword: 'newPassword123',
      });
    });
  });

  describe('handleGoogleLogin', () => {
    const mockGoogleProfile = {
      email: 'test@example.com',
      googleId: '123456789',
      username: 'testuser',
      picture: 'https://example.com/photo.jpg',
    };

    it('should create a new user if not exists', async () => {
      const mockRole = { id: 1, name: 'User' } as Role;
      const mockUser = {
        id: '1',
        email: mockGoogleProfile.email,
        googleId: mockGoogleProfile.googleId,
        username: mockGoogleProfile.username,
        profilePicture: mockGoogleProfile.picture,
        role: mockRole,
        isActive: true,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        createdAt: new Date(),
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'create').mockImplementation(() => mockUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('test-token');

      const result = await authService.handleGoogleLogin(mockGoogleProfile);

      expect(usersRepository.create).toHaveBeenCalledWith({
        email: mockGoogleProfile.email,
        username: mockGoogleProfile.username,
        googleId: mockGoogleProfile.googleId,
        profilePicture: mockGoogleProfile.picture,
        role: mockRole,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        isActive: true,
      });
      expect(result).toEqual({
        accessToken: 'test-token',
        user: mockUser,
      });
    });

    it('should update existing user if role is missing', async () => {
      const mockRole = { id: 1, name: 'User' } as Role;
      const existingUser = {
        id: '1',
        email: mockGoogleProfile.email,
        googleId: mockGoogleProfile.googleId,
        role: undefined,
        profilePicture: 'old-picture.jpg',
        isActive: true,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        createdAt: new Date(),
      } as Partial<User>;

      const updatedUser = {
        ...existingUser,
        role: mockRole,
        profilePicture: mockGoogleProfile.picture,
      } as User;

      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(existingUser as User)
        .mockResolvedValueOnce(updatedUser);

      jest
        .spyOn(usersRepository, 'update')
        .mockResolvedValueOnce({ affected: 1 } as any);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('test-token');

      const result = await authService.handleGoogleLogin(mockGoogleProfile);

      expect(usersRepository.update).toHaveBeenCalledWith(existingUser.id, {
        role: mockRole,
        profilePicture: mockGoogleProfile.picture,
      });
      expect(result).toEqual({
        accessToken: 'test-token',
        user: updatedUser,
      });
    });

    it('should throw InternalServerErrorException if default role not found', async () => {
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        authService.handleGoogleLogin(mockGoogleProfile),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
