"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createLinkSchema, updateLinkSchema, type CreateLinkInput, type UpdateLinkInput } from "@/lib/validations";
import type { Link, ActionResult } from "@/types";

/**
 * Get all links for the authenticated user
 * 
 * - Checks user authentication
 * - Returns all links ordered by their order field
 * 
 * Requirements: 2.2
 */
export async function getUserLinks(): Promise<ActionResult<Link[]>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Get all links for the user, ordered by order field
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
    });

    return { success: true, data: links };
  } catch (error) {
    console.error("getUserLinks error:", error);
    return { success: false, error: "Failed to get links" };
  }
}

/**
 * Create a new link for the authenticated user
 * 
 * - Validates input using Zod schema
 * - Checks user authentication
 * - Creates link in database associated with user
 * 
 * Requirements: 2.1
 */
export async function createLink(
  data: CreateLinkInput
): Promise<ActionResult<Link>> {
  try {
    // 1. Validate input using Zod schema
    const validated = createLinkSchema.parse(data);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Get the next order value for the user's links
    const maxOrderLink = await prisma.link.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = validated.order ?? (maxOrderLink ? maxOrderLink.order + 1 : 0);

    // 4. Create link in database
    const link = await prisma.link.create({
      data: {
        title: validated.title,
        url: validated.url,
        icon: validated.icon ?? null,
        order: nextOrder,
        isActive: validated.isActive ?? true,
        userId: session.user.id,
      },
    });

    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("createLink error:", error);
    return { success: false, error: "Failed to create link" };
  }
}


/**
 * Update an existing link for the authenticated user
 * 
 * - Validates input using Zod schema (partial validation)
 * - Checks user authentication
 * - Verifies link ownership
 * - Updates link in database with provided fields
 * 
 * Requirements: 2.2
 */
export async function updateLink(
  id: string,
  data: UpdateLinkInput
): Promise<ActionResult<Link>> {
  try {
    // 1. Validate input using Zod schema (partial - all fields optional)
    const validated = updateLinkSchema.parse(data);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Verify link exists and belongs to the user
    const existingLink = await prisma.link.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingLink) {
      return { success: false, error: "Link not found" };
    }

    if (existingLink.userId !== session.user.id) {
      return { success: false, error: "Not authorized to update this link" };
    }

    // 4. Update link in database with only the provided fields
    const link = await prisma.link.update({
      where: { id },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.url !== undefined && { url: validated.url }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.order !== undefined && { order: validated.order }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("updateLink error:", error);
    return { success: false, error: "Failed to update link" };
  }
}


/**
 * Delete an existing link for the authenticated user
 * 
 * - Checks user authentication
 * - Verifies link ownership
 * - Deletes link from database
 * 
 * Requirements: 2.3
 */
export async function deleteLink(id: string): Promise<ActionResult<void>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Verify link exists and belongs to the user
    const existingLink = await prisma.link.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingLink) {
      return { success: false, error: "Link not found" };
    }

    if (existingLink.userId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this link" };
    }

    // 3. Delete link from database
    await prisma.link.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteLink error:", error);
    return { success: false, error: "Failed to delete link" };
  }
}


/**
 * Reorder links for the authenticated user
 * 
 * - Checks user authentication
 * - Validates all link IDs belong to the user
 * - Batch updates link order based on array position
 * 
 * Requirements: 2.4
 */
export async function reorderLinks(linkIds: string[]): Promise<ActionResult<void>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Validate input - must be non-empty array
    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return { success: false, error: "Link IDs array is required" };
    }

    // 3. Verify all links exist and belong to the user
    const existingLinks = await prisma.link.findMany({
      where: {
        id: { in: linkIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (existingLinks.length !== linkIds.length) {
      return { success: false, error: "One or more links not found or not authorized" };
    }

    // 4. Batch update link orders using a transaction
    await prisma.$transaction(
      linkIds.map((id, index) =>
        prisma.link.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("reorderLinks error:", error);
    return { success: false, error: "Failed to reorder links" };
  }
}
