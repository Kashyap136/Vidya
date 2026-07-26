import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUser = { id: "user-1", email: "test@test.com", password: "hashed-password", name: "Test" };
const mockFindFirst = vi.fn();
const mockFindByEmail = vi.fn();
const mockFindActiveById = vi.fn();
const mockLinkProvider = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/repositories", () => ({
  userRepository: {
    findFirst: (...args: unknown[]) => mockFindFirst(...args),
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
    findActiveById: (...args: unknown[]) => mockFindActiveById(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
  accountRepository: {
    findByProvider: vi.fn(),
    linkProvider: (...args: unknown[]) => mockLinkProvider(...args),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock("argon2", () => ({
  verify: vi.fn(),
}));

import { authService } from "@/services/auth";
import { verify } from "argon2";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateCredentials", () => {
    it("returns user on valid credentials", async () => {
      mockFindFirst.mockResolvedValue(mockUser);
      vi.mocked(verify).mockResolvedValue(true);

      const result = await authService.validateCredentials("test@test.com", "password");
      expect(result).toEqual(mockUser);
    });

    it("throws AuthenticationError when user not found", async () => {
      mockFindFirst.mockResolvedValue(null);

      await expect(
        authService.validateCredentials("nonexistent@test.com", "password"),
      ).rejects.toThrow("Invalid email or password");
    });

    it("throws AuthenticationError on wrong password", async () => {
      mockFindFirst.mockResolvedValue(mockUser);
      vi.mocked(verify).mockResolvedValue(false);

      await expect(
        authService.validateCredentials("test@test.com", "wrong"),
      ).rejects.toThrow("Invalid email or password");
    });

    it("normalizes email to lowercase", async () => {
      mockFindFirst.mockResolvedValue(mockUser);
      vi.mocked(verify).mockResolvedValue(true);

      await authService.validateCredentials("TEST@TEST.COM", "password");
      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@test.com" }),
        expect.any(Object),
      );
    });
  });

  describe("oauthSignIn", () => {
    const oauthProfile = { email: "user@gmail.com", name: "User", image: null, email_verified: true };
    const oauthAccount = { provider: "google", providerAccountId: "g123", type: "oauth" };

    it("returns false when email is missing", async () => {
      const result = await authService.oauthSignIn({}, oauthAccount);
      expect(result).toBe(false);
    });

    it("returns false when user is soft-deleted", async () => {
      mockFindByEmail.mockResolvedValue({ id: "user-1", deletedAt: new Date() });

      const result = await authService.oauthSignIn(
        { email: "deleted@test.com" },
        oauthAccount,
      );
      expect(result).toBe(false);
    });

    it("links account to existing user and returns userId", async () => {
      mockFindByEmail.mockResolvedValue({ id: "user-1", deletedAt: null });
      mockLinkProvider.mockResolvedValue({});
      mockFindActiveById.mockResolvedValue({ id: "user-1", email: "user@gmail.com" });

      const result = await authService.oauthSignIn(oauthProfile, oauthAccount);
      expect(result).toBe("user-1");
      expect(mockLinkProvider).toHaveBeenCalled();
    });

    it("creates new user from OAuth profile", async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: "new-user-1" });
      mockLinkProvider.mockResolvedValue({});

      const result = await authService.oauthSignIn(oauthProfile, oauthAccount);
      expect(result).toBe("new-user-1");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@gmail.com",
          name: "User",
        }),
        undefined,
      );
    });

    it("logs error and returns false when account linking fails", async () => {
      mockFindByEmail.mockResolvedValue({ id: "user-1", deletedAt: null });
      mockLinkProvider.mockRejectedValue(new Error("DB connection failed"));

      const result = await authService.oauthSignIn(oauthProfile, oauthAccount);
      expect(result).toBe(false);
    });

    it("logs error and returns false when user creation fails", async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error("Duplicate email"));

      const result = await authService.oauthSignIn(oauthProfile, oauthAccount);
      expect(result).toBe(false);
    });
  });
});
