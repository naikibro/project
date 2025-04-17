import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeleteResult, Repository } from 'typeorm';
import { Claim } from '../auth/rbac/claims.enum';
import { Role } from '../auth/rbac/role/role.entity';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { isValidEmail } from '../utils/mails/mails.helper';
import { idOf } from '../utils/test/test.utils';

jest.mock('../utils/mails/mails.helper', () => ({
  isValidEmail: jest.fn(() => true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;

  const mockRole: Role = {
    id: 1,
    name: 'User',
    claims: [Claim.READ_OWN_USER, Claim.WRITE_OWN_USER, Claim.DELETE_OWN_USER],
    users: [],
  };

  const mockUser: User = {
    id: idOf('testUser'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword' as string,
    isActive: true,
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    createdAt: new Date(),
    role: mockRole,
    passwordResetToken: '',
    passwordResetExpires: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
            create: jest.fn((user: User): User => user),
            delete: jest
              .fn()
              .mockResolvedValue({ affected: 1 } as DeleteResult),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));

    (isValidEmail as jest.Mock).mockReturnValue(true);
  });

  describe('createUser', () => {
    it('should create a new user with a hashed password and default role', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockRole);
      (
        jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
      ).mockResolvedValue('hashedPassword');
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({ ...user, password: 'hashedPassword' });
      (isValidEmail as jest.Mock).mockReturnValue(true);

      const createdUser = await service.createUser(user);
      expect(createdUser.password).toBe('hashedPassword');
      expect(createdUser.role).toEqual(mockRole);
    });

    it('should throw BadRequestException if username, email, or password is missing', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: '',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      await expect(service.createUser(user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email format is invalid', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      (isValidEmail as jest.Mock).mockReturnValue(false);

      await expect(service.createUser(user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if username is already taken', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.createUser(mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if password hashing fails', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockRole);
      (
        jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
      ).mockRejectedValue(new Error('Hashing failed'));

      await expect(service.createUser(user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if default role is not found', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createUser(user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should create a new user with a hashed password and default role', async () => {
      const user: User = {
        id: idOf('testUser'),
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        acceptedTerms: false,
        acceptedPrivacyPolicy: false,
        createdAt: new Date(),
        role: mockRole,
        passwordResetToken: '',
        passwordResetExpires: new Date(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockRole);
      (
        jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
      ).mockResolvedValue('hashedPassword');
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({ ...user, password: 'hashedPassword' });

      jest.spyOn(usersRepository, 'save').mockResolvedValue({
        ...user,
        password: 'hashedPassword',
      });

      (isValidEmail as jest.Mock).mockReturnValue(true);

      const createdUser = await service.createUser(user);
      expect(createdUser.password).toBe('hashedPassword');
      expect(createdUser.role).toEqual(mockRole);
    });

    it('should throw an error if the username is already taken', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      await expect(service.createUser(mockUser)).rejects.toThrow(
        'Username is already taken',
      );
    });
  });

  describe('getUser', () => {
    it('should throw BadRequestException if username is empty', async () => {
      await expect(service.getUser('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if username is null', async () => {
      await expect(service.getUser(null as unknown as string)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a user when username is provided', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const user = await service.getUser('testuser');

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.getUser('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user password securely', async () => {
      const updatedUser = { ...mockUser, password: 'newHashedPassword' };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      (
        jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
      ).mockResolvedValue('hashedPassword');
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({ ...updatedUser, password: 'hashedPassword' });

      jest.spyOn(usersRepository, 'save').mockResolvedValue(updatedUser);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(updatedUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(updatedUser);

      const result = await service.updateUser('testuser', {
        password: 'newPassword',
      });
      expect(result.password).toBe('newHashedPassword');
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(usersRepository, 'remove').mockResolvedValue(mockUser);

      await expect(service.deleteUser('testuser')).resolves.toBeUndefined();
    });

    describe('deleteUserByEmail', () => {
      it('should delete an existing user by email', async () => {
        jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(usersRepository, 'remove').mockResolvedValue(mockUser);

        await expect(
          service.deleteUserByEmail('test@example.com'),
        ).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if user does not exist', async () => {
        jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

        await expect(
          service.deleteUserByEmail('nonexistent@example.com'),
        ).rejects.toThrow(NotFoundException);
      });

      describe('updateUserByEmail', () => {
        it('should update user password securely by email', async () => {
          const updatedUser = { ...mockUser, password: 'newHashedPassword' };

          jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
          (
            jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
          ).mockResolvedValue('hashedPassword');
          jest
            .spyOn(usersRepository, 'save')
            .mockResolvedValue({ ...updatedUser, password: 'hashedPassword' });
          jest.spyOn(usersRepository, 'findOne').mockResolvedValue(updatedUser);

          const result = await service.updateUserByEmail('test@example.com', {
            password: 'newPassword',
          });
          expect(result.password).toBe('newHashedPassword');
        });

        it('should throw NotFoundException if user does not exist', async () => {
          jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

          await expect(
            service.updateUserByEmail('nonexistent@example.com', {
              password: 'newPassword',
            }),
          ).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if updated user retrieval fails', async () => {
          jest
            .spyOn(usersRepository, 'findOne')
            .mockResolvedValueOnce(mockUser);
          (
            jest.spyOn(bcrypt, 'hash') as jest.MockInstance<any, any>
          ).mockResolvedValue('hashedPassword');
          jest.spyOn(usersRepository, 'save').mockResolvedValue(mockUser);
          jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            service.updateUserByEmail('test@example.com', {
              password: 'newPassword',
            }),
          ).rejects.toThrow(InternalServerErrorException);
        });

        it('should update user details without password', async () => {
          const updates = { username: 'updatedUsername' };
          const updatedUser = { ...mockUser, ...updates };

          jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
          jest.spyOn(usersRepository, 'save').mockResolvedValue(updatedUser);
          jest.spyOn(usersRepository, 'findOne').mockResolvedValue(updatedUser);

          const result = await service.updateUserByEmail(
            'test@example.com',
            updates,
          );
          expect(result.username).toBe('updatedUsername');
        });
      });
    });
  });
});
