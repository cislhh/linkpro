import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * **Feature: linkpro, Property 1: User Registration Creates Retrievable User**
 * **Validates: Requirements 1.1**
 *
 * For any valid email and password combination, when a user registers,
 * the system should create a user that can be retrieved from the database
 * with the same email.
 */

// Create a dedicated Prisma client for tests
const testPrisma = new PrismaClient();

// Arbitrary for generating valid emails
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/), // local part
    fc.stringMatching(/^[a-z]{3,8}$/), // domain
    fc.constantFrom("com", "org", "net", "io") // tld
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// Arbitrary for generating valid passwords (min 8 chars)
const validPasswordArb = fc
  .stringMatching(/^[A-Za-z0-9!@#$%^&*]{8,20}$/)
  .filter((p) => p.length >= 8);

// Arbitrary for generating valid usernames
const validUsernameArb = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/)
  .filter((u) => u.length >= 3 && u.length <= 30);

// Direct database functions for testing (bypassing server actions)
async function registerUserDirect(data: {
  email: string;
  password: string;
  username: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return testPrisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function getUserByEmailDirect(email: string) {
  return testPrisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

describe("User Registration Property Tests", () => {
  beforeAll(async () => {
    // Ensure database connection is ready
    await testPrisma.$connect();
  });

  afterAll(async () => {
    // Final cleanup and disconnect
    await testPrisma.user.deleteMany({
      where: { email: { startsWith: "test_pbt_" } },
    });
    await testPrisma.$disconnect();
  });

  it("Property 1: User Registration Creates Retrievable User", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 1: User Registration Creates Retrievable User**
     * **Validates: Requirements 1.1**
     */
    const createdEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          validUsernameArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (email, password, username, suffix) => {
            // Make email and username unique for this test run
            const uniqueEmail = `test_pbt_${suffix}_${email}`;
            const uniqueUsername = `${username}_${suffix}`;

            try {
              // Register the user
              const createdUser = await registerUserDirect({
                email: uniqueEmail,
                password,
                username: uniqueUsername,
              });

              // Track for cleanup
              createdEmails.push(uniqueEmail);

              // Assert user was created
              expect(createdUser).toBeDefined();
              expect(createdUser.id).toBeDefined();

              // Retrieve the user by email
              const retrievedUser = await getUserByEmailDirect(uniqueEmail);

              // Assert retrieval succeeded
              expect(retrievedUser).not.toBeNull();

              if (retrievedUser) {
                // Assert the retrieved user has the same email
                expect(retrievedUser.email).toBe(uniqueEmail);
                // Assert the retrieved user has the same username
                expect(retrievedUser.username).toBe(uniqueUsername);
                // Assert the user has an id
                expect(retrievedUser.id).toBe(createdUser.id);
              }
            } catch (error) {
              // If it's a unique constraint violation, that's expected for duplicate suffixes
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                return; // Skip this iteration
              }
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Cleanup all created users
      if (createdEmails.length > 0) {
        await testPrisma.user.deleteMany({
          where: { email: { in: createdEmails } },
        });
      }
    }
  });
});
