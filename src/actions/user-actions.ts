"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Register a new user with email, password, and username
 */
export async function registerUser(
  data: RegisterInput
): Promise<ActionResult<User>> {
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
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
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
): Promise<ActionResult<User | null>> {
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
