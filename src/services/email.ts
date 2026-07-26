import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!env.emailEnabled) {
      throw new Error(
        "Email sending is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.local",
      );
    }
    if (!env.smtpUser || !env.smtpPass || !env.smtpFrom) {
      throw new Error(
        "SMTP credentials incomplete. Set SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.local",
      );
    }
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return transporter;
}

function buildEmailContent(
  to: string,
  subject: string,
  html: string,
): { to: string; from: string; subject: string; html: string } {
  return {
    to,
    from: env.smtpFrom!,
    subject,
    html,
  };
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ sent: boolean; error?: string }> {
  const link = `${getAppUrl()}/auth/verify-email?token=${token}`;

  const html = `
<p>Hi ${escapeHtml(name)},</p>
<p>Verify your email address by clicking the link below:</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 24 hours.</p>
<p>If you didn't create an account, you can ignore this email.</p>
`;

  try {
    await getTransporter().sendMail(
      buildEmailContent(email, "Verify your email", html),
    );
    logger.info("Verification email sent", { email });
    return { sent: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to send verification email", { email, error: msg });
    return { sent: false, error: msg };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ sent: boolean; error?: string }> {
  const link = `${getAppUrl()}/auth/reset-password?token=${token}`;

  const html = `
<p>Hi ${escapeHtml(name)},</p>
<p>Reset your password by clicking the link below:</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request a password reset, you can ignore this email.</p>
`;

  try {
    await getTransporter().sendMail(
      buildEmailContent(email, "Reset your password", html),
    );
    logger.info("Password reset email sent", { email });
    return { sent: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to send password reset email", { email, error: msg });
    return { sent: false, error: msg };
  }
}
