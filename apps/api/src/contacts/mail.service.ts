import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

interface ContactEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Outbound email.
 *
 * Two providers, chosen automatically:
 *  - Resend      — when `RESEND_API_KEY` is set (HTTP API, no SMTP ports)
 *  - SMTP        — when `SMTP_HOST` is set (nodemailer)
 *
 * If neither is configured the API still stores the message and simply reports
 * `emailSent: false`, so a missing mail setup never breaks the contact form.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('mail.smtp.host');
    if (host && !this.config.get<string>('mail.resendApiKey')) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('mail.smtp.port') ?? 587,
        secure: this.config.get<boolean>('mail.smtp.secure') ?? false,
        auth: this.config.get<string>('mail.smtp.user')
          ? {
              user: this.config.get<string>('mail.smtp.user'),
              pass: this.config.get<string>('mail.smtp.password'),
            }
          : undefined,
      });
    }
  }

  get enabled(): boolean {
    return Boolean(this.config.get<string>('mail.resendApiKey') || this.transporter);
  }

  /** Notifies the portfolio owner about a new contact message. */
  async sendContactNotification(payload: ContactEmail): Promise<boolean> {
    const to = this.config.get<string>('mail.contactEmail') ?? '';
    if (!to || !this.enabled) {
      this.logger.warn('Email provider not configured — skipping contact notification.');
      return false;
    }

    const subject = `New message: ${payload.subject}`;
    const text = [
      `From: ${payload.name} <${payload.email}>`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n');

    const html = `
      <div style="font-family:Inter,Segoe UI,sans-serif;line-height:1.6;color:#1a1a24">
        <h2 style="margin:0 0 12px">New contact message</h2>
        <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
        <hr style="border:none;border-top:1px solid #e5e5ef;margin:16px 0" />
        <p style="white-space:pre-line;margin:0">${escapeHtml(payload.message)}</p>
      </div>
    `;

    return this.send({
      to,
      subject,
      text,
      html,
      replyTo: payload.email,
    });
  }

  /** Optional courtesy reply so the sender knows the message arrived. */
  async sendAutoReply(payload: ContactEmail): Promise<boolean> {
    if (!this.enabled) return false;

    const recipient = sanitiseAddress(payload.email);
    if (!recipient) {
      this.logger.warn('Skipped auto-reply: the submitted address could not be sanitised.');
      return false;
    }

    const text = [
      `Hi ${payload.name},`,
      '',
      'Thanks for reaching out — your message arrived and I will get back to you soon.',
      '',
      'For reference, here is what you sent:',
      `> ${payload.message.replace(/\n/g, '\n> ')}`,
      '',
      '— Natsu',
    ].join('\n');

    return this.send({
      to: recipient,
      subject: 'Thanks for your message',
      text,
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  }): Promise<boolean> {
    const resendKey = this.config.get<string>('mail.resendApiKey');
    const from = this.config.get<string>('mail.from') ?? 'Natsu <no-reply@example.com>';

    try {
      if (resendKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [options.to],
            subject: options.subject,
            text: options.text,
            html: options.html,
            reply_to: options.replyTo,
          }),
        });

        if (!response.ok) {
          this.logger.error(`Resend rejected the request (${response.status})`);
          return false;
        }
        return true;
      }

      if (this.transporter) {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          replyTo: options.replyTo,
        });
        return true;
      }
    } catch (error) {
      this.logger.error(`Sending email failed: ${(error as Error).message}`);
    }

    return false;
  }
}

/** Minimal HTML escaping — email templates must never interpolate raw input. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Defence in depth for the one place where user input reaches an address
 * header (the auto-reply).
 *
 * The DTO already validates the address, but header injection deserves a
 * second, explicit guard. Input containing anything that could terminate the
 * address or introduce another recipient is **rejected**, never rewritten —
 * silently "fixing" an address could deliver mail to a different mailbox than
 * the visitor intended.
 */
export function sanitiseAddress(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return null;
  if (/[\r\n\t,;<>"\\]/.test(trimmed)) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return null;
  return trimmed;
}
