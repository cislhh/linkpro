"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { AVATAR_SPEC } from "@/lib/constants";

// Action result type
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Upload avatar image
 *
 * Specifications:
 * - Max file size: 2MB
 * - Allowed formats: JPG, PNG, WebP
 * - Recommended size: 400x400px
 * - Minimum size: 200x200px
 *
 * The file is saved to public/avatars directory with a unique filename.
 * Note: Image dimensions validation should be done on the client side.
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    // Get file from form data
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "未找到文件" };
    }

    // Validate file size
    if (file.size > AVATAR_SPEC.maxSize) {
      return {
        success: false,
        error: `文件大小不能超过 ${AVATAR_SPEC.maxSize / 1024 / 1024}MB`,
      };
    }

    // Validate file type
    const isValidType = AVATAR_SPEC.allowedFormats.some(format => format === file.type);
    if (!isValidType) {
      return {
        success: false,
        error: "不支持的文件格式。支持的格式: JPG, PNG, WebP",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = getFileExtension(file.type);
    const filename = `${session.user.id}-${timestamp}-${random}.${extension}`;

    // Create avatars directory if it doesn't exist
    const avatarsDir = join(process.cwd(), "public", "avatars");
    try {
      await mkdir(avatarsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(avatarsDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/avatars/${filename}`;
    return { success: true, data: { url } };
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return { success: false, error: "上传失败" };
  }
}

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
}
