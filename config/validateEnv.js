const DEFAULT_JWT = 'change-this-to-a-long-random-secret';

export function validateEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Set them in Render Dashboard → Environment.'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === DEFAULT_JWT) {
      throw new Error('JWT_SECRET must be changed in production');
    }

    const warnings = [];
    if (!process.env.FRONTEND_URL) {
      warnings.push(
        'FRONTEND_URL is not set — the API will start but browser requests from your frontend will be blocked by CORS until you add it (e.g. https://your-app.vercel.app)'
      );
    }
    if (!process.env.PUBLIC_URL) {
      warnings.push(
        'PUBLIC_URL is not set — note attachment URLs may be incorrect. On Render, RENDER_EXTERNAL_URL is used automatically when available.'
      );
    }
    warnings.forEach((msg) => console.warn(`[env] ${msg}`));
  }
}
