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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { projectSchema } from "@/lib/validations";
import type { Project } from "@/types";

interface ProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProject: Project | null;
    onSave: (project: Project) => void;
}

/**
 * ProjectForm Component
 *
 * Dialog form for adding/editing projects.
 * Validates all project fields using Zod schema.
 *
 * Requirements: Project management in profile page
 */
export function ProjectForm({ open, onOpenChange, editingProject, onSave }: ProjectFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        url: "",
        imageUrl: "",
        tags: "",
    });

    // Reset form when dialog opens or editing project changes
    useEffect(() => {
        if (open) {
            if (editingProject) {
                setFormData({
                    id: editingProject.id,
                    name: editingProject.name,
                    description: editingProject.description,
                    url: editingProject.url || "",
                    imageUrl: editingProject.imageUrl || "",
                    tags: editingProject.tags.join(", "),
                });
            } else {
                setFormData({
                    id: `project-${Date.now()}`,
                    name: "",
                    description: "",
                    url: "",
                    imageUrl: "",
                    tags: "",
                });
            }
        }
    }, [open, editingProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            // Validate and parse tags
            const tags = formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const projectData: Project = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                url: formData.url || null,
                imageUrl: formData.imageUrl || null,
                tags,
            };

            // Validate using Zod schema
            const validated = projectSchema.parse(projectData);

            onSave(validated);
            onOpenChange(false);
            toast.success(editingProject ? "项目已更新" : "项目已添加");
        } catch (error) {
            if (error instanceof Error) {
                toast.error("验证失败", { description: error.message });
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingProject ? "编辑项目" : "添加项目"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingProject
                            ? "修改项目信息"
                            : "添加一个新项目到您的个人主页"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            项目名称 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="我的项目"
                            disabled={isPending}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">项目描述</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="简要描述这个项目..."
                            rows={3}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">项目链接</Label>
                        <Input
                            id="url"
                            type="url"
                            value={formData.url}
                            onChange={(e) =>
                                setFormData({ ...formData, url: e.target.value })
                            }
                            placeholder="https://example.com"
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">图片 URL</Label>
                        <Input
                            id="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, imageUrl: e.target.value })
                            }
                            placeholder="https://example.com/image.png"
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">标签</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            placeholder="React, TypeScript, Node.js"
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            用逗号分隔多个标签（最多 10 个）
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={isPending || !formData.name.trim()}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                "保存"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
