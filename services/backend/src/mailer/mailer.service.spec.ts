/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Resend } from 'resend';
import { MailerService } from './mailer.service';

jest.mock('resend');

describe('MailerService', () => {
  let service: MailerService;
  let mockEmailsSend: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    mockEmailsSend = jest.fn();
    const mockResendImplementation = {
      emails: {
        send: mockEmailsSend,
      },
    };

    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () => mockResendImplementation as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email successfully', async () => {
      const mockResponse = {
        data: { id: 'mock-message-id' },
      };
      mockEmailsSend.mockResolvedValueOnce(mockResponse);

      const result = await service.sendPasswordResetEmail(
        'test@example.com',
        'reset-token',
      );

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to: 'test@example.com',
          subject: 'Password Reset',
          text: expect.stringContaining('reset-token'),
        }),
      );

      expect(result).toEqual({
        success: true,
        messageId: 'mock-message-id',
        to: 'test@example.com',
      });
    });

    it('should throw InternalServerErrorException when email sending fails', async () => {
      const error = new Error('Failed to send email');
      mockEmailsSend.mockRejectedValueOnce(error);

      await expect(
        service.sendPasswordResetEmail('test@example.com', 'reset-token'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sendEmail', () => {
    it('should send a generic email successfully', async () => {
      const mockResponse = {
        data: { id: 'mock-message-id' },
      };
      mockEmailsSend.mockResolvedValueOnce(mockResponse);

      const result = await service.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Content',
      );

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: `${process.env.PROJECT_NAME} <${process.env.EMAIL_FROM}>`,
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Content',
      });

      expect(result).toEqual({
        success: true,
        messageId: 'mock-message-id',
        to: 'test@example.com',
      });
    });

    it('should throw InternalServerErrorException with error message when available', async () => {
      const error = new Error('Custom error message');
      mockEmailsSend.mockRejectedValueOnce(error);

      await expect(
        service.sendEmail('test@example.com', 'Test Subject', 'Test Content'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw generic InternalServerErrorException when error is not an Error instance', async () => {
      mockEmailsSend.mockRejectedValueOnce('string error');

      await expect(
        service.sendEmail('test@example.com', 'Test Subject', 'Test Content'),
      ).rejects.toThrow('Failed to send email');
    });
  });
});
