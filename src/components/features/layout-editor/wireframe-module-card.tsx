"use client";

import { cn } from "@/lib/utils";
import type { PageModule } from "@/types";
import {
  User,
  Link as LinkIcon,
  Lightbulb,
  FolderKanban,
  GripVertical,
  Settings2,
} from "lucide-react";

/**
 * WireframeModuleCard Component
 *
 * Wireframe-style module card for layout editor.
 * Shows only structure and type, not detailed content.
 *
 * Features:
 * - Visual representation without content
 * - Module type indicator with icon
 * - Grid position visualization
 * - Drag handle for editing
 * - Size indicator
 *
 * Accessibility: Cursor pointer on interactive elements
 * Design: Minimal wireframe aesthetic
 */
interface WireframeModuleCardProps {
  /** Module data */
  module: PageModule;
  /** Whether the card is being edited (drag/resize enabled) */
  isEditing?: boolean;
  /** Module width in grid units */
  gridWidth?: number;
  /** Module height in grid units */
  gridHeight?: number;
  /** Additional className */
  className?: string;
}

export function WireframeModuleCard({
  module,
  isEditing = false,
  gridWidth = 1,
  gridHeight = 2,
  className,
}: WireframeModuleCardProps) {
  // Get module info based on type
  const moduleInfo = getModuleInfo(module.type);

  return (
    <div
      className={cn(
        // Base card styles - wireframe aesthetic
        "relative w-full h-full",
        "rounded-xl",
        "border-2 border-dashed",
        // Light mode and dark mode
        "border-gray-300 dark:border-gray-700",
        "bg-gray-50/50 dark:bg-gray-900/50",
        // Flex layout
        "flex flex-col items-center justify-center",
        "gap-2",
        "p-4",
        // Transitions
        "transition-all duration-200",
        // Hover state
        isEditing && "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
        className
      )}
      style={{
        minHeight: `${gridHeight * 80 - 16}px`,
      }}
    >
      {/* Drag Handle - Only visible when editing */}
      {isEditing && (
        <div
          className={cn(
            "absolute top-2 left-2",
            "p-1 rounded",
            "bg-gray-200 dark:bg-gray-800",
            "cursor-grab active:cursor-grabbing",
            "drag-handle"
          )}
          aria-label="Drag to move"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      )}

      {/* Module Icon */}
      <div
        className={cn(
          "p-3 rounded-full",
          // Light background for icon
          "bg-gray-200 dark:bg-gray-800",
          // Icon color
          "text-gray-500 dark:text-gray-400"
        )}
      >
        {moduleInfo.icon}
      </div>

      {/* Module Title */}
      <div className="text-center">
        <p
          className={cn(
            "text-xs font-medium",
            "text-gray-600 dark:text-gray-400",
            "uppercase tracking-wider"
          )}
        >
          {moduleInfo.label}
        </p>
      </div>

      {/* Size Indicator */}
      <div className="absolute top-2 right-2">
        <span
          className={cn(
            "text-[10px] font-mono",
            "px-1.5 py-0.5 rounded",
            "bg-gray-200 dark:bg-gray-800",
            "text-gray-500 dark:text-gray-400"
          )}
        >
          {gridWidth}×{gridHeight}
        </span>
      </div>

      {/* Configure Button - Only visible when editing and hovering */}
      {isEditing && (
        <div
          className={cn(
            "absolute bottom-2 right-2",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200",
            "p-1.5 rounded-full",
            "bg-white dark:bg-gray-800",
            "shadow-sm",
            "cursor-pointer"
          )}
          aria-label="Configure module"
        >
          <Settings2 className="h-3.5 w-3.5 text-gray-500" />
        </div>
      )}

      {/* Skeleton Content Preview - Shows abstract representation */}
      <div className="w-full space-y-1.5 mt-2">
        {moduleInfo.skeletonPreview}
      </div>
    </div>
  );
}

/**
 * Module info mapping
 */
interface ModuleInfo {
  label: string;
  icon: React.ReactNode;
  skeletonPreview: React.ReactNode;
}

function getModuleInfo(type: PageModule["type"]): ModuleInfo {
  const iconClassName = "h-5 w-5";

  switch (type) {
    case "bio":
      return {
        label: "个人资料",
        icon: <User className={iconClassName} />,
        skeletonPreview: (
          <>
            {/* Avatar placeholder */}
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            {/* Name placeholder */}
            <div className="h-2 w-20 mx-auto rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
            {/* Bio placeholder */}
            <div className="h-1.5 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-1.5 w-3/4 mx-auto rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </>
        ),
      };

    case "links":
      return {
        label: "社交链接",
        icon: <LinkIcon className={iconClassName} />,
        skeletonPreview: (
          <>
            {/* Link items */}
            <div className="h-8 w-full rounded-md bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-full rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-8 w-full rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </>
        ),
      };

    case "skills":
      return {
        label: "技能标签",
        icon: <Lightbulb className={iconClassName} />,
        skeletonPreview: (
          <>
            {/* Skill tags */}
            <div className="flex flex-wrap gap-1 justify-center">
              <div className="h-5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              <div className="h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-18 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </>
        ),
      };

    case "projects":
      return {
        label: "项目展示",
        icon: <FolderKanban className={iconClassName} />,
        skeletonPreview: (
          <>
            {/* Project cards */}
            <div className="h-16 w-full rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </>
        ),
      };

    default:
      return {
        label: "未知模块",
        icon: <div className={cn(iconClassName, "rounded-full bg-gray-300 dark:bg-gray-700")} />,
        skeletonPreview: (
          <div className="h-12 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ),
      };
  }
}
