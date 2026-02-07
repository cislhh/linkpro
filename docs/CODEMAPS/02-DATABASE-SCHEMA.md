# Database Schema - LinkPro

**Last Updated:** 2026-02-06
**ORM:** Prisma 6.19.2
**Database:** PostgreSQL

## Overview

The database uses PostgreSQL with Prisma ORM. The schema is defined in `prisma/schema.prisma`.

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────1:N──│    Link     │
│             │         │             │
│ - id        │         │ - id        │
│ - email     │         │ - userId    │
│ - username  │         │ - title     │
│ - password  │         │ - url       │
│ - theme     │         │ - icon      │
│ - ...       │         │ - order     │
└─────────────┘         └─────────────┘
│       │
│       │ 1:N
│       ▼
┌─────────────┐         ┌─────────────┐
│ PageModule  │         │  Account    │ (NextAuth)
│             │         │             │
│ - id        │         │ - id        │
│ - userId    │         │ - userId    │
│ - type      │         │ - provider  │
│ - data      │         │ - ...       │
│ - order     │         └─────────────┘
│ - gridX     │
│ - gridY     │         ┌─────────────┐
│ - gridW     │         │  Session    │ (NextAuth)
│ - gridH     │         │             │
└─────────────┘         │ - id        │
                        │ - userId    │
                        │ - expires   │
                        └─────────────┘
```

## Models

### User

Main user account and profile data.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  username      String    @unique
  name          String?
  bio           String?
  avatarUrl     String?
  phone         String?   // Phone number
  contact       String?   // Contact info (WeChat, email, etc.)
  projects      Json?     // Personal projects list
  experience    Json?     // Work experience list
  password      String
  theme         String    @default("aurora")
  mobileLayout  Json?     // Mobile layout configuration
  desktopLayout Json?     // Desktop layout configuration
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  links       Link[]
  accounts    Account[]
  sessions    Session[]
  pageModules PageModule[]
}
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique identifier |
| `email` | String | Unique, Required | User email |
| `emailVerified` | DateTime? | Optional | Email verification timestamp |
| `username` | String | Unique, Required | Username for URLs |
| `name` | String? | Optional | Display name |
| `bio` | String? | Optional | Biography/description |
| `avatarUrl` | String? | Optional | Avatar image URL |
| `phone` | String? | Optional | Phone number |
| `contact` | String? | Optional | Additional contact info |
| `projects` | Json? | Optional | Projects array (see below) |
| `experience` | Json? | Optional | Work experiences array (see below) |
| `password` | String | Required | Hashed password (bcrypt) |
| `theme` | String | Default: "aurora" | Selected theme |
| `mobileLayout` | Json? | Optional | Mobile layout config |
| `desktopLayout` | Json? | Optional | Desktop layout config |
| `isPublished` | Boolean | Default: false | Publish status |
| `publishedAt` | DateTime? | Optional | Publish timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Projects JSON Structure:**
```typescript
interface Project {
  id: string;          // Unique ID for the project
  name: string;        // Project name (max 100 chars)
  description: string; // Description (max 500 chars)
  url: string | null;  // Project URL
  imageUrl: string | null; // Image URL
  tags: string[];      // Tags (max 10, each max 30 chars)
}
```

**Experience JSON Structure:**
```typescript
interface WorkExperience {
  company: string;        // Company name (max 100 chars)
  position: string;       // Position/title (max 100 chars)
  startDate: string;      // Start date (YYYY-MM format)
  endDate?: string;       // End date (null = currently employed)
  description?: string;   // Description (max 500 chars)
}
```

---

### Link

Social/media links for the user's page.

```prisma
model Link {
  id        String   @id @default(cuid())
  userId    String
  title     String
  url       String
  icon      String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique identifier |
| `userId` | String | Foreign Key, Indexed | Owner user ID |
| `title` | String | Required | Link title |
| `url` | String | Required | Link URL |
| `icon` | String? | Optional | Icon identifier |
| `order` | Int | Default: 0 | Display order |
| `isActive` | Boolean | Default: true | Enable/disable link |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relationships:**
- `user` - Many-to-One with User (cascade delete)

---

### PageModule

Page content modules for modular composition.

```prisma
model PageModule {
  id        String   @id @default(cuid())
  userId    String
  type      String   // 'links' | 'bio' | 'skills' | 'projects'
  title     String?
  data      Json     // Module-specific data
  order     Int      @default(0)
  gridX     Int      @default(0)
  gridY     Int      @default(0)
  gridW     Int      @default(1)
  gridH     Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique identifier |
| `userId` | String | Foreign Key, Indexed | Owner user ID |
| `type` | String | Required | Module type |
| `title` | String? | Optional | Module title override |
| `data` | Json | Required | Module-specific data |
| `order` | Int | Default: 0 | Display order |
| `gridX` | Int | Default: 0 | Grid X position |
| `gridY` | Int | Default: 0 | Grid Y position |
| `gridW` | Int | Default: 1 | Grid width |
| `gridH` | Int | Default: 1 | Grid height |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Module Types & Data Structures:**

**Links Module:**
```typescript
{
  type: 'links',
  linkIds: string[]  // Array of Link IDs to display
}
```

**Bio Module:**
```typescript
{
  type: 'bio',
  name: string,
  bio: string,
  avatar: string | null,
  visibleFields?: {
    name: boolean,
    bio: boolean,
    avatar: boolean,
    phone: boolean,
    contact: boolean
  }
}
```

**Skills Module:**
```typescript
{
  type: 'skills',
  skills: string[]  // Array of skill names
}
```

**Projects Module:**
```typescript
{
  type: 'projects',
  projectIds: string[]  // Array of project IDs from User.projects
}
```

**Relationships:**
- `user` - Many-to-One with User (cascade delete)

---

### Account

NextAuth OAuth account (reserved for future OAuth providers).

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

---

### Session

NextAuth session storage.

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### VerificationToken

Email verification tokens (reserved for future use).

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Indexes

| Model | Field | Purpose |
|-------|-------|---------|
| Link | userId | Fast link queries by user |
| PageModule | userId | Fast module queries by user |
| Account | provider, providerAccountId | OAuth lookup |

## Cascading Deletes

When a User is deleted:
- All their Links are deleted
- All their PageModules are deleted
- All their Accounts are deleted
- All their Sessions are deleted

## Raw SQL Usage

Some server actions use raw SQL (`prisma.$queryRaw` / `prisma.$executeRaw`) for:
- Complex JSON field queries
- Type-safe updates on Json fields
- Publishing status updates

Example:
```typescript
await prisma.$executeRaw`
  UPDATE "User"
  SET "isPublished" = true, "publishedAt" = ${new Date()}, "updatedAt" = ${new Date()}
  WHERE id = ${userId}
`;
```

## Migration

Run migrations with:
```bash
npx prisma migrate dev  # Development
npx prisma migrate deploy  # Production
```

## Seed

Database seeding script: `prisma/seed.ts`

Run with:
```bash
npm run db:seed
```

## Related Areas

- **[Backend & Server Actions](BACKEND.md)** - Database access patterns
- **[Type Definitions](TYPES.md)** - TypeScript equivalents
