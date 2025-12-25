import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createLinkSchema,
  updateProfileSchema,
  registerSchema,
  loginSchema,
  themeSchema,
} from "@/lib/validations";

/**
 * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
 * **Validates: Requirements 7.1, 7.2**
 *
 * For any data that does not conform to the expected schema,
 * Zod validation should reject it and return specific error messages.
 */

describe("Zod Validation Property Tests", () => {
  describe("createLinkSchema Validation", () => {
    it("Property 14.1: Rejects empty titles", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       *
       * Note: Zod's min(1) only checks string length, so empty string is rejected
       * but whitespace-only strings are accepted (they have length >= 1)
       */
      fc.assert(
        fc.property(fc.constant(""), (emptyTitle) => {
          const data = {
            title: emptyTitle,
            url: "https://example.com",
          };

          const result = createLinkSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const titleErrors = result.error.issues.filter((e) =>
              e.path.includes("title")
            );
            expect(titleErrors.length).toBeGreaterThan(0);
            expect(titleErrors[0]?.message).toBe("Title is required");
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.2: Rejects titles exceeding max length", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const longTitleArb = fc
        .string({ minLength: 101, maxLength: 200 })
        .filter((s) => s.length > 100);

      fc.assert(
        fc.property(longTitleArb, (longTitle) => {
          const data = {
            title: longTitle,
            url: "https://example.com",
          };

          const result = createLinkSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const titleErrors = result.error.issues.filter((e) =>
              e.path.includes("title")
            );
            expect(titleErrors.length).toBeGreaterThan(0);
            expect(titleErrors[0]?.message).toBe("Title too long");
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.3: Rejects negative order values", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const negativeOrderArb = fc.integer({ min: -1000, max: -1 });

      fc.assert(
        fc.property(negativeOrderArb, (negativeOrder) => {
          const data = {
            title: "Valid Title",
            url: "https://example.com",
            order: negativeOrder,
          };

          const result = createLinkSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const orderErrors = result.error.issues.filter((e) =>
              e.path.includes("order")
            );
            expect(orderErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("registerSchema Validation", () => {
    it("Property 14.4: Rejects invalid email formats", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const invalidEmailArb = fc.oneof(
        fc.constant(""),
        fc.constant("notanemail"),
        fc.constant("missing@domain"),
        fc.constant("@nodomain.com"),
        fc.constant("spaces in@email.com"),
        fc.stringMatching(/^[a-z]{3,10}$/) // just text, no @ symbol
      );

      fc.assert(
        fc.property(invalidEmailArb, (invalidEmail) => {
          const data = {
            email: invalidEmail,
            password: "validpassword123",
            username: "validuser",
          };

          const result = registerSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const emailErrors = result.error.issues.filter((e) =>
              e.path.includes("email")
            );
            expect(emailErrors.length).toBeGreaterThan(0);
            expect(emailErrors[0]?.message).toBe("Invalid email format");
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.5: Rejects passwords shorter than 8 characters", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const shortPasswordArb = fc
        .string({ minLength: 0, maxLength: 7 })
        .filter((s) => s.length < 8);

      fc.assert(
        fc.property(shortPasswordArb, (shortPassword) => {
          const data = {
            email: "valid@email.com",
            password: shortPassword,
            username: "validuser",
          };

          const result = registerSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const passwordErrors = result.error.issues.filter((e) =>
              e.path.includes("password")
            );
            expect(passwordErrors.length).toBeGreaterThan(0);
            expect(passwordErrors[0]?.message).toBe(
              "Password must be at least 8 characters"
            );
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.6: Rejects usernames with invalid characters", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const invalidUsernameArb = fc.oneof(
        fc.constant("user name"), // space
        fc.constant("user@name"), // @
        fc.constant("user.name"), // dot
        fc.constant("user!name"), // exclamation
        fc.constant("user#name"), // hash
        fc.stringMatching(/^[a-z]{3,10}[!@#$%^&*()]+[a-z]{3,10}$/) // special chars in middle
      );

      fc.assert(
        fc.property(invalidUsernameArb, (invalidUsername) => {
          const data = {
            email: "valid@email.com",
            password: "validpassword123",
            username: invalidUsername,
          };

          const result = registerSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const usernameErrors = result.error.issues.filter((e) =>
              e.path.includes("username")
            );
            expect(usernameErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.7: Rejects usernames too short or too long", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const invalidLengthUsernameArb = fc.oneof(
        fc.stringMatching(/^[a-z]{1,2}$/), // too short (1-2 chars)
        fc.stringMatching(/^[a-z]{31,50}$/) // too long (31+ chars)
      );

      fc.assert(
        fc.property(invalidLengthUsernameArb, (invalidUsername) => {
          const data = {
            email: "valid@email.com",
            password: "validpassword123",
            username: invalidUsername,
          };

          const result = registerSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const usernameErrors = result.error.issues.filter((e) =>
              e.path.includes("username")
            );
            expect(usernameErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("loginSchema Validation", () => {
    it("Property 14.8: Rejects empty passwords", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      fc.assert(
        fc.property(fc.constant(""), (emptyPassword) => {
          const data = {
            email: "valid@email.com",
            password: emptyPassword,
          };

          const result = loginSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const passwordErrors = result.error.issues.filter((e) =>
              e.path.includes("password")
            );
            expect(passwordErrors.length).toBeGreaterThan(0);
            expect(passwordErrors[0]?.message).toBe("Password is required");
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("themeSchema Validation", () => {
    it("Property 14.9: Rejects invalid theme values", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const invalidThemeArb = fc
        .string({ minLength: 1, maxLength: 20 })
        .filter((s) => !["aurora", "cyber", "glass"].includes(s));

      fc.assert(
        fc.property(invalidThemeArb, (invalidTheme) => {
          const result = themeSchema.safeParse(invalidTheme);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("updateProfileSchema Validation", () => {
    it("Property 14.10: Rejects names exceeding max length", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const longNameArb = fc
        .string({ minLength: 101, maxLength: 200 })
        .filter((s) => s.length > 100);

      fc.assert(
        fc.property(longNameArb, (longName) => {
          const data = {
            name: longName,
          };

          const result = updateProfileSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const nameErrors = result.error.issues.filter((e) =>
              e.path.includes("name")
            );
            expect(nameErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.11: Rejects bios exceeding max length", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       */
      const longBioArb = fc
        .string({ minLength: 501, maxLength: 600 })
        .filter((s) => s.length > 500);

      fc.assert(
        fc.property(longBioArb, (longBio) => {
          const data = {
            bio: longBio,
          };

          const result = updateProfileSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const bioErrors = result.error.issues.filter((e) =>
              e.path.includes("bio")
            );
            expect(bioErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Property 14.12: Rejects invalid avatar URLs (non-URL strings)", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       *
       * Note: Zod's url() validator accepts any valid URL scheme (http, https, ftp, etc.)
       * We test strings that are definitively NOT valid URLs
       */
      const invalidAvatarUrlArb = fc.oneof(
        fc.constant("notaurl"),
        fc.stringMatching(/^[a-z]{3,10}$/), // just text, no scheme
        fc.stringMatching(/^www\.[a-z]{3,10}\.[a-z]{2,4}$/), // missing protocol
        fc.constant("http://"), // incomplete URL
        fc.constant("https://"), // incomplete URL
        fc.stringMatching(/^[a-z]{3,10}@[a-z]{3,10}\.[a-z]{2,4}$/) // email-like
      );

      fc.assert(
        fc.property(invalidAvatarUrlArb, (invalidUrl) => {
          const data = {
            avatarUrl: invalidUrl,
          };

          const result = updateProfileSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const avatarErrors = result.error.issues.filter((e) =>
              e.path.includes("avatarUrl")
            );
            expect(avatarErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Comprehensive Invalid Data Rejection", () => {
    it("Property 14: Any non-conforming data is rejected with specific errors", { timeout: 60000 }, () => {
      /**
       * **Feature: linkpro, Property 14: Zod Validation Rejects Invalid Data**
       * **Validates: Requirements 7.1, 7.2**
       *
       * This is the main comprehensive property test that validates
       * the overall behavior of Zod validation across all schemas.
       */

      // Generate various types of invalid data
      const invalidDataArb = fc.oneof(
        // Invalid createLinkSchema data - empty title
        fc.record({
          type: fc.constant("createLink" as const),
          data: fc.record({
            title: fc.constant(""), // empty title is invalid
            url: fc.constant("https://valid.com"),
          }),
        }),
        // Invalid createLinkSchema data - invalid URL
        fc.record({
          type: fc.constant("createLink" as const),
          data: fc.record({
            title: fc.constant("Valid Title"),
            url: fc.constant("not-a-url"), // invalid URL
          }),
        }),
        // Invalid registerSchema data
        fc.record({
          type: fc.constant("register" as const),
          data: fc.record({
            email: fc.constant("invalid-email"),
            password: fc.constant("short"),
            username: fc.constant("ab"), // too short
          }),
        }),
        // Invalid themeSchema data
        fc.record({
          type: fc.constant("theme" as const),
          data: fc.constant("invalid-theme"),
        })
      );

      fc.assert(
        fc.property(invalidDataArb, ({ type, data }) => {
          let result;

          switch (type) {
            case "createLink":
              result = createLinkSchema.safeParse(data);
              break;
            case "register":
              result = registerSchema.safeParse(data);
              break;
            case "theme":
              result = themeSchema.safeParse(data);
              break;
          }

          // All invalid data should be rejected
          expect(result.success).toBe(false);

          // Should have specific error messages
          if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
            // Each issue should have a message
            result.error.issues.forEach((issue) => {
              expect(issue.message).toBeDefined();
              expect(typeof issue.message).toBe("string");
              expect(issue.message.length).toBeGreaterThan(0);
            });
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
