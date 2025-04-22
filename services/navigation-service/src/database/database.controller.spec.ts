import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from './database.controller';
import { ForbiddenException } from '@nestjs/common';
import * as child_process from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.setTimeout(10000);

describe('DatabaseController', () => {
  let controller: DatabaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should run migrations successfully', async () => {
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(null, { stdout: 'success', stderr: '' });
        },
      );

      const result = await controller.update();

      expect(result).toEqual({
        message: 'Migrations ran successfully',
        stdout: 'success',
        stderr: '',
      });
    });

    it('should handle migration failure', async () => {
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(new Error('Migration error'));
        },
      );

      const result = await controller.update();

      expect(result).toEqual({
        error: 'Migration failed',
        details: 'Migration error',
      });
    });
  });

  describe('updatePost', () => {
    it('should run migrations successfully', async () => {
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(null, { stdout: 'success', stderr: '' });
        },
      );

      const result = await controller.updatePost();

      expect(result).toEqual({
        message: 'Migrations ran successfully',
        stdout: 'success',
        stderr: '',
      });
    });

    it('should handle migration failure', async () => {
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(new Error('Migration error'));
        },
      );

      const result = await controller.updatePost();

      expect(result).toEqual({
        error: 'Migration failed',
        details: 'Migration error',
      });
    });
  });

  describe('revert', () => {
    it('should revert migration successfully in test environment', async () => {
      process.env.NODE_ENV = 'test';
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(null, { stdout: 'success', stderr: '' });
        },
      );

      const result = await controller.revert();

      expect(result).toEqual({
        message: 'Migration reverted successfully',
        stdout: 'success',
        stderr: '',
      });
    });

    it('should throw ForbiddenException in non-test/dev environment', async () => {
      process.env.NODE_ENV = 'production';

      await expect(controller.revert()).rejects.toThrow(ForbiddenException);
    });

    it('should handle migration revert failure', async () => {
      process.env.NODE_ENV = 'test';
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(new Error('Revert error'));
        },
      );

      const result = await controller.revert();

      expect(result).toEqual({
        error: 'Migration revert failed',
        details: 'Revert error',
      });
    });
  });

  describe('revertPost', () => {
    it('should revert migration successfully in test environment', async () => {
      process.env.NODE_ENV = 'test';
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(null, { stdout: 'success', stderr: '' });
        },
      );

      const result = await controller.revertPost();

      expect(result).toEqual({
        message: 'Migration reverted successfully',
        stdout: 'success',
        stderr: '',
      });
    });

    it('should throw ForbiddenException in non-test/dev environment', async () => {
      process.env.NODE_ENV = 'production';

      await expect(controller.revertPost()).rejects.toThrow(ForbiddenException);
    });

    it('should handle migration revert failure', async () => {
      process.env.NODE_ENV = 'test';
      (child_process.exec as unknown as jest.Mock).mockImplementation(
        (
          command: string,
          callback: (
            err: Error | null,
            result?: { stdout: string; stderr: string },
          ) => void,
        ) => {
          callback(new Error('Revert error'));
        },
      );

      const result = await controller.revertPost();

      expect(result).toEqual({
        error: 'Migration revert failed',
        details: 'Revert error',
      });
    });
  });
});
