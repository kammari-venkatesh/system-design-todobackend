const DEFAULT_JWT = 'change-this-to-a-long-random-secret';

export function validateEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is required in production (comma-separated allowed origins)');
    }
    if (!process.env.PUBLIC_URL) {
      throw new Error('PUBLIC_URL is required in production (public backend URL for uploads)');
    }
    if (process.env.JWT_SECRET === DEFAULT_JWT) {
      throw new Error('JWT_SECRET must be changed in production');
    }
  }
}
