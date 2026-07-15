/** Read a required environment variable; fail fast with a clear message. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name} (set it in .env locally or in GitHub Actions Secrets)`,
    );
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}
