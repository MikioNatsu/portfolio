import { describe, expect, it } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { MailService, sanitiseAddress } from './mail.service';

/** Minimal ConfigService stand-in — only `get` is used by MailService. */
function configWith(values: Record<string, unknown>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe('sanitiseAddress', () => {
  it('accepts a normal address', () => {
    expect(sanitiseAddress('hello@example.com')).toBe('hello@example.com');
  });

  it('rejects a comma-appended second recipient', () => {
    // Stripping the comma leaves an invalid address, so it is refused rather
    // than silently mangled into a different recipient.
    expect(sanitiseAddress('victim@example.com,attacker@evil.com')).toBeNull();
  });

  it('rejects header-injection attempts outright', () => {
    // Newlines are removed, leaving a string that no longer parses as an address.
    expect(sanitiseAddress('a@b.com\r\nBcc: victim@example.com')).toBeNull();
    expect(sanitiseAddress('a@b.com\nBcc: x@y.com')).toBeNull();
  });

  it('rejects malformed addresses', () => {
    expect(sanitiseAddress('not-an-email')).toBeNull();
    expect(sanitiseAddress('missing@tld')).toBeNull();
    expect(sanitiseAddress('')).toBeNull();
    expect(sanitiseAddress('<script>@example.com')).toBeNull();
  });
});

describe('MailService', () => {
  it('reports disabled when no provider is configured', () => {
    const service = new MailService(
      configWith({
        'mail.resendApiKey': '',
        'mail.smtp.host': '',
      }),
    );
    expect(service.enabled).toBe(false);
  });

  it('reports enabled when a Resend key is present', () => {
    const service = new MailService(
      configWith({
        'mail.resendApiKey': 're_test_key',
        'mail.smtp.host': '',
      }),
    );
    expect(service.enabled).toBe(true);
  });

  it('skips sending and returns false when unconfigured', async () => {
    const service = new MailService(
      configWith({
        'mail.resendApiKey': '',
        'mail.smtp.host': '',
        'mail.contactEmail': 'owner@example.com',
      }),
    );

    await expect(
      service.sendContactNotification({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Hi',
        message: 'Hello there',
      }),
    ).resolves.toBe(false);

    await expect(
      service.sendAutoReply({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Hi',
        message: 'Hello there',
      }),
    ).resolves.toBe(false);
  });
});
