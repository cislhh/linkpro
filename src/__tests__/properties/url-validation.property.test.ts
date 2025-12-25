import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { z } from "zod";
import { createLinkSchema } from "@/lib/validations";

/**
 * **Feature: linkpro, Property 7: URL Validation Rejects Invalid URLs**
 * **Validates: Requirements 2.5**
 *
 * For any string that is not a valid URL format, attempting to create
 * a link with that URL should be rejected by Zod validation.
 */

// URL-only schema for focused testing
const urlSchema = z.string().url("Invalid URL format");

// Arbitrary for generating invalid URLs - strings that are NOT valid URLs
// Note: Zod's url() validator uses the URL constructor which accepts any valid scheme
// We focus on strings that are definitively NOT valid URLs per URL spec
const invalidUrlArb = fc.oneof(
  // Plain text without protocol
  fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
  // Missing protocol (www without scheme)
  fc.stringMatching(/^www\.[a-z]{3,10}\.[a-z]{2,4}$/),
  // Just a domain without protocol
  fc.stringMatching(/^[a-z]{3,10}\.[a-z]{2,4}$/),
  // Empty string
  fc.constant(""),
  // Whitespace only
  fc.stringMatching(/^\s{1,5}$/),
  // Random garbage characters (no colon, so not a valid scheme)
  fc.stringMatching(/^[!@#$%^&*()]{1,10}$/),
  // Incomplete URLs (protocol only, no host - these are invalid)
  fc.constant("http://"),
  fc.constant("https://"),
  // URLs with spaces in the middle (invalid)
  fc.stringMatching(/^https?:\/\/[a-z]{3,10} [a-z]{3,10}\.[a-z]{2,4}$/),
  // Invalid characters in URL (angle brackets are not allowed)
  fc.stringMatching(/^https?:\/\/[a-z]{3,10}<>[a-z]{3,10}\.[a-z]{2,4}$/),
  // Just numbers (no scheme)
  fc.stringMatching(/^[0-9]{1,10}$/),
  // Paths without scheme
  fc.stringMatching(/^\/[a-z]{1,10}\/[a-z]{1,10}$/),
  // Email-like strings (not URLs)
  fc.stringMatching(/^[a-z]{3,10}@[a-z]{3,10}\.[a-z]{2,4}$/)
);

// Arbitrary for generating valid link data (except URL)
const validTitleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

describe("URL Validation Property Tests", () => {
  it("Property 7: URL Validation Rejects Invalid URLs", { timeout: 60000 }, async () => {
    /**
     * **Feature: linkpro, Property 7: URL Validation Rejects Invalid URLs**
     * **Validates: Requirements 2.5**
     */
    await fc.assert(
      fc.property(
        invalidUrlArb,
        (invalidUrl) => {
          // Test URL validation directly
          const urlResult = urlSchema.safeParse(invalidUrl);
          
          // The URL validation should fail for invalid URLs
          expect(urlResult.success).toBe(false);

          // Also test within the full createLinkSchema context
          const linkData = {
            title: "Test Link",
            url: invalidUrl,
          };

          const linkResult = createLinkSchema.safeParse(linkData);

          // The validation should fail for invalid URLs
          expect(linkResult.success).toBe(false);

          // Verify the error is specifically about the URL field
          if (!linkResult.success) {
            const urlErrors = linkResult.error.issues.filter(
              (e) => e.path.includes("url")
            );
            expect(urlErrors.length).toBeGreaterThan(0);
            expect(urlErrors[0].message).toBe("Invalid URL format");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 7 (Inverse): URL Validation Accepts Valid URLs", { timeout: 60000 }, async () => {
    /**
     * Complementary test: Valid URLs should be accepted
     * This ensures our validation isn't too strict
     */
    
    // Arbitrary for generating valid URLs
    const validUrlArb = fc.oneof(
      // HTTP URLs
      fc.tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom(".com", ".org", ".net", ".io", ".dev")
      ).map(([domain, tld]) => `http://${domain}${tld}`),
      // HTTPS URLs
      fc.tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom(".com", ".org", ".net", ".io", ".dev")
      ).map(([domain, tld]) => `https://${domain}${tld}`),
      // URLs with paths
      fc.tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom(".com", ".org", ".net"),
        fc.stringMatching(/^\/[a-z]{1,10}$/)
      ).map(([domain, tld, path]) => `https://${domain}${tld}${path}`),
      // URLs with www
      fc.tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom(".com", ".org", ".net")
      ).map(([domain, tld]) => `https://www.${domain}${tld}`)
    );

    await fc.assert(
      fc.property(
        validUrlArb,
        validTitleArb,
        (validUrl, title) => {
          const linkData = {
            title,
            url: validUrl,
          };

          const result = createLinkSchema.safeParse(linkData);

          // The validation should succeed for valid URLs
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
