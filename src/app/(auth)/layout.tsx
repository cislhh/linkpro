import { headers } from "next/headers";
import { enforceRouteProtection } from "@/app/proxy";

/**
 * Auth Layout
 * 
 * Layout for authentication pages (login, register).
 * Redirects authenticated users to dashboard.
 * 
 * Requirements: 9.2 - Authenticated users accessing auth pages redirect to dashboard
 */
export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get current pathname from headers
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/login";

    // Check if authenticated user should be redirected
    await enforceRouteProtection(pathname, "auth");

    return (
        <main className="min-h-screen bg-gradient-to-br from-background to-muted">
            {children}
        </main>
    );
}
