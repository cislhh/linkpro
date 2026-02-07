# LinkPro CodeMaps

**Last Updated:** 2026-02-06
**Project Version:** 0.1.0

## Overview

LinkPro is a next-generation personal brand homepage generator ("Link-in-Bio" tool) built with Next.js 16, featuring real-time preview, theme switching, and modular page composition.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  (auth)     │    │(dashboard)  │    │  Public     │         │
│  │  /login     │    │  /dashboard │    │  /u/[user]  │         │
│  │  /register  │    │  /preview   │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         Server Actions                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Link CRUD   │  │ Module CRUD  │  │ User CRUD    │         │
│  │  - create    │  │  - create    │  │  - register  │         │
│  │  - update    │  │  - update    │  │  - update    │         │
│  │  - delete    │  │  - delete    │  │  - get       │         │
│  │  - reorder   │  │  - layout    │  │  - theme     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                          State Management                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ EditorStore  │  │ LayoutStore  │  │  UserStore   │         │
│  │  - links     │  │  - modules   │  │  - profile   │         │
│  │  - theme     │  │  - layout    │  │  - projects  │         │
│  │  - preview   │  │  - editing   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │ NextAuth.js  │  │   File System│         │
│  │  + Prisma    │  │  - JWT       │  │  - Avatars   │         │
│  │              │  │  - Session   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📖 Recommended Reading Order

Start here and read in order for complete understanding:

| # | Document | Description |
|---|----------|-------------|
| 1️⃣ | [Project Overview](01-PROJECT-OVERVIEW.md) | **START HERE** - What is LinkPro, tech stack, features |
| 2️⃣ | [Database Schema](02-DATABASE-SCHEMA.md) | Data models, relationships, Prisma schema |
| 3️⃣ | [Type Definitions](03-TYPE-DEFINITIONS.md) | TypeScript interfaces and types |
| 4️⃣ | [Server Actions](04-SERVER-ACTIONS.md) | All backend operations (CRUD, auth, upload) |
| 5️⃣ | [State Management](05-STATE-MANAGEMENT.md) | Zustand stores and data flow |
| 6️⃣ | [Frontend](06-FRONTEND.md) | Pages, components, themes structure |
| 7️⃣ | [Utilities](07-UTILITIES.md) | Helper functions and libraries |
| 8️⃣ | [Configuration](08-CONFIGURATION.md) | Config files and environment variables |
| 9️⃣ | [Quick Reference](09-QUICK-REFERENCE.md) | Common patterns and code snippets |

## Key Directories

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── u/[username]/        # Public user pages
│   └── api/                 # API endpoints
│
├── actions/                 # Server Actions (backend logic)
│   ├── link-actions.ts      # Link CRUD operations
│   ├── module-actions.ts    # Module & layout operations
│   ├── user-actions.ts      # User profile operations
│   ├── publish-actions.ts   # Publish/unpublish operations
│   └── upload-actions.ts    # File upload operations
│
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── features/            # Feature-specific components
│   ├── themes/              # Theme components (Aurora, Cyber, Glass)
│   └── providers/           # Context providers
│
├── stores/                  # Zustand state management
│   ├── editor-store.ts      # Link & theme state
│   ├── layout-store.ts      # Module & layout state
│   ├── user-store.ts        # User profile state
│   └── auth-store.ts        # Auth preferences state
│
├── lib/                     # Utility libraries
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client
│   ├── validations.ts       # Zod schemas
│   ├── constants.ts         # App constants
│   ├── utils.ts             # Helper functions
│   ├── errors.ts            # Error classes
│   ├── icon-dictionary.ts   # Icon definitions
│   └── layout-templates.ts  # Default layout configs
│
└── types/                   # TypeScript type definitions
    ├── index.ts             # Main type exports
    └── next-auth.d.ts       # NextAuth type extensions
```

## Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ├─────────────────────────────────────┐
    ▼                                     ▼
Server Action                         Zustand Store
    │                                     │
    ▼                                     ▼
Prisma Database                    Local State Update
    │                                     │
    ▼                                     ▼
Return Result                    Component Re-render
    │
    ▼
UI Update (toast/redirect)
```

## Module System Architecture

LinkPro uses a modular page composition system:

1. **Modules** - Reusable content blocks (bio, links, skills, projects)
2. **Layout Editor** - Drag-and-drop positioning (mobile grid)
3. **Theme Rendering** - Each theme renders modules differently

```
PageModule
├── id: string
├── type: 'links' | 'bio' | 'skills' | 'projects'
├── data: ModuleData (type-specific)
├── order: number (display order)
└── grid*: {x, y, w, h} (layout position)
```

## Theme System

Themes are React components that receive user data and modules:

| Theme | Description | Status |
|-------|-------------|--------|
| Aurora | Gradient effects, flip card animation | Fully Implemented |
| Cyber | Neon cyberpunk style | Partial |
| Glass | Glassmorphism effects | Partial |

## Related Areas

- **Frontend** interacts with **Server Actions** for data mutations
- **Server Actions** use **Prisma** for database operations
- **Stores** cache data from **Server Actions** for performance
- **Themes** consume data from **Stores** for real-time preview
