"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLayoutStore } from "@/stores/layout-store";
import { useEditorStore } from "@/stores/editor-store";
import { getModules } from "@/actions/module-actions";
import { getUserLinks } from "@/actions/link-actions";
import { ModuleCard } from "@/components/features/layout-editor/module-card";
import { getThemeStyles } from "./live-preview";
import { cn } from "@/lib/utils";
import type { PageModule, Link, LayoutItem, DeviceMode, ThemeType } from "@/types";
import { Loader2, User } from "lucide-react";

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
}: LayoutPreviewProps) {
    const { data: session } = useSession();
    const { theme } = useEditorStore();
    const { modules, mobileLayout } = useLayoutStore();
    // 使用 useLayoutActions 获取稳定的函数引用
    const { setModules } = useLayoutStore();
    const [links, setLinks] = useState<Link[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoaded = useRef(false);

    // Load modules and links on mount
    useEffect(() => {
        // 防止重复加载
        if (hasLoaded.current) return;
        if (!session?.user?.id) return;

        hasLoaded.current = true;

        let isMounted = true;

        async function loadData() {
            try {
                setIsLoading(true);
                const [modulesResult, linksResult] = await Promise.all([
                    getModules(),
                    getUserLinks(),
                ]);

                if (isMounted) {
                    if (modulesResult.success) {
                        await setModules(modulesResult.data);
                    }

                    if (linksResult.success) {
                        setLinks(linksResult.data);
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [session?.user?.id]); // 移除 setModules 依赖，避免无限循环

    // Always use mobile layout
    const activeLayout = mobileLayout;

    // Get theme styles
    const themeStyles = getThemeStyles(theme);

    if (isLoading) {
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
                {/* Profile Header */}
                <div className="flex flex-col items-center px-6 py-8 text-center">
                    {/* Avatar */}
                    <div
                        className={cn(
                            "mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full",
                            themeStyles.avatar
                        )}
                    >
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt={userName || "User avatar"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className={cn("h-10 w-10", themeStyles.avatarIcon)} />
                        )}
                    </div>

                    {/* Name */}
                    <h1 className={cn("text-xl font-bold", themeStyles.text)}>
                        {userName || "Your Name"}
                    </h1>

                    {/* Bio */}
                    {userBio && (
                        <p className={cn("mt-2 max-w-xs text-sm opacity-80", themeStyles.text)}>
                            {userBio}
                        </p>
                    )}
                </div>

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
