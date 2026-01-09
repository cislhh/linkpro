"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

/**
 * Publish the user's page
 * 
 * - Checks user authentication
 * - Updates isPublished to true
 * - Records publishedAt timestamp
 * - Returns the public URL
 * 
 * Requirements: 24.2, 24.5
 */
export async function publishPage(): Promise<ActionResult<{ url: string }>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // 2. Get user to verify they exist and get username
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 3. Update publish status using raw SQL to avoid type issues
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "isPublished" = true, "publishedAt" = ${new Date()}, "updatedAt" = ${new Date()}
      WHERE id = ${userId}
    `;

    // 4. Return the public URL
    const publicUrl = `/u/${user.username}`;
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    console.error("publishPage error:", error);
    return { success: false, error: "Failed to publish page" };
  }
}

/**
 * Unpublish the user's page
 * 
 * - Checks user authentication
 * - Updates isPublished to false
 * - Clears publishedAt timestamp
 * 
 * Requirements: 24.6
 */
export async function unpublishPage(): Promise<ActionResult<void>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // 2. Update publish status using raw SQL
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "isPublished" = false, "publishedAt" = NULL, "updatedAt" = ${new Date()}
      WHERE id = ${userId}
    `;

    return { success: true, data: undefined };
  } catch (error) {
    console.error("unpublishPage error:", error);
    return { success: false, error: "Failed to unpublish page" };
  }
}

/**
 * Get the user's publish status
 * 
 * - Checks user authentication
 * - Returns publish status, timestamp, and public URL
 * 
 * Requirements: 24.4
 */
export async function getPublishStatus(): Promise<ActionResult<{
  isPublished: boolean;
  publishedAt: Date | null;
  publicUrl: string;
}>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // 2. Get user's publish status using raw SQL
    const result = await prisma.$queryRaw<Array<{
      isPublished: boolean;
      publishedAt: Date | null;
      username: string;
    }>>`
      SELECT "isPublished", "publishedAt", "username" 
      FROM "User" 
      WHERE id = ${userId}
    `;

    if (!result || result.length === 0) {
      return { success: false, error: "User not found" };
    }

    const user = result[0];
    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        isPublished: user.isPublished,
        publishedAt: user.publishedAt,
        publicUrl: `/u/${user.username}`,
      },
    };
  } catch (error) {
    console.error("getPublishStatus error:", error);
    return { success: false, error: "Failed to get publish status" };
  }
}
