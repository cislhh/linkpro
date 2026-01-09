"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import {
  createModuleSchema,
  updateModuleSchema,
  type CreateModuleInput,
  type UpdateModuleInput,
} from "@/lib/validations";
import type { PageModule, ActionResult, ModuleData } from "@/types";

/**
 * Get all page modules for the authenticated user
 * 
 * - Checks user authentication
 * - Returns all modules ordered by their order field
 * 
 * Requirements: 11.1
 */
export async function getModules(): Promise<ActionResult<PageModule[]>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Get all modules for the user, ordered by order field
    const modules = await prisma.pageModule.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
    });

    // 3. Transform Prisma result to PageModule type
    const typedModules: PageModule[] = modules.map((module) => ({
      ...module,
      type: module.type as PageModule["type"],
      data: module.data as unknown as ModuleData,
    }));

    return { success: true, data: typedModules };
  } catch (error) {
    console.error("getModules error:", error);
    return { success: false, error: "Failed to get modules" };
  }
}


/**
 * Create a new page module for the authenticated user
 * 
 * - Validates input using Zod schema
 * - Checks user authentication
 * - Supports different module types with type-specific data validation
 * - Creates module in database associated with user
 * 
 * Requirements: 11.2
 */
export async function createModule(
  data: CreateModuleInput
): Promise<ActionResult<PageModule>> {
  try {
    // 1. Validate input using Zod schema
    const validated = createModuleSchema.parse(data);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Validate that data.type matches the module type
    if (validated.data.type !== validated.type) {
      return {
        success: false,
        error: `Module data type '${validated.data.type}' does not match module type '${validated.type}'`,
      };
    }

    // 4. Get the next order value for the user's modules
    const maxOrderModule = await prisma.pageModule.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = validated.order ?? (maxOrderModule ? maxOrderModule.order + 1 : 0);

    // 5. Create module in database
    const module = await prisma.pageModule.create({
      data: {
        type: validated.type,
        title: validated.title ?? null,
        data: validated.data,
        order: nextOrder,
        gridX: validated.gridX ?? 0,
        gridY: validated.gridY ?? 0,
        gridW: validated.gridW ?? 1,
        gridH: validated.gridH ?? 1,
        userId: session.user.id,
      },
    });

    // 6. Transform to PageModule type
    const typedModule: PageModule = {
      ...module,
      type: module.type as PageModule["type"],
      data: module.data as unknown as ModuleData,
    };

    return { success: true, data: typedModule };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("createModule error:", error);
    return { success: false, error: "Failed to create module" };
  }
}


/**
 * Update an existing page module for the authenticated user
 * 
 * - Validates input using Zod schema (partial validation)
 * - Checks user authentication
 * - Verifies module ownership
 * - Updates module in database with provided fields
 * 
 * Requirements: 11.3
 */
export async function updateModule(
  id: string,
  data: UpdateModuleInput
): Promise<ActionResult<PageModule>> {
  try {
    // 1. Validate input using Zod schema (partial - all fields optional)
    const validated = updateModuleSchema.parse(data);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Verify module exists and belongs to the user
    const existingModule = await prisma.pageModule.findUnique({
      where: { id },
      select: { userId: true, type: true },
    });

    if (!existingModule) {
      return { success: false, error: "Module not found" };
    }

    if (existingModule.userId !== session.user.id) {
      return { success: false, error: "Not authorized to update this module" };
    }

    // 4. If data is provided, validate that data.type matches the existing module type
    if (validated.data && validated.data.type !== existingModule.type) {
      return {
        success: false,
        error: `Cannot change module data type from '${existingModule.type}' to '${validated.data.type}'`,
      };
    }

    // 5. Update module in database with only the provided fields
    const module = await prisma.pageModule.update({
      where: { id },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.data !== undefined && { data: validated.data }),
        ...(validated.order !== undefined && { order: validated.order }),
        ...(validated.gridX !== undefined && { gridX: validated.gridX }),
        ...(validated.gridY !== undefined && { gridY: validated.gridY }),
        ...(validated.gridW !== undefined && { gridW: validated.gridW }),
        ...(validated.gridH !== undefined && { gridH: validated.gridH }),
      },
    });

    // 6. Transform to PageModule type
    const typedModule: PageModule = {
      ...module,
      type: module.type as PageModule["type"],
      data: module.data as unknown as ModuleData,
    };

    return { success: true, data: typedModule };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("updateModule error:", error);
    return { success: false, error: "Failed to update module" };
  }
}


/**
 * Delete an existing page module for the authenticated user
 * 
 * - Checks user authentication
 * - Verifies module ownership
 * - Deletes module from database
 * 
 * Requirements: 11.4
 */
export async function deleteModule(id: string): Promise<ActionResult<void>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Verify module exists and belongs to the user
    const existingModule = await prisma.pageModule.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingModule) {
      return { success: false, error: "Module not found" };
    }

    if (existingModule.userId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this module" };
    }

    // 3. Delete module from database
    await prisma.pageModule.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteModule error:", error);
    return { success: false, error: "Failed to delete module" };
  }
}


// Layout item type for saveLayout action
interface LayoutItemInput {
  id: string;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
}

// Zod schema for layout item validation
const layoutItemSchema = z.object({
  id: z.string().min(1, "Module ID is required"),
  gridX: z.number().int().min(0, "Grid X must be non-negative"),
  gridY: z.number().int().min(0, "Grid Y must be non-negative"),
  gridW: z.number().int().min(1, "Grid width must be at least 1"),
  gridH: z.number().int().min(1, "Grid height must be at least 1"),
});

const saveLayoutSchema = z.array(layoutItemSchema);

/**
 * Save layout positions for multiple modules in a single transaction
 * 
 * - Validates input using Zod schema
 * - Checks user authentication
 * - Verifies all modules belong to the user
 * - Batch updates all module positions in a transaction
 * 
 * Requirements: 12.4
 */
export async function saveLayout(
  layoutItems: LayoutItemInput[]
): Promise<ActionResult<PageModule[]>> {
  try {
    // 1. Validate input using Zod schema
    const validated = saveLayoutSchema.parse(layoutItems);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Get all module IDs from the input
    const moduleIds = validated.map((item) => item.id);

    // 4. Verify all modules exist and belong to the user
    const existingModules = await prisma.pageModule.findMany({
      where: {
        id: { in: moduleIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    const existingIds = new Set(existingModules.map((m) => m.id));
    const missingIds = moduleIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      return {
        success: false,
        error: `Modules not found or not authorized: ${missingIds.join(", ")}`,
      };
    }

    // 5. Batch update all modules in a transaction
    const updatePromises = validated.map((item) =>
      prisma.pageModule.update({
        where: { id: item.id },
        data: {
          gridX: item.gridX,
          gridY: item.gridY,
          gridW: item.gridW,
          gridH: item.gridH,
        },
      })
    );

    const updatedModules = await prisma.$transaction(updatePromises);

    // 6. Transform to PageModule type
    const typedModules: PageModule[] = updatedModules.map((module) => ({
      ...module,
      type: module.type as PageModule["type"],
      data: module.data as unknown as ModuleData,
    }));

    return { success: true, data: typedModules };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("saveLayout error:", error);
    return { success: false, error: "Failed to save layout" };
  }
}
