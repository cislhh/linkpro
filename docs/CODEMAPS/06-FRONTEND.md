# Frontend Architecture - LinkPro

**Last Updated:** 2026-02-06

## Overview

The frontend is built with Next.js 16 using the App Router, featuring server components, client components, and React Server Actions.

## Page Routes

```
src/app/
├── (auth)/                    # Auth route group
│   ├── layout.tsx            # Auth layout (no sidebar)
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── register/
│       └── page.tsx          # Registration page
│
├── (dashboard)/               # Dashboard route group
│   └── dashboard/
│       ├── layout.tsx        # Dashboard layout (with sidebar)
│       ├── layout-client.tsx # Client-side dashboard wrapper
│       ├── page.tsx          # Main dashboard (module management)
│       ├── preview/
│       │   └── page.tsx      # Preview page
│       ├── profile/
│       │   └── page.tsx      # Profile settings
│       ├── settings/
│       │   └── page.tsx      # Account settings
│       └── themes/
│           └── page.tsx      # Theme selection
│
├── u/[username]/
│   └── page.tsx              # Public user page (SSR)
│
├── api/
│   └── auth/[...nextauth]/
│       └── route.ts          # NextAuth API handler
│
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page
└── globals.css               # Global styles
```

## Pages

### Landing Page (`/`)
- **File:** `src/app/page.tsx`
- **Type:** Client Component
- **Features:** Animated hero, feature highlights, CTA buttons

### Auth Pages

#### Login (`/login`)
- **File:** `src/app/(auth)/login/page.tsx`
- **Features:** Email/password form, remember me checkbox, form validation

#### Register (`/register`)
- **File:** `src/app/(auth)/register/page.tsx`
- **Features:** Registration form with username uniqueness check

### Dashboard Pages

#### Main Dashboard (`/dashboard`)
- **File:** `src/app/(dashboard)/dashboard/page.tsx`
- **Features:**
  - Module management (add, edit, delete modules)
  - Stats display (module count, current theme)
  - Preview link
  - Module list sorted by layout position

#### Preview (`/dashboard/preview`)
- **File:** `src/app/(dashboard)/dashboard/preview/page.tsx`
- **Features:**
  - Mobile frame preview (375px width)
  - Aurora theme template preview
  - Layout preview with custom positioning
  - Stats display

#### Profile (`/dashboard/profile`)
- **File:** `src/app/(dashboard)/dashboard/profile/page.tsx`
- **Features:**
  - Profile form (name, bio, avatar, phone, contact)
  - Project list management
  - Work experience management (Aurora theme)

#### Settings (`/dashboard/settings`)
- **File:** `src/app/(dashboard)/dashboard/settings/page.tsx`
- **Features:** Account settings placeholder

#### Themes (`/dashboard/themes`)
- **File:** `src/app/(dashboard)/dashboard/themes/page.tsx`
- **Features:** Theme selection with preview

### Public Page (`/u/[username]`)
- **File:** `src/app/u/[username]/page.tsx`
- **Type:** Server Component
- **Features:**
  - SSR rendering for SEO
  - Dynamic Open Graph metadata
  - Theme-based rendering
  - 404 for unpublished/non-existent users

## Components Structure

