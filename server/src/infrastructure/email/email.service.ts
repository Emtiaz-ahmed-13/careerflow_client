import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor(private config: ConfigService) {
    const host = config.get('SMTP_HOST');
    const user = config.get('SMTP_USER');
    const pass = config.get('SMTP_PASS');
    this.fromAddress = config.get('SMTP_FROM', user ?? 'noreply@careerflow.app')!;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(config.get('SMTP_PORT', '587')),
        secure: config.get('SMTP_SECURE', 'false') === 'true',
        auth: { user, pass: pass.replace(/\s/g, '') },
      });
      this.logger.log('SMTP email configured');
    } else {
      this.logger.warn('SMTP not configured — direct email send disabled');
    }
  }

  isConfigured() {
    return !!this.transporter;
  }

  async send({
    to,
    subject,
    content,
    replyTo,
    attachments,
  }: {
    to: string;
    subject: string;
    content: string;
    replyTo?: string;
    attachments?: { filename: string; content: Buffer; contentType?: string }[];
  }) {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        'SMTP not configured on server. Add SMTP_HOST, SMTP_USER, SMTP_PASS to enable direct send.',
      );
    }

    const mailAttachments = attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType ?? 'application/pdf',
    }));

    const info = await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      replyTo: replyTo ?? this.fromAddress,
      subject,
      text: content,
      attachments: mailAttachments?.length ? mailAttachments : undefined,
    });

    const attachNote = mailAttachments?.length
      ? ` with ${mailAttachments.length} attachment(s)`
      : '';
    this.logger.log(`Email sent to ${to}${attachNote}: ${info.messageId}`);
    return { messageId: info.messageId, sent: true };
  }
}
