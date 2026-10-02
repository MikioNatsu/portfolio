/**
 * Typed configuration factory.
 *
 * Everything the app needs is read once, here, and validated — a missing
 * secret fails fast at boot instead of surfacing as a runtime 500 later.
 */

export interface AppConfig {
  env: string;
  isProduction: boolean;
  port: number;
  frontendUrl: string;
  apiUrl: string;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
    cookieName: string;
  };
  admin: {
    email: string;
    password: string;
    name: string;
  };
  storage: {
    driver: 'cloudinary' | 'local';
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      folder: string;
    };
  };
  mail: {
    from: string;
    contactEmail: string;
    resendApiKey: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
  redisUrl: string;
  throttle: {
    ttl: number;
    limit: number;
    contactLimit: number;
    loginLimit: number;
  };
}

function readEnv(key: string, fallback = ''): string {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

function readNumber(key: string, fallback: number): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function configuration(): AppConfig {
  const env = readEnv('NODE_ENV', 'development');
  const isProduction = env === 'production';

  const jwtSecret = readEnv('JWT_SECRET', isProduction ? '' : 'dev-only-insecure-secret-change-me');

  if (isProduction && !jwtSecret) {
    throw new Error('JWT_SECRET must be set in production. Refusing to start.');
  }

  const cloudName = readEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = readEnv('CLOUDINARY_API_KEY');
  const apiSecret = readEnv('CLOUDINARY_API_SECRET');
  const explicitDriver = readEnv('STORAGE_DRIVER');

  const storageDriver: 'cloudinary' | 'local' =
    explicitDriver === 'cloudinary' || (!explicitDriver && cloudName && apiKey && apiSecret)
      ? 'cloudinary'
      : 'local';

  return {
    env,
    isProduction,
    port: readNumber('PORT', 4000),
    frontendUrl: readEnv('FRONTEND_URL', 'http://localhost:5173'),
    apiUrl: readEnv('API_URL', `http://localhost:${readNumber('PORT', 4000)}`),
    databaseUrl: readEnv('DATABASE_URL'),
    jwt: {
      secret: jwtSecret,
      expiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
      cookieName: readEnv('JWT_COOKIE_NAME', 'natsu_session'),
    },
    admin: {
      email: readEnv('ADMIN_EMAIL', 'admin@example.com').toLowerCase(),
      password: readEnv('ADMIN_PASSWORD', 'ChangeMe123!'),
      name: readEnv('ADMIN_NAME', 'Natsu'),
    },
    storage: {
      driver: storageDriver,
      cloudinary: {
        cloudName,
        apiKey,
        apiSecret,
        folder: readEnv('CLOUDINARY_FOLDER', 'natsu-portfolio'),
      },
    },
    mail: {
      from: readEnv('EMAIL_FROM', 'Natsu Portfolio <no-reply@example.com>'),
      contactEmail: readEnv('CONTACT_EMAIL', readEnv('ADMIN_EMAIL', 'hello@example.com')),
      resendApiKey: readEnv('RESEND_API_KEY'),
      smtp: {
        host: readEnv('SMTP_HOST'),
        port: readNumber('SMTP_PORT', 587),
        secure: readEnv('SMTP_SECURE', 'false') === 'true',
        user: readEnv('SMTP_USER'),
        password: readEnv('SMTP_PASSWORD'),
      },
    },
    redisUrl: readEnv('REDIS_URL'),
    throttle: {
      ttl: readNumber('THROTTLE_TTL', 60),
      limit: readNumber('THROTTLE_LIMIT', 120),
      contactLimit: readNumber('THROTTLE_CONTACT_LIMIT', 5),
      loginLimit: readNumber('THROTTLE_LOGIN_LIMIT', 8),
    },
  };
}

export const CONFIG = 'CONFIG';
