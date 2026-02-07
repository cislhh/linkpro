# Project Overview - LinkPro

**Last Updated:** 2026-02-06
**Version:** 0.1.0

## What is LinkPro?

LinkPro is a next-generation personal brand homepage generator (Link-in-Bio tool) that allows developers and creators to quickly build visually impressive personal profile pages with:

- **Dynamic Themes** - Multiple visual themes with animations
- **Real-time Preview** - Live preview of changes as you edit
- **Modular Composition** - Drag-and-drop page builder
- **SEO Optimized** - Server-rendered public pages with Open Graph metadata

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.23.26 | Animations |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| shadcn/ui | - | Base UI components |
| Radix UI | - | Accessible component primitives |
| Lucide React | 0.562.0 | Icon library |

### State & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.9 | State management |
| Prisma | 6.19.2 | ORM |
| Zod | 4.3.4 | Runtime validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NextAuth.js | 5.0.0-beta.30 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| PostgreSQL | - | Database (via Prisma) |

### Development
| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 4.0.16 | Testing framework |
| ESLint | 9.x | Linting |
| React Compiler | 1.0.0 | Automatic optimization |

## Main Features

### 1. Authentication
- Email/password registration and login
- JWT session management with NextAuth.js
- Optional "Remember Me" (7-day persistent session)
- Session-based logout on browser close

### 2. Link Management
- Create, update, delete social links
- Drag-and-drop reordering
- Icon selection from curated dictionary
- URL validation

### 3. Profile Management
- Personal information (name, bio, avatar)
- Contact details (phone, contact info)
- Work experience (for Aurora theme)
- Project portfolio

### 4. Page Modules
Modular content blocks that can be arranged on the page:

| Module Type | Description |
|-------------|-------------|
| **Bio** | Personal introduction with avatar |
| **Links** | Selected social/media links |
| **Skills** | Skill tags cloud |
| **Projects** | Project portfolio showcase |

### 5. Layout Editor
- Mobile-first grid layout (2 columns)
- Drag-and-drop module positioning
- Resizeable modules
- Saved per-user layout preferences

### 6. Theme Engine
| Theme | Style | Key Features |
|-------|-------|--------------|
| **Aurora** | Gradient | Flip card animation, color overlays |
| **Cyber** | Neon | Glitch effects, terminal style (WIP) |
| **Glass** | Glassmorphism | Blur effects, transparency (WIP) |

### 7. Publishing
- Publish/unpublish public pages
- Unique URLs: `/u/[username]`
- SEO-optimized with dynamic Open Graph

### 8. Real-time Preview
- Live preview of changes
- Mobile frame preview
- Module arrangement preview

## Project Structure

```
linkpro/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
│
├── public/
│   └── avatars/              # User uploaded avatars
│
├── src/
│   ├── app/                  # Next.js App Router
│   ├── actions/              # Server Actions
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript types
│
├── docs/
│   └── CODEMAPS/             # Architecture documentation
│
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Yes |
| `NEXTAUTH_URL` | Canonical URL of the app | Yes |

## Scripts

```bash
# Development
npm run dev              # Start dev server on port 3000

# Building
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database (destructive)

# Quality
npm run lint             # Run ESLint
```

## Page Routes

| Route | Purpose | Protected |
|-------|---------|-----------|
| `/` | Landing page | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/dashboard` | Main dashboard | Yes |
| `/dashboard/preview` | Page preview | Yes |
| `/dashboard/profile` | Profile settings | Yes |
| `/dashboard/settings` | Account settings | Yes |
| `/dashboard/themes` | Theme selection | Yes |
| `/u/[username]` | Public user page | No* |

*Public but requires `isPublished: true`

## Database Overview

### Core Models

**User** - User accounts and profiles
**Link** - Social/media links
**PageModule** - Page content modules
**Account** - OAuth accounts (reserved)
**Session** - User sessions
**VerificationToken** - Email verification (reserved)

See [DATABASE.md](DATABASE.md) for full schema details.

## Type Safety

The project uses TypeScript throughout with:
- Strict mode enabled
- Zod schemas for runtime validation
- Type inference from Prisma models
- Custom type definitions in `src/types/`

## State Management Strategy

1. **Server Actions** - Source of truth for data
2. **Zustand Stores** - Client-side caching
3. **DataProvider** - Centralized data loading
4. **Smart Refresh** - Data refresh on page focus

See [STATE.md](STATE.md) for details.

## Contributing

This project uses:
- Conventional commits for changelog generation
- Feature branches for development
- Pull requests for code review
