import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { passwordResetTemplate } from './templates/passwordReset.template';
dotenv.config();

@Injectable()
export class MailerService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const text = passwordResetTemplate(token);

    return await this.sendEmail(to, 'Password Reset', text);
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const result = await this.resend.emails.send({
        from: `${process.env.PROJECT_NAME} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
      });

      return {
        success: true,
        messageId: result.data?.id,
        to: to,
      };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
