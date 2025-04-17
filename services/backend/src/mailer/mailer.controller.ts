import { Controller, Logger } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MailerController {
  private readonly logger = new Logger(MailerController.name);
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern('sendEmail')
  sendEmail(@Payload() payload: { to: string; subject: string; text: string }) {
    this.logger.log('Sending email to', payload);
    try {
      return this.mailerService.sendEmail(
        payload.to,
        payload.subject,
        payload.text,
      );
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }
}
