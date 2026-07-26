import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendMail = vi.fn();
let emailEnabled = true;

vi.mock("@/config/env", () => ({
  env: {
    get emailEnabled() { return emailEnabled; },
    smtpHost: "smtp.test.com",
    smtpPort: 587,
    smtpUser: "user",
    smtpPass: "pass",
    smtpFrom: "noreply@test.com",
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: (...args: unknown[]) => mockSendMail(...args),
    }),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/email";

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emailEnabled = true;
  });

  describe("sendVerificationEmail", () => {
    it("sends verification email and returns { sent: true }", async () => {
      mockSendMail.mockResolvedValue({ accepted: ["test@test.com"] });

      const result = await sendVerificationEmail("test@test.com", "Test", "token-123");

      expect(result).toEqual({ sent: true });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@test.com",
          subject: "Verify your email",
        }),
      );
    });

    it("returns { sent: false, error } on failure", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP connection refused"));

      const result = await sendVerificationEmail("test@test.com", "Test", "token-123");

      expect(result.sent).toBe(false);
      expect(result.error).toContain("SMTP connection refused");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("sends password reset email and returns { sent: true }", async () => {
      mockSendMail.mockResolvedValue({ accepted: ["test@test.com"] });

      const result = await sendPasswordResetEmail("test@test.com", "Test", "token-456");

      expect(result).toEqual({ sent: true });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@test.com",
          subject: "Reset your password",
        }),
      );
    });

    it("returns { sent: false, error } on failure", async () => {
      mockSendMail.mockRejectedValue(new Error("Invalid SMTP credentials"));

      const result = await sendPasswordResetEmail("test@test.com", "Test", "token-456");

      expect(result.sent).toBe(false);
      expect(result.error).toContain("Invalid SMTP credentials");
    });
  });
});
