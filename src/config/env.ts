const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

const EMAIL_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
] as const;

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}.\n` +
      `Set them in .env.local or your deployment environment.`,
    );
  }

  const emailMissing: string[] = [];
  for (const key of EMAIL_VARS) {
    if (!process.env[key]) {
      emailMissing.push(key);
    }
  }

  if (emailMissing.length > 0) {
    console.warn(
      `[env] Email sending disabled: missing ${emailMissing.join(", ")}.\n` +
      `Set these in .env.local to enable email verification and password reset emails.`,
    );
  }
}

validateEnv();

export const env = {
  smtpHost: process.env.SMTP_HOST as string | undefined,
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER as string | undefined,
  smtpPass: process.env.SMTP_PASS as string | undefined,
  smtpFrom: process.env.SMTP_FROM as string | undefined,
  emailEnabled: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM),
} as const;
