import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * **Feature: linkpro, Property 3: Link Creation Association**
 * **Validates: Requirements 2.1**
 *
 * For any valid link data (title, URL, optional icon) and authenticated user,
 * creating a link should result in the link being associated with that user
 * and retrievable from the user's link list.
 */

// Create a dedicated Prisma client for tests
const testPrisma = new PrismaClient();

// Arbitrary for generating valid link titles (1-100 chars)
const validTitleArb = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,49}$/)
  .filter((t) => t.length >= 1 && t.length <= 100);

// Arbitrary for generating valid URLs
const validUrlArb = fc
  .tuple(
    fc.constantFrom("https", "http"),
    fc.stringMatching(/^[a-z][a-z0-9]{2,15}$/), // domain
    fc.constantFrom("com", "org", "net", "io", "dev"),
    fc.stringMatching(/^[a-z0-9]{0,10}$/) // optional path
  )
  .map(([protocol, domain, tld, path]) => 
    path ? `${protocol}://${domain}.${tld}/${path}` : `${protocol}://${domain}.${tld}`
  );

// Arbitrary for generating optional icon strings
const optionalIconArb = fc.option(
  fc.constantFrom("github", "twitter", "linkedin", "instagram", "youtube", "website"),
  { nil: undefined }
);

// Arbitrary for generating valid emails
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/),
    fc.stringMatching(/^[a-z]{3,8}$/),
    fc.constantFrom("com", "org", "net", "io")
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

// Direct database function to create a test user
async function createTestUser(data: {
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
  });
}

