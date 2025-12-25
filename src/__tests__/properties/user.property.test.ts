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

// Direct function to check if username exists
async function getUserByUsernameDirect(username: string) {
  return testPrisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
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

  it("Property 2: Username Uniqueness", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 2: Username Uniqueness**
     * **Validates: Requirements 1.3**
     *
     * For any set of registered users, all usernames must be unique -
     * no two users can have the same username.
     */
    const createdEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          validUsernameArb,
          validPasswordArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (username, password, suffix) => {
            // Create a unique username for this test
            const testUsername = `uniq_${suffix}_${username}`;
            const firstEmail = `test_pbt_first_${suffix}@test.com`;
            const secondEmail = `test_pbt_second_${suffix}@test.com`;

            // First, clean up any existing users with these emails
            await testPrisma.user.deleteMany({
              where: { email: { in: [firstEmail, secondEmail] } },
            });

            // Register the first user with the username
            const firstUser = await registerUserDirect({
              email: firstEmail,
              password,
              username: testUsername,
            });
            createdEmails.push(firstEmail);

            expect(firstUser).toBeDefined();
            expect(firstUser.username).toBe(testUsername);

            // Verify the username exists in the database
            const existingUser = await getUserByUsernameDirect(testUsername);
            expect(existingUser).not.toBeNull();
            expect(existingUser?.username).toBe(testUsername);

            // Attempt to register a second user with the SAME username
            // This should fail due to unique constraint
            let duplicateCreationFailed = false;
            try {
              await registerUserDirect({
                email: secondEmail,
                password,
                username: testUsername, // Same username as first user
              });
              // If we reach here, the duplicate was allowed (which is wrong)
              createdEmails.push(secondEmail);
            } catch (error) {
              // Expected: unique constraint violation
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                duplicateCreationFailed = true;
              } else {
                throw error;
              }
            }

            // Assert that duplicate username creation was rejected
            expect(duplicateCreationFailed).toBe(true);

            // Verify only one user exists with this username
            const usersWithUsername = await testPrisma.user.findMany({
              where: { username: testUsername },
            });
            expect(usersWithUsername.length).toBe(1);
            expect(usersWithUsername[0].id).toBe(firstUser.id);
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
      // Also cleanup by pattern
      await testPrisma.user.deleteMany({
        where: {
          OR: [
            { email: { startsWith: "test_pbt_first_" } },
            { email: { startsWith: "test_pbt_second_" } },
          ],
        },
      });
    }
  });
});
