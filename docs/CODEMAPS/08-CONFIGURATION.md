# Configuration - LinkPro

**Last Updated:** 2026-02-06

## Overview

LinkPro uses several configuration files for Next.js, TypeScript, ESLint, and more.

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `.env.example` | Environment variables template |
| `package.json` | Dependencies and scripts |
| `tailwind.config.js` | Tailwind CSS configuration (via v4) |
| `components.json` | shadcn/ui configuration |
| `vercel.json` | Vercel deployment settings |
| `prisma.config.ts` | Prisma configuration |

---

## Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

### Settings

| Option | Value | Description |
|--------|-------|-------------|
| `reactCompiler` | `true` | Enables React Compiler for automatic optimization |

---

## TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Key Settings

| Option | Description |
|--------|-------------|
| `strict: true` | Enable all strict type-checking options |
| `noUncheckedIndexedAccess: true` | Add `undefined` to array/object access |
| `paths["@/*"]` | Import alias for `src/` directory |

---

## Environment Variables (`.env.example`)

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/linkpro"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional Variables

```bash
# Node Environment
NODE_ENV="development"

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=""

# Cloudinary (image storage)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# AWS S3 (image storage)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_REGION=""
```

### Variable Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Required |
| `NEXTAUTH_URL` | Canonical URL of the site | Required |
| `NODE_ENV` | Environment mode | `development` |

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:coverage": "vitest --run --coverage",
    "db:seed": "npx tsx prisma/seed.ts",
    "db:reset": "npx prisma migrate reset --force"
  }
}
```

### Script Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (destructive) |

---

## shadcn/ui Configuration (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1"]
}
```

### Settings

| Option | Value | Description |
|--------|-------|-------------|
| `regions` | `["hkg1"]` | Deploy to Hong Kong region |

---

## Prisma Configuration (`prisma.config.ts`)

```typescript
import type { PrismaClientOptions } from "@prisma/client";

const config: PrismaClientOptions = {
  // Add your Prisma Client options here
};

export default config;
```

---

## ESLint Configuration (`eslint.config.mjs`)

Uses ESLint with Next.js config.

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

---

## Vitest Configuration (`vitest.config.ts`)

```typescript
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

---

## Tailwind CSS (via v4)

Tailwind v4 uses CSS-based configuration rather than a config file.

### Global CSS (`src/app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Geist", "Geist Sans", sans-serif;
  --font-mono: "Geist Mono", monospace;
  --font-heading: "Caveat", cursive;
  --font-body: "Quicksand", sans-serif;

  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  /* ... more color variables ... */
}
```

---

## PostCSS Configuration (`postcss.config.mjs`)

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

## Deployment Checklist

Before deploying, ensure:

- [ ] `DATABASE_URL` is set to production database
- [ ] `NEXTAUTH_SECRET` is set to a strong random value
- [ ] `NEXTAUTH_URL` is set to production domain
- [ ] Database migrations have been run (`prisma migrate deploy`)
- [ ] Environment variables are configured in deployment platform

---

## Related Areas

- **[Project Overview](PROJECT.md)** - Environment setup
- **[Database Schema](DATABASE.md)** - Database configuration