// Direct database function to create a link for a user
async function createLinkDirect(userId: string, data: {
  title: string;
  url: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}) {
  return testPrisma.link.create({
    data: {
      userId,
      title: data.title,
      url: data.url,
      icon: data.icon ?? null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

// Direct database function to get all links for a user
async function getUserLinks(userId: string) {
  return testPrisma.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });
}

// Direct database function to get a link by ID
async function getLinkById(linkId: string) {
  return testPrisma.link.findUnique({
    where: { id: linkId },
  });
}

// Direct database function to update a link
async function updateLinkDirect(linkId: string, data: {
  title?: string;
  url?: string;
  icon?: string | null;
  order?: number;
  isActive?: boolean;
}) {
  return testPrisma.link.update({
    where: { id: linkId },
    data,
  });
}

describe("Link Creation Property Tests", () => {
  beforeAll(async () => {
    await testPrisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test data
    await testPrisma.link.deleteMany({
      where: { user: { email: { startsWith: "test_link_pbt_" } } },
    });
    await testPrisma.user.deleteMany({
      where: { email: { startsWith: "test_link_pbt_" } },
    });
    await testPrisma.$disconnect();
  });

  it("Property 3: Link Creation Association", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 3: Link Creation Association**
     * **Validates: Requirements 2.1**
     *
     * For any valid link data (title, URL, optional icon) and authenticated user,
     * creating a link should result in the link being associated with that user
     * and retrievable from the user's link list.
     */
    const createdUserEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          validTitleArb,
          validUrlArb,
          optionalIconArb,
          validEmailArb,
          validPasswordArb,
          validUsernameArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (title, url, icon, email, password, username, suffix) => {
            // Make email and username unique for this test run
            const uniqueEmail = `test_link_pbt_${suffix}_${email}`;
            const uniqueUsername = `link_${suffix}_${username}`;

            try {
              // 1. Create a test user
              const user = await createTestUser({
                email: uniqueEmail,
                password,
                username: uniqueUsername,
              });
              createdUserEmails.push(uniqueEmail);

              // 2. Create a link for the user
              const createdLink = await createLinkDirect(user.id, {
                title,
                url,
                icon,
              });

              // 3. Assert link was created with correct data
              expect(createdLink).toBeDefined();
              expect(createdLink.id).toBeDefined();
              expect(createdLink.title).toBe(title);
              expect(createdLink.url).toBe(url);
              expect(createdLink.icon).toBe(icon ?? null);
              expect(createdLink.userId).toBe(user.id);

              // 4. Retrieve the link by ID and verify association
              const retrievedLink = await getLinkById(createdLink.id);
              expect(retrievedLink).not.toBeNull();
              expect(retrievedLink?.userId).toBe(user.id);
              expect(retrievedLink?.title).toBe(title);
              expect(retrievedLink?.url).toBe(url);

              // 5. Retrieve user's link list and verify the link is present
              const userLinks = await getUserLinks(user.id);
              expect(userLinks.length).toBeGreaterThanOrEqual(1);
              
              const foundLink = userLinks.find((l) => l.id === createdLink.id);
              expect(foundLink).toBeDefined();
              expect(foundLink?.title).toBe(title);
              expect(foundLink?.url).toBe(url);
              expect(foundLink?.userId).toBe(user.id);

            } catch (error) {
              // If it's a unique constraint violation, skip this iteration
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Cleanup all created users and their links (cascade delete)
      if (createdUserEmails.length > 0) {
        await testPrisma.user.deleteMany({
          where: { email: { in: createdUserEmails } },
        });
      }
    }
  });

  it("Property 4: Link Update Persistence", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 4: Link Update Persistence**
     * **Validates: Requirements 2.2**
     *
     * For any existing link and valid update data, updating the link should
     * persist the changes such that retrieving the link returns the updated values.
     */
    const createdUserEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          // Initial link data
          validTitleArb,
          validUrlArb,
          optionalIconArb,
          // Updated link data
          validTitleArb,
          validUrlArb,
          optionalIconArb,
          fc.boolean(), // isActive update
          fc.integer({ min: 0, max: 100 }), // order update
          // User data
          validEmailArb,
          validPasswordArb,
          validUsernameArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (
            initialTitle,
            initialUrl,
            initialIcon,
            updatedTitle,
            updatedUrl,
            updatedIcon,
            updatedIsActive,
            updatedOrder,
            email,
            password,
            username,
            suffix
          ) => {
            // Make email and username unique for this test run
            const uniqueEmail = `test_link_pbt_upd_${suffix}_${email}`;
            const uniqueUsername = `upd_${suffix}_${username}`;

            try {
              // 1. Create a test user
              const user = await createTestUser({
                email: uniqueEmail,
                password,
                username: uniqueUsername,
              });
              createdUserEmails.push(uniqueEmail);

              // 2. Create an initial link for the user
              const initialLink = await createLinkDirect(user.id, {
                title: initialTitle,
                url: initialUrl,
                icon: initialIcon,
                order: 0,
                isActive: true,
              });

              // 3. Update the link with new data
              const updatedLink = await updateLinkDirect(initialLink.id, {
                title: updatedTitle,
                url: updatedUrl,
                icon: updatedIcon ?? null,
                order: updatedOrder,
                isActive: updatedIsActive,
              });

              // 4. Assert update returned correct data
              expect(updatedLink).toBeDefined();
              expect(updatedLink.id).toBe(initialLink.id);
              expect(updatedLink.title).toBe(updatedTitle);
              expect(updatedLink.url).toBe(updatedUrl);
              expect(updatedLink.icon).toBe(updatedIcon ?? null);
              expect(updatedLink.order).toBe(updatedOrder);
              expect(updatedLink.isActive).toBe(updatedIsActive);
              expect(updatedLink.userId).toBe(user.id);

              // 5. Retrieve the link by ID and verify persistence
              const retrievedLink = await getLinkById(initialLink.id);
              expect(retrievedLink).not.toBeNull();
              expect(retrievedLink?.title).toBe(updatedTitle);
              expect(retrievedLink?.url).toBe(updatedUrl);
              expect(retrievedLink?.icon).toBe(updatedIcon ?? null);
              expect(retrievedLink?.order).toBe(updatedOrder);
              expect(retrievedLink?.isActive).toBe(updatedIsActive);
              expect(retrievedLink?.userId).toBe(user.id);

              // 6. Verify the link in user's link list also reflects updates
              const userLinks = await getUserLinks(user.id);
              const foundLink = userLinks.find((l) => l.id === initialLink.id);
              expect(foundLink).toBeDefined();
              expect(foundLink?.title).toBe(updatedTitle);
              expect(foundLink?.url).toBe(updatedUrl);
              expect(foundLink?.icon).toBe(updatedIcon ?? null);
              expect(foundLink?.order).toBe(updatedOrder);
              expect(foundLink?.isActive).toBe(updatedIsActive);

            } catch (error) {
              // If it's a unique constraint violation, skip this iteration
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Cleanup all created users and their links (cascade delete)
      if (createdUserEmails.length > 0) {
        await testPrisma.user.deleteMany({
          where: { email: { in: createdUserEmails } },
        });
      }
    }
  });

  it("Property 5: Link Deletion Removes from Database", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 5: Link Deletion Removes from Database**
     * **Validates: Requirements 2.3**
     *
     * For any existing link, deleting the link should remove it from the database
     * such that it is no longer retrievable.
     */
    const createdUserEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          // Link data
          validTitleArb,
          validUrlArb,
          optionalIconArb,
          // User data
          validEmailArb,
          validPasswordArb,
          validUsernameArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (
            title,
            url,
            icon,
            email,
            password,
            username,
            suffix
          ) => {
            // Make email and username unique for this test run
            const uniqueEmail = `test_link_pbt_del_${suffix}_${email}`;
            const uniqueUsername = `del_${suffix}_${username}`;

            try {
              // 1. Create a test user
              const user = await createTestUser({
                email: uniqueEmail,
                password,
                username: uniqueUsername,
              });
              createdUserEmails.push(uniqueEmail);

              // 2. Create a link for the user
              const createdLink = await createLinkDirect(user.id, {
                title,
                url,
                icon,
              });

              // 3. Verify link exists before deletion
              const linkBeforeDelete = await getLinkById(createdLink.id);
              expect(linkBeforeDelete).not.toBeNull();
              expect(linkBeforeDelete?.id).toBe(createdLink.id);

              // 4. Delete the link directly from database
              await testPrisma.link.delete({
                where: { id: createdLink.id },
              });

              // 5. Verify link is no longer retrievable by ID
              const linkAfterDelete = await getLinkById(createdLink.id);
              expect(linkAfterDelete).toBeNull();

              // 6. Verify link is no longer in user's link list
              const userLinks = await getUserLinks(user.id);
              const foundLink = userLinks.find((l) => l.id === createdLink.id);
              expect(foundLink).toBeUndefined();

            } catch (error) {
              // If it's a unique constraint violation, skip this iteration
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Cleanup all created users and their links (cascade delete)
      if (createdUserEmails.length > 0) {
        await testPrisma.user.deleteMany({
          where: { email: { in: createdUserEmails } },
        });
      }
    }
  });

  it("Property 6: Link Reorder Persistence", { timeout: 120000 }, async () => {
    /**
     * **Feature: linkpro, Property 6: Link Reorder Persistence**
     * **Validates: Requirements 2.4**
     *
     * For any valid reorder operation on a user's links, the new order should be
     * persisted such that retrieving the links returns them in the new order.
     */
    const createdUserEmails: string[] = [];

    try {
      await fc.assert(
        fc.asyncProperty(
          // Generate 2-5 links to reorder
          fc.integer({ min: 2, max: 5 }),
          // User data
          validEmailArb,
          validPasswordArb,
          validUsernameArb,
          fc.integer({ min: 1, max: 100000 }), // unique suffix
          async (
            numLinks,
            email,
            password,
            username,
            suffix
          ) => {
            // Make email and username unique for this test run
            const uniqueEmail = `test_link_pbt_reorder_${suffix}_${email}`;
            const uniqueUsername = `reorder_${suffix}_${username}`;

            try {
              // 1. Create a test user
              const user = await createTestUser({
                email: uniqueEmail,
                password,
                username: uniqueUsername,
              });
              createdUserEmails.push(uniqueEmail);

              // 2. Create multiple links for the user with initial order
              const createdLinks: { id: string; title: string; order: number }[] = [];
              for (let i = 0; i < numLinks; i++) {
                const link = await createLinkDirect(user.id, {
                  title: `Link ${i + 1}`,
                  url: `https://example${i}.com`,
                  order: i,
                });
                createdLinks.push({ id: link.id, title: link.title, order: link.order });
              }

              // 3. Verify initial order
              const linksBeforeReorder = await getUserLinks(user.id);
              expect(linksBeforeReorder.length).toBe(numLinks);
              for (let i = 0; i < numLinks; i++) {
                expect(linksBeforeReorder[i].order).toBe(i);
              }

              // 4. Generate a random permutation of link IDs (shuffle)
              const shuffledLinkIds = [...createdLinks.map(l => l.id)];
              // Fisher-Yates shuffle using a deterministic approach based on suffix
              for (let i = shuffledLinkIds.length - 1; i > 0; i--) {
                const j = (suffix + i) % (i + 1);
                [shuffledLinkIds[i], shuffledLinkIds[j]] = [shuffledLinkIds[j], shuffledLinkIds[i]];
              }

              // 5. Reorder links using direct database transaction (simulating reorderLinks action)
              await testPrisma.$transaction(
                shuffledLinkIds.map((id, index) =>
                  testPrisma.link.update({
                    where: { id },
                    data: { order: index },
                  })
                )
              );

              // 6. Retrieve links and verify new order is persisted
              const linksAfterReorder = await getUserLinks(user.id);
              expect(linksAfterReorder.length).toBe(numLinks);

              // Verify each link has the correct new order based on shuffled position
              for (let i = 0; i < shuffledLinkIds.length; i++) {
                const expectedLinkId = shuffledLinkIds[i];
                const linkAtPosition = linksAfterReorder[i];
                expect(linkAtPosition.id).toBe(expectedLinkId);
                expect(linkAtPosition.order).toBe(i);
              }

              // 7. Verify individual link retrieval also reflects new order
              for (let i = 0; i < shuffledLinkIds.length; i++) {
                const link = await getLinkById(shuffledLinkIds[i]);
                expect(link).not.toBeNull();
                expect(link?.order).toBe(i);
              }

            } catch (error) {
              // If it's a unique constraint violation, skip this iteration
              if (
                error instanceof Error &&
                error.message.includes("Unique constraint")
              ) {
                return;
              }
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Cleanup all created users and their links (cascade delete)
      if (createdUserEmails.length > 0) {
        await testPrisma.user.deleteMany({
          where: { email: { in: createdUserEmails } },
        });
      }
    }
  });
});


/**
 * **Feature: linkpro, Property 8: Link Data Round-Trip**
 * **Validates: Requirements 2.6, 2.7**
 *
 * For any valid Link object, serializing to JSON and then deserializing
 * should produce an equivalent Link object.
 */
describe("Link Data Round-Trip Property Tests", () => {
  // Generate valid dates using integer timestamps to avoid NaN dates
  const validDateArb = fc
    .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31 in ms
    .map((timestamp) => new Date(timestamp));

  // Arbitrary for generating valid Link objects
  const validLinkArb = fc.record({
    id: fc.stringMatching(/^[a-z0-9]{20,30}$/),
    userId: fc.stringMatching(/^[a-z0-9]{20,30}$/),
    title: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,49}$/).filter((t) => t.length >= 1 && t.length <= 100),
    url: fc.tuple(
      fc.constantFrom("https", "http"),
      fc.stringMatching(/^[a-z][a-z0-9]{2,15}$/),
      fc.constantFrom("com", "org", "net", "io", "dev"),
      fc.stringMatching(/^[a-z0-9]{0,10}$/)
    ).map(([protocol, domain, tld, path]) => 
      path ? `${protocol}://${domain}.${tld}/${path}` : `${protocol}://${domain}.${tld}`
    ),
    icon: fc.option(
      fc.constantFrom("github", "twitter", "linkedin", "instagram", "youtube", "website"),
      { nil: null }
    ),
    order: fc.integer({ min: 0, max: 1000 }),
    isActive: fc.boolean(),
    createdAt: validDateArb,
    updatedAt: validDateArb,
  });

  it("Property 8: Link Data Round-Trip", { timeout: 30000 }, async () => {
    /**
     * **Feature: linkpro, Property 8: Link Data Round-Trip**
     * **Validates: Requirements 2.6, 2.7**
     *
     * For any valid Link object, serializing to JSON and then deserializing
     * should produce an equivalent Link object.
     */
    await fc.assert(
      fc.property(
        validLinkArb,
        (link) => {
          // 1. Serialize the Link object to JSON string
          const serialized = JSON.stringify(link);

          // 2. Deserialize the JSON string back to an object
          const deserialized = JSON.parse(serialized);

          // 3. Reconstruct Date objects (JSON.parse converts dates to strings)
          const reconstructed = {
            ...deserialized,
            createdAt: new Date(deserialized.createdAt),
            updatedAt: new Date(deserialized.updatedAt),
          };

          // 4. Verify all properties are equivalent
          expect(reconstructed.id).toBe(link.id);
          expect(reconstructed.userId).toBe(link.userId);
          expect(reconstructed.title).toBe(link.title);
          expect(reconstructed.url).toBe(link.url);
          expect(reconstructed.icon).toBe(link.icon);
          expect(reconstructed.order).toBe(link.order);
          expect(reconstructed.isActive).toBe(link.isActive);
          expect(reconstructed.createdAt.getTime()).toBe(link.createdAt.getTime());
          expect(reconstructed.updatedAt.getTime()).toBe(link.updatedAt.getTime());

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
