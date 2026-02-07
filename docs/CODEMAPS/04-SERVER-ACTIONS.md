# Backend & Server Actions - LinkPro

**Last Updated:** 2026-02-06

## Overview

LinkPro uses Next.js Server Actions for backend operations. Server Actions provide:
- Type-safe client-server communication
- Direct database access without API routes
- Automatic progress tracking and error handling

## Architecture

```
Client Component
    │
    ▼ calls
Server Action
    │
    ├─► Authentication Check (auth())
    │
    ├─► Input Validation (Zod)
    │
    ├─► Database Operation (Prisma)
    │
    └─► Return ActionResult<T>
```

## Server Actions

### Link Actions (`src/actions/link-actions.ts`)

| Action | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getUserLinks()` | - | `ActionResult<Link[]>` | Get all user's links ordered |
| `createLink(data)` | `CreateLinkInput` | `ActionResult<Link>` | Create new link |
| `updateLink(id, data)` | `string, UpdateLinkInput` | `ActionResult<Link>` | Update existing link |
| `deleteLink(id)` | `string` | `ActionResult<void>` | Delete a link |
| `reorderLinks(linkIds)` | `string[]` | `ActionResult<void>` | Batch reorder links |

**Authentication:** All actions require authenticated session.

**Ownership Check:** Update/delete operations verify link belongs to user.

**Example:**
```typescript
const result = await createLink({
  title: "GitHub",
  url: "https://github.com/user",
  icon: "github",
});
if (result.success) {
  console.log(result.data); // Link object
} else {
  console.error(result.error); // Error message
}
```

---

### Module Actions (`src/actions/module-actions.ts`)

| Action | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getModules()` | - | `ActionResult<PageModule[]>` | Get all user's modules |
| `createModule(data)` | `CreateModuleInput` | `ActionResult<PageModule>` | Create new module |
| `updateModule(id, data)` | `string, UpdateModuleInput` | `ActionResult<PageModule>` | Update module |
| `deleteModule(id)` | `string` | `ActionResult<void>` | Delete module |
| `saveLayout(layoutItems)` | `LayoutItemInput[]` | `ActionResult<PageModule[]>` | Save layout positions |
| `saveDeviceLayout(mode, layout)` | `DeviceMode, LayoutData[]` | `ActionResult<void>` | Save device-specific layout |
| `getDeviceLayouts()` | - | `ActionResult<{mobile, desktop}>` | Get saved layouts |
| `clearSkillsModules()` | - | `ActionResult<{count}>` | Clear all skills modules |

**Module Types:**
- `links` - Link collection module
- `bio` - Biography/intro module
- `skills` - Skill tags module
- `projects` - Project showcase module

**Layout Grid:**
- Mobile: 2 columns
- Desktop: 12 columns (reserved, not fully implemented)

---

### User Actions (`src/actions/user-actions.ts`)

| Action | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `registerUser(data)` | `RegisterInput` | `ActionResult<UserResult>` | Register new user |
| `getUserByEmail(email)` | `string` | `ActionResult<UserResult \| null>` | Get user by email |
| `getUserProfile()` | - | `ActionResult<UserResult>` | Get current user profile |
| `updateUserProfile(data)` | `UpdateProfileInput` | `ActionResult<UserResult>` | Update user profile |
| `updateUserTheme(theme)` | `ThemeType` | `ActionResult<UserResult>` | Update user theme |
| `updateUserProjects(projects)` | `Project[]` | `ActionResult<UserResult>` | Update user projects |

**Profile Fields:**
- `name` - Display name
- `bio` - Biography/intro
- `avatarUrl` - Avatar image URL
- `phone` - Phone number
- `contact` - Contact information (WeChat, email, etc.)
- `projects` - JSON array of projects
- `experience` - JSON array of work experiences (Aurora theme)

---

### Publish Actions (`src/actions/publish-actions.ts`)

| Action | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `publishPage()` | - | `ActionResult<{url}>` | Publish user's public page |
| `unpublishPage()` | - | `ActionResult<void>` | Unpublish public page |
| `getPublishStatus()` | - | `ActionResult<{isPublished, publishedAt, publicUrl}>` | Get publish status |

**Publishing:**
- Sets `isPublished` to `true`
- Records `publishedAt` timestamp
- Public URL: `/u/[username]`

---

### Upload Actions (`src/actions/upload-actions.ts`)

| Action | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `uploadAvatar(formData)` | `FormData` | `ActionResult<{url}>` | Upload avatar image |

**Specifications:**
- Max size: 2MB
- Allowed formats: JPEG, PNG, WebP
- Recommended size: 400x400px
- Min size: 200x200px
- Storage: `public/avatars/`

**File naming:** `{userId}-{timestamp}-{random}.{ext}`

## API Routes

### NextAuth Handler

**Route:** `/api/auth/[...nextauth]`
**File:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
export const { GET, POST } = handlers;
```

Handlers are exported from `src/lib/auth.ts`.

## Authentication (`src/lib/auth.ts`)

NextAuth.js configuration with Credentials provider.

**Configuration:**
- Strategy: JWT
- Session max age: 1 day (default), 7 days (remember me)
- Sign in page: `/login`
- Error page: `/login`

**Callbacks:**

```typescript
// JWT callback - adds user data to token
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.username = user.username;
    token.phone = user.phone;
    token.contact = user.contact;
    token.bio = user.bio;
  }
  return token;
}

// Session callback - adds user data to session
async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.id;
    session.user.username = token.username;
    session.user.phone = token.phone;
    session.user.contact = token.contact;
    session.user.bio = token.bio;
  }
  return session;
}
```

## Database (`src/lib/db.ts`)

Singleton Prisma client instance.

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
});
```

**Global hot reload** in development prevents multiple instances.

## Validation (`src/lib/validations.ts`)

All server actions use Zod schemas for input validation.

### Schemas

| Schema | Fields |
|--------|--------|
| `createLinkSchema` | title (required), url (required), icon (optional), order, isActive |
| `updateLinkSchema` | Partial of createLinkSchema |
| `createModuleSchema` | type (required), data (required, discriminated union), title, order, gridX, gridY, gridW, gridH |
| `updateModuleSchema` | Partial of createModuleSchema |
| `updateProfileSchema` | name, bio, avatarUrl, phone, contact, projects, experience |
| `themeSchema` | Enum: 'aurora' \| 'cyber' \| 'glass' |
| `registerSchema` | email (required, unique), password (min 8 chars), username (required, unique, 3-30 chars, alphanumeric) |
| `loginSchema` | email (required), password (required) |

## Result Type

All server actions return `ActionResult<T>`:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**Usage pattern:**
```typescript
const result = await someAction(params);
if (result.success) {
  // Access result.data
} else {
  // Handle result.error
}
```

## Error Handling

1. **Zod Validation Errors** - Return first validation issue message
2. **Authentication Errors** - Return "Authentication required"
3. **Authorization Errors** - Return "Not authorized to..."
4. **Not Found Errors** - Return "[Resource] not found"
5. **Generic Errors** - Return "Failed to..." with console.error logging

## Session Management

### Remember Me

Implemented via `auth-store.ts`:
- `rememberMe` boolean stored in localStorage
- 7-day expiry when enabled
- Session-only when disabled

### Session Guard

`AuthGuard` component (`src/components/providers/auth-guard.tsx`):
- Checks session validity on mount
- Auto-logout when session expires
- Uses sessionStorage for browser close detection

## Related Areas

- **[Database Schema](DATABASE.md)** - Data models
- **[State Management](STATE.md)** - Client-side caching
- **[Libraries & Utilities](LIBRARIES.md)** - Helper functions
