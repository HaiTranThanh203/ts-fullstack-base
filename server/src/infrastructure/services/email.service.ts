import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

    // Nếu không có credentials, tạo Ethereal email cho development
    if (!mailUser || !mailPassword) {
      this.logger.log('No email credentials found. Creating Ethereal email for development...');
      
      try {
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        this.logger.log(`Ethereal email created: ${testAccount.user}`);
        this.logger.log(`View messages at: https://ethereal.email/login`);
        this.logger.log(`Username: ${testAccount.user}`);
        this.logger.log(`Password: ${testAccount.pass}`);
        
        // Lưu credentials vào process để có thể truy cập sau
        (global as any).etherealEmail = {
          user: testAccount.user,
          pass: testAccount.pass,
          viewUrl: 'https://ethereal.email/login',
        };
        
      } catch (error) {
        this.logger.error('Failed to create Ethereal email:', error);
        // Fallback: không gửi email
        this.transporter = null as any;
      }
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.getOrThrow<string>('MAIL_HOST'),
        port: this.configService.getOrThrow<number>('MAIL_PORT'),
        secure: this.configService.getOrThrow<number>('MAIL_PORT') === 465,
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
      });
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #CAFF04; margin-bottom: 20px;">💪 GymPro - Password Reset</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #CAFF04; color: #121212; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">GymPro - Your fitness journey starts here</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, 'GymPro - Password Reset', html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #CAFF04; margin-bottom: 20px;">💪 Welcome to GymPro, ${name}!</h2>
          <p>Thank you for joining GymPro! Your account has been created successfully.</p>
          <p>Start your fitness journey with us today.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">GymPro - Your fitness journey starts here</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, 'Welcome to GymPro!', html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent. No transporter configured. To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM') || '"GymPro" <noreply@gympro.com>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);

      // Nếu dùng Ethereal, log URL để preview
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Preview email at: ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
