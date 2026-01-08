"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * AuthGuard Component
 * 
 * Checks session validity based on remember me settings.
 * If remember me is not checked and the page is reloaded,
 * or if the 7-day expiry has passed, the user will be logged out.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { rememberMe, loginExpiry, clearAuth } = useAuthStore();

    useEffect(() => {
        // Only check when we have a session
        if (status !== "authenticated" || !session) {
            return;
        }

        // If remember me is not checked, we rely on session storage behavior
        // The session will be cleared when the browser is closed
        if (!rememberMe) {
            // Check if this is a new browser session by checking sessionStorage
            const sessionKey = "linkpro-session-active";
            const isActiveSession = sessionStorage.getItem(sessionKey);

            if (!isActiveSession) {
                // This is a new browser session and remember me was not checked
                // Sign out the user
                clearAuth();
                signOut({ callbackUrl: "/login" });
                return;
            }
        } else {
            // Remember me is checked, check if the 7-day expiry has passed
            if (loginExpiry && loginExpiry <= Date.now()) {
                // Session expired
                clearAuth();
                signOut({ callbackUrl: "/login" });
                return;
            }
        }

        // Mark this browser session as active
        sessionStorage.setItem("linkpro-session-active", "true");
    }, [session, status, rememberMe, loginExpiry, clearAuth]);

    return <>{children}</>;
}
