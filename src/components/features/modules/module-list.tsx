"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Link2,
    User,
    Sparkles,
    FolderKanban,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { deleteModule } from "@/actions/module-actions";
import { toast } from "sonner";
import type { PageModule, ModuleType } from "@/types";

interface ModuleListProps {
    modules: PageModule[];
    onModuleDeleted?: (moduleId: string) => void;
    onModuleEdit?: (module: PageModule) => void;
    className?: string;
}

/**
 * Get icon component for module type
 */
function getModuleIcon(type: ModuleType) {
    switch (type) {
        case "links":
            return <Link2 className="h-5 w-5" />;
        case "bio":
            return <User className="h-5 w-5" />;
        case "skills":
            return <Sparkles className="h-5 w-5" />;
        case "projects":
            return <FolderKanban className="h-5 w-5" />;
        default:
            return <Link2 className="h-5 w-5" />;
    }
}

/**
 * Get label for module type
 * Matches the labels in module-selector.tsx for consistency
 */
function getModuleLabel(type: ModuleType): string {
    switch (type) {
        case "links":
            return "链接模块";
        case "bio":
            return "个人简介";
        case "skills":
            return "技能标签";
        case "projects":
            return "项目展示";
        default:
            return "未知模块";
    }
}


/**
 * Get description for module based on its data
 */
function getModuleDescription(module: PageModule): string {
    switch (module.type) {
        case "links": {
            const data = module.data as { linkIds: string[] };
            return `${data.linkIds?.length || 0} 个链接`;
        }
        case "bio": {
            const data = module.data as { name: string; bio: string };
            return data.name || "未设置姓名";
        }
        case "skills": {
            const data = module.data as { skills: string[] };
            return `${data.skills?.length || 0} 个技能`;
        }
        case "projects": {
            const data = module.data as { projectIds: string[] };
            return `${data.projectIds?.length || 0} 个项目`;
        }
        default:
            return "";
    }
}

/**
 * ModuleList Component
 * 
 * Displays all user modules with edit and delete functionality.
 * Shows module type, title, and a brief description.
 * 
 * Requirements: 11.1, 11.3, 11.4
 */
export function ModuleList({ modules, onModuleDeleted, onModuleEdit, className }: ModuleListProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<PageModule | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (module: PageModule) => {
        setModuleToDelete(module);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!moduleToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteModule(moduleToDelete.id);
            if (result.success) {
                toast.success("模块已删除");
                onModuleDeleted?.(moduleToDelete.id);
            } else {
                toast.error(result.error || "删除失败");
            }
        } catch {
            toast.error("删除模块时发生错误");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setModuleToDelete(null);
        }
    };

    if (modules.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-muted p-4">
                        <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">暂无模块</h3>
                    <p className="text-sm text-muted-foreground">
                        点击上方的"添加模块"开始创建你的页面
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle>我的模块</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {modules.map((module) => (
                            <ModuleItem
                                key={module.id}
                                module={module}
                                onEdit={() => onModuleEdit?.(module)}
                                onDelete={() => handleDeleteClick(module)}
                            />
                        ))}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                        <DialogDescription>
                            确定要删除"{moduleToDelete?.title || getModuleLabel(moduleToDelete?.type || "links")}"吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    删除中...
                                </>
                            ) : (
                                "删除"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface ModuleItemProps {
    module: PageModule;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * ModuleItem Component
 * 
 * Individual module card with edit and delete actions.
 */
function ModuleItem({ module, onEdit, onDelete }: ModuleItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
        >
            {/* Module Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {getModuleIcon(module.type)}
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                    {module.title || getModuleLabel(module.type)}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                    {getModuleLabel(module.type)} · {getModuleDescription(module)}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onEdit}
                    className="h-8 w-8"
                    title="编辑模块"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onDelete}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="删除模块"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
