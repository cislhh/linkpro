/**
 * Proxy Route Protection Tests
 * 
 * Tests for the proxy-based route protection system
 * Requirements: 9.1, 9.2, 9.3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth module
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Proxy Route Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkProtectedRoute", () => {
    it("should return redirect info for unauthenticated user on protected route", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue(null);

      const { checkProtectedRoute } = await import("@/app/proxy");
      const result = await checkProtectedRoute("/dashboard");

      expect(result.shouldRedirect).toBe(true);
      expect(result.redirectTo).toContain("/login");
      expect(result.redirectTo).toContain("callbackUrl");
    });

    it("should allow authenticated user on protected route", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "test@test.com" },
        expires: new Date().toISOString(),
      });

      const { checkProtectedRoute } = await import("@/app/proxy");
      const result = await checkProtectedRoute("/dashboard");

      expect(result.shouldRedirect).toBe(false);
    });
  });


  describe("checkAuthRoute", () => {
    it("should redirect authenticated user from auth pages to dashboard", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "test@test.com" },
        expires: new Date().toISOString(),
      });

      const { checkAuthRoute } = await import("@/app/proxy");
      const result = await checkAuthRoute("/login");

      expect(result.shouldRedirect).toBe(true);
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("should allow unauthenticated user on auth pages", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue(null);

      const { checkAuthRoute } = await import("@/app/proxy");
      const result = await checkAuthRoute("/login");

      expect(result.shouldRedirect).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is logged in", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "test@test.com" },
        expires: new Date().toISOString(),
      });

      const { isAuthenticated } = await import("@/app/proxy");
      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false when user is not logged in", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue(null);

      const { isAuthenticated } = await import("@/app/proxy");
      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("callbackUrl preservation", () => {
    it("should preserve original path in callbackUrl", async () => {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValue(null);

      const { checkProtectedRoute } = await import("@/app/proxy");
      const result = await checkProtectedRoute("/dashboard/settings");

      expect(result.shouldRedirect).toBe(true);
      expect(result.redirectTo).toContain(
        encodeURIComponent("/dashboard/settings")
      );
    });
  });
});
