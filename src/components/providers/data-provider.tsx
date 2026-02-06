"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/stores/user-store";
import { useEditorStore } from "@/stores/editor-store";
import { useLayoutStore } from "@/stores/layout-store";
import { getUserProfile } from "@/actions/user-actions";
import { getUserLinks } from "@/actions/link-actions";
import { getModules } from "@/actions/module-actions";

/**
 * Data refresh interval in milliseconds (5 minutes)
 */
const REFRESH_INTERVAL = 5 * 60 * 1000;

/**
 * Data visibility change debounce delay in milliseconds (1 second)
 */
const VISIBILITY_CHANGE_DEBOUNCE = 1000;

/**
 * DataProvider Component
 *
 * Centralized data initialization and management component.
 * Responsible for:
 * - Loading initial data when user logs in
 * - Storing data in Zustand stores
 * - Refreshing data when page regains focus (after REFRESH_INTERVAL)
 * - Providing single source of truth for all dashboard pages
 *
 * Requirements: Eliminate duplicate API calls across pages
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const setUserLastFetchTime = useUserStore((state) => state.setLastFetchTime);
  const setLinks = useEditorStore((state) => state.setLinks);
  const setEditorLastFetchTime = useEditorStore((state) => state.setLastFetchTime);
  const setModules = useLayoutStore((state) => state.setModules);
  const setLayoutLastFetchTime = useLayoutStore((state) => state.setLastFetchTime);
  const userShouldFetch = useUserStore((state) => state.shouldFetch);
  const editorShouldFetch = useEditorStore((state) => state.shouldFetch);
  const layoutShouldFetch = useLayoutStore((state) => state.shouldFetch);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const visibilityChangeTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize all data from server
   * Uses Promise.allSettled to ensure partial failures don't block other data
   */
  const initializeData = useCallback(
    async (forceRefresh = false) => {
      if (!session?.user?.id) return;

      // Check if we need to fetch based on time interval
      if (!forceRefresh && isInitialized) {
        const needsUserFetch = userShouldFetch(REFRESH_INTERVAL);
        const needsEditorFetch = editorShouldFetch(REFRESH_INTERVAL);
        const needsLayoutFetch = layoutShouldFetch(REFRESH_INTERVAL);

        if (!needsUserFetch && !needsEditorFetch && !needsLayoutFetch) {
          return;
        }
      }

      setIsLoading(true);

      try {
        const results = await Promise.allSettled([
          getUserProfile(),
          getUserLinks(),
          getModules(),
        ]);

        const now = Date.now();

        // Handle profile data
        if (results[0].status === "fulfilled" && results[0].value.success) {
          const { name, bio, avatarUrl, phone, contact, projects } =
            results[0].value.data;
          setUser({
            profile: { name, bio, avatarUrl, phone, contact },
            projects: projects || [],
          });
          setUserLastFetchTime(now);
        } else if (results[0].status === "rejected") {
          console.error("Failed to load user profile:", results[0].reason);
        }

        // Handle links data
        if (results[1].status === "fulfilled" && results[1].value.success) {
          setLinks(results[1].value.data);
          setEditorLastFetchTime(now);
        } else if (results[1].status === "rejected") {
          console.error("Failed to load links:", results[1].reason);
        }

        // Handle modules data
        if (results[2].status === "fulfilled" && results[2].value.success) {
          await setModules(results[2].value.data);
          setLayoutLastFetchTime(now);
        } else if (results[2].status === "rejected") {
          console.error("Failed to load modules:", results[2].reason);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Data initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      session?.user?.id,
      isInitialized,
      userShouldFetch,
      editorShouldFetch,
      layoutShouldFetch,
      setUser,
      setUserLastFetchTime,
      setLinks,
      setEditorLastFetchTime,
      setModules,
      setLayoutLastFetchTime,
    ]
  );

  /**
   * Initialize data when session becomes authenticated
   */
  useEffect(() => {
    if (status === "authenticated" && !isInitialized) {
      initializeData();
    }
  }, [status, isInitialized, initializeData]);

  /**
   * Handle visibility change for smart refresh
   * When page regains focus, check if data needs refresh
   * Uses debounce to prevent rapid calls when user switches tabs
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Clear existing timer
      if (visibilityChangeTimer.current) {
        clearTimeout(visibilityChangeTimer.current);
      }

      // Only refresh when page becomes visible
      if (document.visibilityState === "visible" && session?.user?.id) {
        // Debounce to prevent rapid calls
        visibilityChangeTimer.current = setTimeout(() => {
          initializeData(true);
        }, VISIBILITY_CHANGE_DEBOUNCE);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      if (visibilityChangeTimer.current) {
        clearTimeout(visibilityChangeTimer.current);
      }
    };
  }, [session?.user?.id, initializeData]);

  return <>{children}</>;
}
