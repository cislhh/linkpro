# Quick Reference - LinkPro

**Last Updated:** 2026-02-06

## Common Imports

```typescript
// Server Actions
import { createLink, updateLink, deleteLink, getUserLinks } from "@/actions/link-actions";
import { getModules, createModule, updateModule, deleteModule } from "@/actions/module-actions";
import { getUserProfile, updateUserProfile, updateUserTheme } from "@/actions/user-actions";
import { publishPage, unpublishPage, getPublishStatus } from "@/actions/publish-actions";
import { uploadAvatar } from "@/actions/upload-actions";

// Database
import { prisma } from "@/lib/db";

// Authentication
import { auth, signIn, signOut } from "@/lib/auth";
import { useSession } from "next-auth/react";

// State Management
import { useEditorStore } from "@/stores/editor-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useUserStore } from "@/stores/user-store";
import { useAuthStore } from "@/stores/auth-store";

// Types
import type { Link, PageModule, Project, WorkExperience, ActionResult } from "@/types";

// Utilities
import { cn } from "@/lib/utils";
import { getIconById } from "@/lib/icon-dictionary";

// Validation
import { z } from "zod";
import {
  createLinkSchema,
  updateLinkSchema,
  updateProfileSchema,
  registerSchema,
  loginSchema,
} from "@/lib/validations";
```

## Server Action Patterns

### Calling a Server Action

```typescript
const result = await someAction(params);

if (result.success) {
  const data = result.data;
  // Handle success
} else {
  const error = result.error;
  // Handle error (show toast, etc.)
}
```

### Creating a Resource

```typescript
const result = await createLink({
  title: "GitHub",
  url: "https://github.com/username",
  icon: "github",
});

if (result.success) {
  toast.success("Link created!");
  // Refresh data
} else {
  toast.error(result.error);
}
```

### Updating a Resource

```typescript
const result = await updateLink(linkId, {
  title: "New Title",
  url: "https://new-url.com",
});

if (result.success) {
  toast.success("Link updated!");
} else {
  toast.error(result.error);
}
```

### Deleting a Resource

```typescript
const result = await deleteLink(linkId);

if (result.success) {
  toast.success("Link deleted!");
} else {
  toast.error(result.error);
}
```

## Authentication Patterns

### Check Authentication (Server Component/Action)

```typescript
import { auth } from "@/lib/auth";

const session = await auth();

if (!session?.user?.id) {
  return { success: false, error: "Authentication required" };
}

// Access user data
const userId = session.user.id;
const username = session.user.username;
```

### Check Authentication (Client Component)

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user.username}</div>;
}
```

## Store Patterns

### Editor Store

```typescript
import {
  useLinks,
  useTheme,
  useSetLinks,
  useAddLink,
  useUpdateLink,
  useDeleteLink,
} from "@/stores/editor-store";

function LinkManager() {
  const links = useLinks();
  const theme = useTheme();
  const addLink = useAddLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  return (
    // ... component JSX
  );
}
```

### Layout Store

```typescript
import {
  useModules,
  useLayout,
  useSetModules,
  useUpdateLayout,
  useSaveLayout,
} from "@/stores/layout-store";

function LayoutEditor() {
  const modules = useModules();
  const layout = useLayout();
  const updateLayout = useUpdateLayout();
  const saveLayout = useSaveLayout();

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    updateLayout(newLayout);
  };

  const handleSave = async () => {
    try {
      await saveLayout();
      toast.success("Layout saved!");
    } catch (error) {
      toast.error("Failed to save layout");
    }
  };

  return <div>{/* ... */}</div>;
}
```

### User Store

```typescript
import { useUserStore } from "@/stores/user-store";

function ProfileDisplay() {
  const profile = useUserStore((state) => state.profile);
  const projects = useUserStore((state) => state.projects);

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.bio}</p>
    </div>
  );
}
```

## Validation Patterns

### Using Zod Schemas

```typescript
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

async function handleRegister(data: unknown) {
  try {
    const validated = registerSchema.parse(data);
    // Use validated data
    const { email, password, username } = validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]?.message;
      return { success: false, error: firstError };
    }
  }
}
```

## Component Patterns

### Form with Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLinkSchema } from "@/lib/validations";

function LinkForm() {
  const form = useForm({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "",
    },
  });

  const onSubmit = async (data) => {
    const result = await createLink(data);
    if (result.success) {
      // Handle success
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Conditional Rendering Based on Auth

```typescript
import { useSession } from "next-auth/react";

function ProtectedPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please log in</div>;
  }

  return <div>Protected content</div>;
}
```

## Routing

### App Router Structure

```
src/app/
├── (auth)/           # Auth routes (no sidebar)
│   ├── login/
│   └── register/
├── (dashboard)/      # Protected routes
│   └── dashboard/
│       ├── page.tsx          # Main dashboard
│       ├── preview/page.tsx  # Preview page
│       ├── profile/page.tsx  # Profile settings
│       └── settings/page.tsx # Account settings
├── u/[username]/     # Public pages
└── api/              # API routes
```

### Redirecting

```typescript
import { redirect } from "next/navigation";

// Server Component/Action
if (!session) {
  redirect("/login");
}
```

```typescript
import { useRouter } from "next/navigation";

// Client Component
const router = useRouter();
router.push("/dashboard");
```

## Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation successful!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Here's some information");

// Promise
toast.promise(
  asyncOperation(),
  {
    loading: "Loading...",
    success: "Done!",
    error: "Failed!",
  }
);
```

## Utility Functions

### Class Names

```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

### Icon Lookup

```typescript
import { getIconById } from "@/lib/icon-dictionary";

const iconDef = getIconById("github");
if (iconDef) {
  const IconComponent = iconDef.icon;
  return <IconComponent />;
}
```

## Theme Resolution

```typescript
import { getThemeComponent } from "@/components/themes";
import type { ThemeType } from "@/types";

function ThemeRenderer({ theme, ...props }: { theme: ThemeType }) {
  const ThemeComponent = getThemeComponent(theme);
  return <ThemeComponent {...props} />;
}
```

## File Paths (Absolute)

When working with files, use absolute paths:

```typescript
// For reading/writing files
const filepath = "/Users/azo/Workspace/linkpro/public/avatars/file.jpg";

// For imports, use alias
import { something } from "@/lib/something";
```

## Common Errors and Solutions

### "Authentication required"
- Cause: Session not found or expired
- Solution: Ensure user is logged in, check `auth()` result

### "Not authorized to..."
- Cause: User doesn't own the resource
- Solution: Verify resource belongs to session.user.id

### "Validation failed"
- Cause: Input doesn't match Zod schema
- Solution: Check schema requirements, format inputs correctly

### "Module not found"
- Cause: Module ID doesn't exist or belongs to different user
- Solution: Verify module ID and ownership

## Related Documentation

- [INDEX.md](INDEX.md) - Documentation index
- [PROJECT.md](PROJECT.md) - Project overview
- [BACKEND.md](BACKEND.md) - Server actions reference
- [STATE.md](STATE.md) - Store reference
- [TYPES.md](TYPES.md) - Type definitions
