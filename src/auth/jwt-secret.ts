export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET wajib diisi pada environment production');
  }

  return 'development-jwt-secret';
}
