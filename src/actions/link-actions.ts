"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createLinkSchema, type CreateLinkInput } from "@/lib/validations";
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
      return { success: false, error: error.errors[0].message };
    }
    console.error("createLink error:", error);
    return { success: false, error: "Failed to create link" };
  }
}
