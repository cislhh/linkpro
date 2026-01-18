"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  updateProfileSchema,
  themeSchema,
  registerSchema,
  type UpdateProfileInput,
  type ThemeType,
  type RegisterInput,
} from "@/lib/validations";
import type { User } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { Project } from "@/types";

// User type for return values - matches select statements in actions
type UserResult = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
  projects: Project[] | null;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
};

// Action result type
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Register a new user with email, password, and username
 */
export async function registerUser(
  data: RegisterInput
): Promise<ActionResult<UserResult>> {
  try {
    // Validate input
    const validated = registerSchema.parse(data);

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingEmail) {
      return { success: false, error: "Email already registered" };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (existingUsername) {
      return { success: false, error: "Username already taken" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        username: validated.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    console.error("registerUser error:", error);
    return { success: false, error: "Failed to register user" };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string
): Promise<ActionResult<UserResult | null>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("getUserByEmail error:", error);
    return { success: false, error: "Failed to retrieve user" };
  }
}

/**
 * Update user profile (name, bio, avatarUrl, phone, contact, projects)
 * Requirements: 3.3
 */
export async function updateUserProfile(
  data: UpdateProfileInput
): Promise<ActionResult<UserResult>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Validate input
    const validated = updateProfileSchema.parse(data);

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        bio: validated.bio,
        avatarUrl: validated.avatarUrl === "" ? null : validated.avatarUrl,
        phone:
          validated.phone && validated.phone !== "" ? validated.phone : null,
        contact:
          validated.contact && validated.contact !== ""
            ? validated.contact
            : null,
        ...(validated.projects !== undefined && {
          projects: validated.projects,
        }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    console.error("updateUserProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Update user theme selection
 * Requirements: 3.3
 */
export async function updateUserTheme(
  theme: ThemeType
): Promise<ActionResult<UserResult>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Validate theme
    const validatedTheme = themeSchema.parse(theme);

    // Update user theme
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        theme: validatedTheme,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    console.error("updateUserTheme error:", error);
    return { success: false, error: "Failed to update theme" };
  }
}

/**
 * Get current user profile
 * Returns the authenticated user's profile data including phone and contact
 */
export async function getUserProfile(): Promise<ActionResult<UserResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return { success: false, error: "获取用户信息失败" };
  }
}

/**
 * Update user projects
 * Requirements: Project management in profile page
 */
export async function updateUserProjects(
  projects: Project[]
): Promise<ActionResult<UserResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    // Validate projects array
    const validated = updateProfileSchema.parse({ projects });

    // Update user projects
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        projects: validated.projects,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        projects: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "验证失败" };
    }
    console.error("updateUserProjects error:", error);
    return { success: false, error: "更新项目失败" };
  }
}