```
src/components/
├── ui/                         # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── checkbox.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── form.tsx
│   ├── phone-frame.tsx         # Mobile preview frame
│   └── sonner.tsx              # Toast notifications
│
├── features/                   # Feature components
│   ├── dashboard/
│   │   └── sidebar.tsx         # Dashboard navigation sidebar
│   ├── link-editor/            # Link management
│   │   ├── link-form.tsx       # Link create/edit form
│   │   ├── link-list.tsx       # Link list with drag-drop
│   │   ├── link-item.tsx       # Single link item
│   │   └── icon-select.tsx     # Icon picker dropdown
│   ├── modules/                # Page modules
│   │   ├── module-selector.tsx         # Add module dropdown
│   │   ├── module-list.tsx             # Module list
│   │   ├── module-card.tsx             # Module display card
│   │   ├── module-edit-dialog.tsx      # Module edit dialog
│   │   ├── bio-module-config-dialog.tsx # Bio module config
│   │   ├── projects-module-config-dialog.tsx # Projects config
│   │   ├── bio-module.tsx              # Bio display
│   │   ├── links-module.tsx            # Links display
│   │   ├── skills-module.tsx           # Skills display
│   │   └── projects-module.tsx         # Projects display
│   ├── project-editor/         # Project management
│   │   ├── project-form.tsx    # Project create/edit form
│   │   ├── project-list.tsx    # Project list
│   │   └── project-item.tsx    # Single project item
│   ├── preview/                # Preview components
│   │   ├── live-preview.tsx    # Live preview wrapper
│   │   ├── layout-preview.tsx  # Layout preview
│   │   └── aurora-preview-template.tsx # Aurora theme preview
│   ├── publish/                # Publishing
│   │   ├── publish-button.tsx  # Publish/unpublish button
│   │   └── publish-status.tsx  # Publish status display
│   ├── theme-selector/         # Theme selection
│   │   ├── theme-picker.tsx    # Theme selection cards
│   │   └── theme-preview.tsx   # Theme preview card
│   └── profile/
│       └── profile-form.tsx    # Profile settings form
│
├── themes/                     # Theme components
│   ├── base-theme.tsx          # Base theme interface
│   ├── aurora-theme.tsx        # Aurora theme wrapper
│   ├── cyber-theme.tsx         # Cyber theme wrapper
│   ├── glass-theme.tsx         # Glass theme wrapper
│   └── aurora/                 # Aurora theme components
│       ├── AuroraBackground.tsx
│       ├── AuroraCardFront.tsx # Card front (bio, links)
│       ├── AuroraCardBack.tsx  # Card back (projects, experience)
│       └── sections/           # Aurora sections
│           ├── contact.tsx
│           ├── experience.tsx
│           ├── projects.tsx
│           └── skills.tsx
│
└── providers/                  # React context providers
    ├── session-provider.tsx    # NextAuth session provider
    ├── data-provider.tsx       # Centralized data loading
    └── auth-guard.tsx          # Session validation guard
```

## Component Hierarchy (Dashboard)

```
RootLayout
└── SessionProvider
    └── DataProvider
        └── AuthGuard
            └── DashboardLayout
                ├── Sidebar
                └── [Dashboard Page]
                    ├── ModuleSelector
                    ├── ModuleList
                    │   └── ModuleCard[]
                    └── ModuleEditDialog
```

## Theme System

Themes are React components that receive user data and render the public page.

### Theme Interface

```typescript
interface ThemeProps {
  links: Link[];
  user: Pick<User, 'name' | 'bio' | 'avatarUrl' | 'username' | 'phone' | 'contact'>;
  projects?: Project[];
  skills?: string[];
  experience?: WorkExperience[];
}
```

### Available Themes

| Theme | Component | Description |
|-------|-----------|-------------|
| Aurora | `AuroraTheme` | Gradient with flip card animation |
| Cyber | `CyberTheme` | Neon cyberpunk (WIP) |
| Glass | `GlassTheme` | Glassmorphism (WIP) |

### Theme Resolution

```typescript
// src/components/themes/index.ts
export function getThemeComponent(theme: ThemeType): ThemeComponent {
  switch (theme) {
    case 'aurora':
      return AuroraTheme;
    case 'cyber':
      return CyberTheme;
    case 'glass':
      return GlassTheme;
    default:
      return AuroraTheme;
  }
}
```

## Data Provider

The `DataProvider` component (`src/components/providers/data-provider.tsx`) is responsible for:

1. **Initial Data Load** - Loads user profile, links, and modules on authentication
2. **Smart Refresh** - Refreshes data when page regains focus (after 5 minutes)
3. **Centralized State** - Populates all Zustand stores from one place

```typescript
// Data flow
Session Authenticated
    ↓
DataProvider.initializeData()
    ↓
Promise.allSettled([
  getUserProfile(),
  getUserLinks(),
  getModules()
])
    ↓
Update Zustand Stores
    ↓
Components Re-render
```

## Styling

### Tailwind CSS

The project uses Tailwind CSS 4.x with:
- Custom color schemes via CSS variables
- Dark mode support
- Responsive utilities

### Global Styles

Defined in `src/app/globals.css`:
- CSS variable definitions
- Font family variables
- Base resets

### Fonts

| Font | Usage |
|------|-------|
| Geist Sans | Body text |
| Geist Mono | Code/monospace |
| Caveat | Headings (Aurora theme) |
| Quicksand | Body text (Aurora theme) |

## Client vs Server Components

### Server Components
- Root layouts
- Public user page (`/u/[username]`)
- Auth pages (for initial render)

### Client Components
- All dashboard pages (marked `"use client"`)
- Interactive components (forms, dialogs, etc.)
- Preview components

## Related Areas

- **[Backend & Server Actions](BACKEND.md)** - Data mutations
- **[State Management](STATE.md)** - Client state
- **[Type Definitions](TYPES.md)** - Component props types
