# Data Initialization Refactor Design

**Date**: 2026-02-06
**Author**: Claude Code
**Status**: Design

## Problem Statement

Current implementation has duplicate API calls across multiple dashboard pages:
- `getUserLinks()` called in 4+ pages
- `getUserProfile()` called in 3+ pages
- `getModules()` called in 3+ pages

This causes:
- Unnecessary network requests
- Slower page transitions
- Inconsistent data across pages
- Poor user experience

## Solution Overview

Centralize data initialization in a **DataProvider** component that:
1. Loads data once when user logs in
2. Stores data in Zustand stores
3. Refreshes data when page regains focus (5-minute interval)
4. Provides single source of truth for all dashboard pages

## Architecture

### Component: DataProvider

**Location**: `src/components/providers/data-provider.tsx`

**Responsibilities**:
- Monitor user session changes
- Initialize all data on login
- Handle visibility change for smart refresh
- Update Zustand stores with fresh data

**Data Flow**:
```
User Login → DataProvider detects session
    ↓
Parallel calls: getUserProfile + getUserLinks + getModules
    ↓
Store data in respective Zustand stores
    ↓
Pages read from stores (no direct API calls)
    ↓
Page visibility change + 5 min elapsed
    ↓
Refresh data → Update stores
```

### Store Enhancements

All three stores need identical enhancements:

#### New Fields
- `lastFetchTime: number` - Timestamp of last successful fetch

#### New Methods
- `setLastFetchTime(time: number)` - Update fetch timestamp
- `shouldFetch(refreshInterval: number): boolean` - Check if refresh needed
- `clear()` - Reset store to initial state (for logout)

#### Store Mapping
- **user-store** ← `getUserProfile()` result
- **editor-store** ← `getUserLinks()` result
- **layout-store** ← `getModules()` result

### Integration Points

#### Root Layout
```typescript
<SessionProvider>
  <DataProvider>
    {children}
  </DataProvider>
</SessionProvider>
```

#### Page Refactors
Remove `useEffect` hooks that call actions, read from stores instead:

| Page | Remove | Replace With |
|------|--------|--------------|
| `/dashboard/page.tsx` | `getUserLinks()`, `getModules()` | `useEditorStore()`, `useLayoutStore()` |
| `/dashboard/profile/page.tsx` | `getUserLinks()`, `getUserProfile()` | `useEditorStore()`, `useUserStore()` |
| `/dashboard/preview/page.tsx` | `getUserLinks()`, `getUserProfile()` | `useEditorStore()`, `useUserStore()` |
| `/dashboard/layout-editor/page.tsx` | `getModules()`, `getUserProfile()` | `useLayoutStore()`, `useUserStore()` |

## Error Handling

### Partial Failure
Use `Promise.allSettled()` to ensure one failure doesn't block others:
```typescript
const results = await Promise.allSettled([
  getUserProfile(),
  getUserLinks(),
  getModules()
])
// Handle each result independently
```

### Logout Cleanup
Clear all stores when user signs out:
```typescript
useUserStore.getState().clear()
useEditorStore.getState().clear()
useLayoutStore.getState().clear()
```

## Performance Considerations

### Refresh Strategy
- **Interval**: 5 minutes
- **Trigger**: `visibilitychange` event + time check
- **Debounce**: 1 second delay to prevent rapid calls

### Benefits
- Eliminates duplicate API calls
- Faster page transitions (data already in memory)
- Reduced network usage
- Better UX with instant navigation

## Implementation Order

1. ✅ Design document
2. Enhance `user-store.ts`
3. Enhance `editor-store.ts`
4. Enhance `layout-store.ts`
5. Create `DataProvider` component
6. Integrate into root layout
7. Refactor `/dashboard/page.tsx`
8. Refactor `/dashboard/profile/page.tsx`
9. Refactor `/dashboard/preview/page.tsx`
10. Refactor `/dashboard/layout-editor/page.tsx`
11. Test build and functionality

## Testing Checklist

- [ ] User logs in → Data loads into stores
- [ ] Navigate between pages → No duplicate API calls
- [ ] Page regains focus after 5 min → Data refreshes
- [ ] User updates data → Store updates immediately
- [ ] User logs out → All stores cleared
- [ ] Network error → Graceful degradation
- [ ] TypeScript compilation succeeds
- [ ] All dashboard pages work correctly

## Future Enhancements

- Add localStorage cache for offline support
- Implement WebSocket for real-time sync across tabs
- Add retry logic for failed requests
- Consider React Query for more advanced caching
