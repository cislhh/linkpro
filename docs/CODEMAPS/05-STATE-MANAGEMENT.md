# State Management - LinkPro

**Last Updated:** 2026-02-06
**Library:** Zustand 5.0.9

## Overview

LinkPro uses Zustand for client-side state management. Stores act as a cache for server data, reducing redundant API calls.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       DataProvider                          │
│  Centralized data loading on authentication                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ EditorStore   │ │ LayoutStore   │ │  UserStore    │
│               │ │               │ │               │
│ - links       │ │ - modules     │ │ - profile     │
│ - theme       │ │ - layout      │ │ - projects    │
│ - previewMode │ │ - isEditing   │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Store: EditorStore

**File:** `src/stores/editor-store.ts`

Manages link editor state and theme selection.

### State

| Property | Type | Description |
|----------|------|-------------|
| `links` | `Link[]` | User's links |
| `theme` | `ThemeType` | Current theme ('aurora' \| 'cyber' \| 'glass') |
| `previewMode` | `boolean` | Preview mode active |
| `isDirty` | `boolean` | Unsaved changes exist |
| `lastFetchTime` | `number` | Last data fetch timestamp |

### Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `addLink` | `Omit<Link, 'id' \| 'userId' \| 'createdAt' \| 'updatedAt'>` | Add new link (optimistic) |
| `updateLink` | `id: string, data: Partial<Link>` | Update existing link |
| `deleteLink` | `id: string` | Delete a link |
| `reorderLinks` | `startIndex: number, endIndex: number` | Reorder links |
| `setTheme` | `theme: ThemeType` | Set current theme |
| `togglePreviewMode` | - | Toggle preview mode |
| `setLinks` | `links: Link[]` | Replace all links (from server) |
| `resetDirty` | - | Clear dirty flag |
| `setLastFetchTime` | `time: number` | Update fetch timestamp |
| `shouldFetch` | `refreshInterval: number` | Check if refresh needed |
| `clear` | - | Clear all state |

### Selectors

```typescript
useLinks()           // Get links array
useTheme()           // Get current theme
usePreviewMode()     // Get preview mode state
useIsDirty()         // Get dirty state
useAddLink()         // Get addLink action
useUpdateLink()      // Get updateLink action
useDeleteLink()      // Get deleteLink action
useReorderLinks()    // Get reorderLinks action
useSetTheme()        // Get setTheme action
useSetLinks()        // Get setLinks action
```

---

## Store: LayoutStore

**File:** `src/stores/layout-store.ts`

Manages page modules and layout configuration.

### State

| Property | Type | Description |
|----------|------|-------------|
| `modules` | `PageModule[]` | User's page modules |
| `layout` | `LayoutItem[]` | Current active layout (mobile) |
| `deviceMode` | `'mobile' \| 'desktop'` | Current device mode (always mobile) |
| `isEditing` | `boolean` | Layout editor active |
| `mobileLayout` | `LayoutItem[]` | Mobile layout configuration |
| `desktopLayout` | `LayoutItem[]` | Desktop layout (reserved, unused) |
| `lastFetchTime` | `number` | Last data fetch timestamp |

### Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `setModules` | `modules: PageModule[]` | Load modules and generate layout |
| `updateLayout` | `layout: LayoutItem[]` | Update layout positions |
| `saveLayout` | - | Save layout to server |
| `toggleEditing` | - | Toggle edit mode |
| `setDeviceMode` | `mode: DeviceMode` | Set device mode (always uses mobile) |
| `setLastFetchTime` | `time: number` | Update fetch timestamp |
| `shouldFetch` | `refreshInterval: number` | Check if refresh needed |
| `clear` | - | Clear all state |

### Layout Loading Behavior

1. **With saved layout** - Uses saved mobile layout from user profile
2. **Without saved layout** - Generates default layout
3. **Missing modules** - Adds default layout for new modules
4. **Deleted modules** - Removes layout items for deleted modules
5. **Validation** - Ensures layout fits within grid constraints

