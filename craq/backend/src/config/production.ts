import dotenv from 'dotenv';

dotenv.config();

const INSECURE_DEFAULTS = ['dev-secret-key', 'dev-refresh-secret-key', 'change-me-in-production'];

export function validateProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const errors: string[] = [];

  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret || INSECURE_DEFAULTS.includes(jwtSecret)) {
    errors.push('JWT_SECRET must be set to a secure value in production');
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
  if (!jwtRefreshSecret || INSECURE_DEFAULTS.includes(jwtRefreshSecret)) {
    errors.push('JWT_REFRESH_SECRET must be set to a secure value in production');
  }

  if (!process.env.DB_HOST) {
    errors.push('DB_HOST must be set in production');
  }

  if (!process.env.REDIS_URL) {
    errors.push('REDIS_URL must be set in production');
  }

  if (errors.length > 0) {
    console.error('Production configuration validation failed:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}
