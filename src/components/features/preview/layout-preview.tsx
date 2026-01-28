"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLayoutStore } from "@/stores/layout-store";
import { useEditorStore } from "@/stores/editor-store";
import { getModules } from "@/actions/module-actions";
import { getUserLinks } from "@/actions/link-actions";
import { getUserProfile } from "@/actions/user-actions";
import { ModuleCard } from "@/components/features/layout-editor/module-card";
import { getThemeStyles } from "./live-preview";
import { cn } from "@/lib/utils";
import type { PageModule, Link, LayoutItem, DeviceMode, ThemeType, Project } from "@/types";
import { Loader2 } from "lucide-react";

interface LayoutPreviewProps {
    /** Device mode for preview (always mobile) */
    deviceMode?: DeviceMode;
    /** Optional className for the container */
    className?: string;
    /** User display name */
    userName?: string | null;
    /** User bio */
    userBio?: string | null;
    /** User avatar URL */
    userAvatar?: string | null;
    /** User phone */
    userPhone?: string | null;
    /** User contact */
    userContact?: string | null;
    /** External loading state from parent component */
    isLoading?: boolean;
}

/**
 * LayoutPreview Component
 *
 * Renders a preview of the user's page with custom module layout.
 * Displays modules in their saved grid positions (mobile-only).
 *
 * Requirements: 16.1 - Display layout result in preview page
 * Note: Desktop mode removed - mobile-only implementation
 */