### Selectors

```typescript
useModules()           // Get modules array
useLayout()            // Get active layout
useIsEditing()          // Get editing state
useDeviceMode()         // Get device mode
useMobileLayout()       // Get mobile layout
useDesktopLayout()      // Get desktop layout
useSetModules()         // Get setModules action
useUpdateLayout()       // Get updateLayout action
useSaveLayout()         // Get saveLayout action
useToggleEditing()      // Get toggleEditing action
```

---

## Store: UserStore

**File:** `src/stores/user-store.ts`

Manages user profile and projects.

### State

| Property | Type | Description |
|----------|------|-------------|
| `profile` | `UserProfile` | User profile data |
| `projects` | `Project[]` | User's projects |
| `lastFetchTime` | `number` | Last data fetch timestamp |

**UserProfile Interface:**
```typescript
interface UserProfile {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
}
```

### Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `setUserProfile` | `profile: UserProfile` | Set profile data |
| `setProjects` | `projects: Project[]` | Set projects array |
| `setUser` | `data: { profile, projects }` | Set both profile and projects |
| `setLastFetchTime` | `time: number` | Update fetch timestamp |
| `shouldFetch` | `refreshInterval: number` | Check if refresh needed |
| `clear` | - | Clear all state |

---

## Store: AuthStore

**File:** `src/stores/auth-store.ts`

Manages authentication preferences and session expiry.

### Features

- Persists to localStorage
- "Remember Me" functionality
- 7-day session expiry

### State

| Property | Type | Description |
|----------|------|-------------|
| `rememberMe` | `boolean` | User wants persistent session |
| `loginExpiry` | `number \| null` | Session expiry timestamp |

### Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `setRememberMe` | `remember: boolean` | Set remember me preference |
| `setLoginExpiry` | - | Set expiry to 7 days from now |
| `clearAuth` | - | Clear auth state |
| `isSessionValid` | - | Check if session is still valid |

### Session Logic

```
Remember Me: ON
├── loginExpiry set to NOW + 7 days
├── Session persists after browser close
└── Auto-logout when expiry passes

Remember Me: OFF
├── loginExpiry is null
├── Session cleared on browser close (via sessionStorage)
└── Session-only authentication
```

---

## DataProvider

**File:** `src/components/providers/data-provider.tsx`

Centralized data initialization component.

### Responsibilities

1. **Initial Load** - Fetches all data when user authenticates
2. **Smart Refresh** - Refreshes data when page regains focus
3. **Error Handling** - Continues even if some data fails to load
4. **Debouncing** - Prevents rapid calls on tab switching

### Refresh Logic

```typescript
// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000;

// Visibility change debounce: 1 second
const VISIBILITY_CHANGE_DEBOUNCE = 1000;
```

### Data Loading Flow

```
Session Authenticated
    ↓
DataProvider.initializeData()
    ↓
Promise.allSettled([
  getUserProfile(),    → UserStore.setUser()
  getUserLinks(),      → EditorStore.setLinks()
  getModules()         → LayoutStore.setModules()
])
    ↓
Set lastFetchTime for all stores
```

---

## Store Selector Pattern

To avoid infinite re-renders, use individual selector hooks:

```typescript
// GOOD - Stable reference
const setLinks = useSetLinks();
const links = useLinks();

// AVOID - Can cause re-renders
const { setLinks, links, theme, ... } = useEditorStore();
```

## Persistence

- **AuthStore** - Persisted to localStorage (via zustand persist middleware)
- **Other stores** - Not persisted (reload from server)

## Clearing State

All stores have a `clear()` action that:
- Resets state to initial values
- Is called on logout
- Clears lastFetchTime

## Related Areas

- **[Backend & Server Actions](BACKEND.md)** - Data source
- **[Frontend Architecture](FRONTEND.md)** - Component usage
- **[Libraries & Utilities](LIBRARIES.md)** - Helper functions
