"use client";

import { GripVertical, Link as LinkIcon, User, Sparkles, FolderGit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinksModule, BioModule, SkillsModule, ProjectsModule } from "@/components/features/modules";
import type { PageModule, Link, ModuleType } from "@/types";
import { cn } from "@/lib/utils";

interface UserData {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
}

interface ModuleCardProps {
  module: PageModule;
  links: Link[];
  isEditing?: boolean;
  userData?: UserData;
  className?: string;
}

/**
 * ModuleCard Component
 *
 * A draggable card wrapper for page modules in the layout editor.
 * Displays module preview content and provides drag handle when editing.
 *
 * Requirements: 12.2
 */
export function ModuleCard({ module, links, isEditing = false, userData, className }: ModuleCardProps) {
  const moduleIcon = getModuleIcon(module.type);
  const moduleLabel = getModuleLabel(module.type);

  return (
    <div
      className={cn(
        "h-full w-full relative group",
        isEditing && "ring-2 ring-transparent hover:ring-primary/50 rounded-lg transition-all",
        className
      )}
    >
      {/* Drag Handle - Only visible when editing */}
      {isEditing && (
        <div className="drag-handle absolute top-2 left-2 z-10 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Module Type Badge - Only visible when editing */}
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border shadow-sm text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          {moduleIcon}
          <span>{moduleLabel}</span>
        </div>
      )}

      {/* Module Content */}
      <div className="h-full overflow-hidden">
        <ModuleContent module={module} links={links} userData={userData} isPreview />
      </div>
    </div>
  );
}

interface ModuleContentProps {
  module: PageModule;
  links: Link[];
  userData?: UserData;
  isPreview?: boolean;
}

/**
 * ModuleContent Component
 *
 * Renders the appropriate module component based on module type.
 */
function ModuleContent({ module, links, userData, isPreview = false }: ModuleContentProps) {
  switch (module.type) {
    case "links":
      return <LinksModule module={module} links={links} isPreview={isPreview} />;
    case "bio":
      return <BioModule module={module} userData={userData} />;
    case "skills":
      return <SkillsModule module={module} />;
    case "projects":
      return <ProjectsModule module={module} isPreview={isPreview} />;
    default:
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">未知模块类型</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              无法渲染此模块类型: {module.type}
            </p>
          </CardContent>
        </Card>
      );
  }
}

/**
 * Get icon component for module type
 */
function getModuleIcon(type: ModuleType): React.ReactNode {
  const iconClass = "h-3.5 w-3.5";

  switch (type) {
    case "links":
      return <LinkIcon className={iconClass} />;
    case "bio":
      return <User className={iconClass} />;
    case "skills":
      return <Sparkles className={iconClass} />;
    case "projects":
      return <FolderGit2 className={iconClass} />;
    default:
      return null;
  }
}

/**
 * Get display label for module type
 */
function getModuleLabel(type: ModuleType): string {
  switch (type) {
    case "links":
      return "链接";
    case "bio":
      return "简介";
    case "skills":
      return "技能";
    case "projects":
      return "项目";
    default:
      return "模块";
  }
}
