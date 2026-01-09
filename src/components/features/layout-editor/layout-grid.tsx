"use client";

import { useCallback, useEffect, useState } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import { useLayoutStore } from "@/stores/layout-store";
import { ModuleCard } from "./module-card";
import type { PageModule, Link, LayoutItem } from "@/types";
import { cn } from "@/lib/utils";

// Import react-grid-layout styles
import "react-grid-layout/css/styles.css";
import "./layout-grid.css";

interface LayoutGridProps {
    modules: PageModule[];
    links: Link[];
    className?: string;
    cols?: number;
    rowHeight?: number;
    isEditing?: boolean;
    onLayoutChange?: (layout: LayoutItem[]) => void;
}

/**
 * LayoutGrid Component
 * 
 * A grid-based layout editor using react-grid-layout.
 * Supports drag-and-drop positioning and resizing of modules.
 * 
 * Requirements: 12.1, 12.2
 */
export function LayoutGrid({
    modules,
    links,
    className,
    cols = 12,
    rowHeight = 100,
    isEditing = false,
    onLayoutChange,
}: LayoutGridProps) {
    const { layout, updateLayout } = useLayoutStore();
    const [mounted, setMounted] = useState(false);

    // Use container width hook for responsive behavior
    const { width, containerRef } = useContainerWidth({ initialWidth: 1200 });

    // Ensure component is mounted before rendering grid (SSR safety)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Convert LayoutItem[] to react-grid-layout format
    const gridLayout = layout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW || 2,
        minH: item.minH || 2,
    }));

    // Handle layout changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLayoutChange = useCallback((newLayout: any[]) => {
        const layoutItems: LayoutItem[] = newLayout.map((item) => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: item.minW,
            minH: item.minH,
        }));

        updateLayout(layoutItems);
        onLayoutChange?.(layoutItems);
    }, [updateLayout, onLayoutChange]);

    // Don't render until mounted (prevents SSR hydration issues)
    if (!mounted) {
        return (
            <div className={cn("min-h-[400px] bg-muted/30 rounded-lg animate-pulse", className)} />
        );
    }

    // Empty state
    if (modules.length === 0) {
        return (
            <div
                ref={containerRef as React.RefObject<HTMLDivElement>}
                className={cn(
                    "min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg",
                    className
                )}
            >
                <p className="text-muted-foreground text-sm">
                    暂无模块，请先在页面管理中添加模块
                </p>
            </div>
        );
    }

    // Breakpoint configuration
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const colsConfig = { lg: cols, md: 10, sm: 6, xs: 4, xxs: 2 };

    // Grid props - using any to bypass outdated type definitions
    // The @types/react-grid-layout package is outdated for v2.x
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gridProps: any = {
        className: "layout",
        layouts: { lg: gridLayout, md: gridLayout, sm: gridLayout, xs: gridLayout, xxs: gridLayout },
        breakpoints,
        cols: colsConfig,
        rowHeight,
        width,
        onLayoutChange: handleLayoutChange,
        isDraggable: isEditing,
        isResizable: isEditing,
        draggableHandle: ".drag-handle",
        resizeHandles: isEditing ? ["se", "sw", "ne", "nw"] : [],
        margin: [16, 16],
        containerPadding: [0, 0],
        compactType: "vertical",
    };

    return (
        <div
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className={cn("layout-grid-container", className)}
        >
            <ResponsiveGridLayout {...gridProps}>
                {modules.map((module) => (
                    <div key={module.id} className="layout-item">
                        <ModuleCard
                            module={module}
                            links={links}
                            isEditing={isEditing}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
