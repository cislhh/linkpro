"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FolderGit2, ExternalLink, ImageOff, Check } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/actions/module-actions";
import type { PageModule, Project, ProjectsModuleData } from "@/types";

interface ProjectsModuleConfigDialogProps {
    module: PageModule | null;
    userProjects: Project[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

/**
 * ProjectsModuleConfigDialog Component
 *
 * Configuration dialog for projects module.
 * Allows users to select which projects to display from their project list.
 *
 * Similar to how links module works - references User.projects.
 *
 * Requirements: Project module visibility control
 */
export function ProjectsModuleConfigDialog({
    module,
    userProjects,
    open,
    onOpenChange,
    onSuccess,
}: ProjectsModuleConfigDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    // Reset selection when module changes or dialog opens
    useEffect(() => {
        if (!module) return;

        const moduleData = module.data as ProjectsModuleData;
        // Use existing selection or empty array
        setSelectedProjectIds(moduleData?.projectIds || []);
    }, [module?.id, module?.updatedAt]);

    const handleToggleProject = (projectId: string, checked: boolean) => {
        setSelectedProjectIds((prev) => {
            if (checked) {
                return [...prev, projectId];
            } else {
                return prev.filter((id) => id !== projectId);
            }
        });
    };

    const handleSubmit = async () => {
        if (!module) return;

        setIsPending(true);

        try {
            // Update module data with selected project IDs
            const updatedData: ProjectsModuleData = {
                type: "projects",
                projectIds: selectedProjectIds,
            };

            const result = await updateModule(module.id, {
                data: updatedData,
            });

            if (result.success) {
                toast.success("项目模块已更新");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("更新失败", { description: result.error });
            }
        } catch (error) {
            console.error("Failed to update projects module config:", error);
            toast.error("更新失败", { description: "请稍后重试" });
        } finally {
            setIsPending(false);
        }
    };

    const selectedCount = selectedProjectIds.length;

    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>项目展示设置</DialogTitle>
                    <DialogDescription>
                        选择要在项目模块中展示的项目（已选中 {selectedCount} 项）
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {userProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-2">
                                暂无项目
                            </p>
                            <p className="text-sm text-muted-foreground">
                                请先在"个人信息"页面添加项目
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userProjects.map((project) => {
                                const isSelected = selectedProjectIds.includes(project.id);

                                return (
                                    <div
                                        key={project.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                            isSelected ? "bg-accent border-primary/50" : "hover:bg-accent/50"
                                        )}
                                    >
                                        <Checkbox
                                            id={`project-${project.id}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) =>
                                                handleToggleProject(project.id, checked as boolean)
                                            }
                                            disabled={isPending}
                                        />
                                        <label
                                            htmlFor={`project-${project.id}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Project Image */}
                                                <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-muted border">
                                                    {project.imageUrl ? (
                                                        <img
                                                            src={project.imageUrl}
                                                            alt={project.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Project Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{project.name}</span>
                                                        {isSelected && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    {project.url && (
                                                        <a
                                                            href={project.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                            onClick={(e) => e.preventDefault()}
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            {project.url}
                                                        </a>
                                                    )}
                                                    {project.tags && project.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {project.tags.slice(0, 3).map((tag, index) => (
                                                                <span
                                                                    key={`${tag}-${index}`}
                                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {project.tags.length > 3 && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    +{project.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-4 border-t mt-4">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：取消选中某项后，该项目将不在页面上显示。数据本身不会被删除。
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        取消
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            `保存配置 (${selectedCount})`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