export function LayoutPreview({
    deviceMode = "mobile",
    className,
    userName,
    userBio,
    userAvatar,
    userPhone,
    userContact,
    isLoading: externalLoading,
}: LayoutPreviewProps) {
    const { data: session } = useSession();
    const { theme } = useEditorStore();
    const { modules, mobileLayout } = useLayoutStore();
    // 直接从 store 获取稳定的函数引用（store actions 的引用永远不会改变）
    const { setModules } = useLayoutStore();
    const [links, setLinks] = useState<Link[]>([]);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load modules and links on mount
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        async function loadData() {
            // 如果没有 session，不卡住 loading
            if (!session?.user?.id) {
                console.log("[LayoutPreview] No session, skipping load");
                setIsLoading(false);
                return;
            }

            // 添加超时保护，10秒后强制结束 loading
            timeoutId = setTimeout(() => {
                if (isMounted) {
                    console.error("[LayoutPreview] Loading timeout!");
                    setIsLoading(false);
                }
            }, 10000);

            try {
                console.log("[LayoutPreview] Starting data load...");
                setIsLoading(true);

                const [modulesResult, linksResult, profileResult] = await Promise.all([
                    getModules(),
                    getUserLinks(),
                    getUserProfile(),
                ]);

                console.log("[LayoutPreview] Data loaded:", {
                    modules: modulesResult.success ? modulesResult.data.length : 'failed',
                    links: linksResult.success ? linksResult.data.length : 'failed',
                    projects: profileResult.success && profileResult.data.projects ? profileResult.data.projects.length : 'failed'
                });

                if (isMounted) {
                    if (modulesResult.success) {
                        console.log("[LayoutPreview] Calling setModules with", modulesResult.data.length, "modules");
                        // 不等待 setModules 完成，避免阻塞
                        setModules(modulesResult.data).catch(err =>
                            console.error("[LayoutPreview] setModules error:", err)
                        );
                    } else {
                        console.error("[LayoutPreview] modulesResult failed:", modulesResult.error);
                    }

                    if (linksResult.success) {
                        setLinks(linksResult.data);
                    }

                    if (profileResult.success && profileResult.data.projects) {
                        setUserProjects(profileResult.data.projects);
                    }
                }
            } catch (error) {
                console.error("[LayoutPreview] Failed to load data:", error);
            } finally {
                clearTimeout(timeoutId);
                if (isMounted) {
                    console.log("[LayoutPreview] Setting isLoading false");
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [session?.user?.id]); // 移除 setModules 依赖，避免无限循环

    // Always use mobile layout
    const activeLayout = mobileLayout;

    // Get theme styles
    const themeStyles = getThemeStyles(theme);

    // Show loading state (either external or internal)
    if (externalLoading || isLoading) {
        return (
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl border bg-background shadow-lg",
                    deviceMode === "mobile" ? "w-[375px]" : "w-full",
                    className
                )}
            >
                <div className="flex items-center justify-center min-h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-background shadow-lg w-[375px]",
                className
            )}
        >
            {/* Phone Frame (mobile mode) */}
            <div className="absolute inset-x-0 top-0 z-10 flex h-6 items-center justify-center bg-black/5">
                <div className="h-1.5 w-20 rounded-full bg-black/20" />
            </div>

            {/* Preview Content */}
            <div
                className={cn(
                    "min-h-[600px] overflow-auto pt-6",
                    themeStyles.background
                )}
            >
                {/* Module Layout Grid */}
                {modules.length === 0 ? (
                    <div className="px-6 pb-8">
                        <div
                            className={cn(
                                "rounded-xl border-2 border-dashed p-6 text-center",
                                themeStyles.emptyState
                            )}
                        >
                            <p className={cn("text-sm opacity-60", themeStyles.text)}>
                                暂无模块，请先在页面管理中添加模块
                            </p>
                        </div>
                    </div>
                ) : (
                    <ModuleLayoutGrid
                        modules={modules}
                        layout={activeLayout}
                        links={links}
                        userProjects={userProjects}
                        deviceMode={deviceMode}
                        theme={theme}
                        userName={userName}
                        userBio={userBio}
                        userAvatar={userAvatar}
                        userPhone={userPhone}
                        userContact={userContact}
                    />
                )}

                {/* Footer */}
                <div className="py-6 text-center">
                    <p className={cn("text-xs opacity-50", themeStyles.text)}>
                        Powered by LinkPro
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ModuleLayoutGridProps {
    modules: PageModule[];
    layout: LayoutItem[];
    links: Link[];
    userProjects?: Project[];
    deviceMode: DeviceMode;
    theme: ThemeType;
    userName?: string | null;
    userBio?: string | null;
    userAvatar?: string | null;
    userPhone?: string | null;
    userContact?: string | null;
}

/**
 * ModuleLayoutGrid Component
 *
 * Renders modules in a CSS Grid based on their layout positions.
 * This is a read-only preview version (no drag/resize).
 * Mobile-only implementation.
 */
function ModuleLayoutGrid({
    modules,
    layout,
    links,
    userProjects,
    deviceMode,
    theme,
    userName,
    userBio,
    userAvatar,
    userPhone,
    userContact,
}: ModuleLayoutGridProps) {
    // Create userData object for BioModule
    const userData = {
        name: userName || null,
        bio: userBio || null,
        avatarUrl: userAvatar || null,
        phone: userPhone || null,
        contact: userContact || null,
    };
    // Create a map of layout items by module ID
    const layoutMap = new Map(layout.map((item) => [item.i, item]));

    // Mobile-only grid configuration: 2 columns, 80px row height
    const cols = 2;
    const rowHeight = 80;
    const gap = 16;

    // Calculate the maximum row to determine grid height
    let maxRow = 0;
    layout.forEach((item) => {
        const endRow = item.y + item.h;
        if (endRow > maxRow) maxRow = endRow;
    });

    return (
        <div
            className="relative px-4 pb-4"
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridAutoRows: `${rowHeight}px`,
                gap: `${gap}px`,
                minHeight: maxRow * rowHeight + (maxRow - 1) * gap,
            }}
        >
            {modules.map((module) => {
                const layoutItem = layoutMap.get(module.id);
                if (!layoutItem) return null;

                return (
                    <div
                        key={module.id}
                        style={{
                            gridColumn: `${layoutItem.x + 1} / span ${layoutItem.w}`,
                            gridRow: `${layoutItem.y + 1} / span ${layoutItem.h}`,
                        }}
                    >
                        <ModuleCard
                            module={module}
                            links={links}
                            userProjects={userProjects}
                            isEditing={false}
                            userData={userData}
                            className="h-full"
                        />
                    </div>
                );
            })}
        </div>
    );
}

export { ModuleLayoutGrid };
