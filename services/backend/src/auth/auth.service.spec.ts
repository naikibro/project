/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { idOf } from '../utils/test/test.utils';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Role } from './rbac/role/role.entity';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let jwtService: JwtService;
  let clientProxy: { emit: jest.Mock };

  beforeEach(async () => {
    clientProxy = {
      emit: jest.fn().mockReturnValue(undefined),
    };

    // Mock environment variables
    process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';

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
        {
          provide: 'MAILER_SERVICE',
          useValue: clientProxy,
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
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
    // Clean up mock environment variables
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
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
      const mockUser = {
        id: idOf('testuser1'),
        email: 'test@example.com',
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(usersRepository, 'update')
        .mockResolvedValueOnce({ affected: 1 } as any);

      await expect(
        authService.forgotPassword('test@example.com'),
      ).resolves.toBeUndefined();

      expect(clientProxy.emit).toHaveBeenCalledWith(
        'sendEmail',
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Password Reset Request',
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset the password', async () => {
      const mockUser = {
        id: idOf('testuser1'),
        email: 'test@example.com',
        passwordResetToken: 'test-token',
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour from now
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(usersRepository, 'update')
        .mockResolvedValueOnce({ affected: 1 } as any);

      await authService.resetPassword('test-token', 'newPassword123');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: {
          passwordResetToken: 'test-token',
          passwordResetExpires: expect.any(Object),
        },
      });

      expect(usersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password: expect.any(String),
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        }),
      );

      expect(clientProxy.emit).toHaveBeenCalledWith(
        'sendEmail',
        expect.objectContaining({
          to: mockUser.email,
          subject: 'Password Reset Successful',
        }),
      );
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        authService.resetPassword('invalid-token', 'newPassword123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        authService.resetPassword('test-token', 'newPassword123'),
      ).rejects.toThrow(BadRequestException);

      expect(clientProxy.emit).not.toHaveBeenCalled();
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
