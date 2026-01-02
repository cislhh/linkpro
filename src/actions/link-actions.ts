"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createLinkSchema, updateLinkSchema, type CreateLinkInput, type UpdateLinkInput } from "@/lib/validations";
import type { Link, ActionResult } from "@/types";

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
