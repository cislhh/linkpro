/**
 * Application constants
 */

// Avatar upload specifications
export const AVATAR_SPEC = {
  maxSize: 2 * 1024 * 1024, // 2MB in bytes
  allowedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  recommendedSize: { width: 400, height: 400 },
  minSize: { width: 200, height: 200 },
} as const;
