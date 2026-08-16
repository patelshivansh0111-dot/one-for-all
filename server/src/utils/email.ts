import nodemailer from 'nodemailer';
import { env, isSmtpConfigured } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

if (isSmtpConfigured()) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    console.log('\n--- EMAIL (SMTP not configured) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(options.text || options.html.replace(/<[^>]+>/g, ''));
    console.log('--- END EMAIL ---\n');
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your One for All account',
    html: `<p>Welcome to One for All! Click <a href="${link}">here</a> to verify your email.</p><p>Or copy this link: ${link}</p>`,
    text: `Verify your email: ${link}`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const link = `${env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your One for All password',
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p><p>Or copy this link: ${link}</p>`,
    text: `Reset password: ${link}`,
  });
};
