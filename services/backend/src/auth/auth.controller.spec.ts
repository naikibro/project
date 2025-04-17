/* eslint-disable @typescript-eslint/unbound-method */
import { User } from '@/users/users.entity';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { idOf } from '../utils/test/test.utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

const mockResponse = (): Response => {
  return {
    cookie: jest.fn().mockReturnThis(), // ✅ Mock cookie method
    json: jest.fn().mockReturnThis(), // ✅ Mock json response
    status: jest.fn().mockReturnThis(), // ✅ Mock status method
    clearCookie: jest.fn().mockReturnThis(), // ✅ Mock clearCookie method
  } as unknown as Response; // ✅ Ensure TypeScript treats it as a valid Response
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn().mockResolvedValue({}),
            signIn: jest.fn().mockResolvedValue({}),
            forgotPassword: jest.fn().mockResolvedValue({}),
            resetPassword: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    describe('Credentials are used to login ( username or email + password )', () => {
      it('should return the user object without the password on successful login', async () => {
        const signInDto: SignInDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockUser: User = {
          id: idOf('testuser'),
          username: 'testuser',
          email: '',
          isActive: false,
          acceptedTerms: false,
          acceptedPrivacyPolicy: false,
          createdAt: new Date(),
          role: { id: 0, name: 'User', claims: [], users: [] },
          passwordResetToken: '',
          passwordResetExpires: new Date(),
        };

        const mockToken = { accessToken: 'jwt-token', user: mockUser };
        jest.spyOn(authService, 'signIn').mockResolvedValue(mockToken);

        const res = mockResponse(); // ✅ Use the fixed mock response

        await authController.signIn(signInDto, res); // ✅ Pass mock response

        expect(res.cookie).toHaveBeenCalledWith(
          'access_token',
          'jwt-token',
          expect.objectContaining({
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
          }),
        );

        expect(res.json).toHaveBeenCalledWith(mockToken);
      });

      it('should return a 401 if the password is incorrect', async () => {
        const signInDto: SignInDto = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        jest
          .spyOn(authService, 'signIn')
          .mockRejectedValue(new UnauthorizedException());

        const res = mockResponse();

        await expect(authController.signIn(signInDto, res)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should return a 404 if the user does not exist', async () => {
        const signInDto: SignInDto = {
          email: 'notfound@example.com',
          password: 'password123',
        };
        jest
          .spyOn(authService, 'signIn')
          .mockRejectedValue(new NotFoundException());
        const res = mockResponse();

        await expect(authController.signIn(signInDto, res)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should return a 500 if an unexpected error occurs', async () => {
        const signInDto: SignInDto = {
          email: 'test@example.com',
          password: 'password123',
        };
        jest
          .spyOn(authService, 'signIn')
          .mockRejectedValue(new InternalServerErrorException());
        const res = mockResponse();

        await expect(authController.signIn(signInDto, res)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('signUp', () => {
    it('should return the user object without the password on successful signup', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      const mockToken = { accessToken: 'jwt-token' };
      jest.spyOn(authService, 'signUp').mockResolvedValue(mockToken);

      const result = await authController.signUp(signUpDto);

      expect(result).toEqual(mockToken);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should return a 400 if the username is missing', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());

      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a 400 if the password is missing', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        password: '',
      };
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());
      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a 400 if the email is invalid', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());

      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a 400 if the email is missing', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        email: '',
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());

      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a 400 if the email is already taken', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'taken@example.com',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new ConflictException());
      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should return a 500 if an unexpected error occurs', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPassword123!',
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return a 200 if the email exists', async () => {
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(undefined);

      const result = await authController.forgotPassword('test@example.com');

      expect(result).toEqual({
        message:
          'If an account with this email exists, a password reset link will be sent.',
      });
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return a 404 if the email does not exist', async () => {
      jest
        .spyOn(authService, 'forgotPassword')
        .mockRejectedValue(new NotFoundException());

      await expect(
        authController.forgotPassword('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(authService, 'forgotPassword')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(
        authController.forgotPassword('test@example.com'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
