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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/actions/module-actions";
import { getUserLinks } from "@/actions/link-actions";
import type { PageModule, ModuleData, Link, Project, BioModuleData, SkillsModuleData, LinksModuleData, ProjectsModuleData } from "@/types";

interface ModuleEditDialogProps {
    module: PageModule | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

/**
 * Get label for module type
 */
function getModuleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        links: "链接模块",
        bio: "个人简介模块",
        skills: "技能标签模块",
        projects: "项目展示模块",
    };
    return labels[type] || type;
}

/**
 * ModuleEditDialog Component
 *
 * Dialog for editing module content based on module type.
 * Supports all module types: links, bio, skills, projects.
 *
 * Requirements: 19.1, 19.2, 19.4, 19.5
 */
export function ModuleEditDialog({ module, open, onOpenChange, onSuccess }: ModuleEditDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [userLinks, setUserLinks] = useState<Link[]>([]);
    const [linksLoading, setLinksLoading] = useState(false);

    // Form state for each module type
    const [bioData, setBioData] = useState({ name: "", bio: "", avatar: "" });
    const [skillsData, setSkillsData] = useState({ skills: "" });
    const [linksData, setLinksData] = useState<string[]>([]);
    const [projectsData, setProjectsData] = useState<Project[]>([]);

    // Load user links when dialog opens for links module
    useEffect(() => {
        let isMounted = true;

        if (open && module?.type === "links" && userLinks.length === 0) {
            setLinksLoading(true);
            getUserLinks().then((result) => {
                if (isMounted) {
                    if (result.success) {
                        setUserLinks(result.data);
                    }
                    setLinksLoading(false);
                }
            }).catch((error) => {
                console.error("Failed to load user links:", error);
                if (isMounted) {
                    setLinksLoading(false);
                }
            });
        }

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, module?.type]);

    // Reset form when module changes or dialog opens
    useEffect(() => {
        if (!module) return;

        const data = module.data;
        const dataWithKey = { key: module.id + module.updatedAt, data };

        switch (module.type) {
            case "bio": {
                const bio = dataWithKey.data as BioModuleData;
                setBioData({
                    name: bio.name || "",
                    bio: bio.bio || "",
                    avatar: bio.avatar || "",
                });
                break;
            }
            case "skills": {
                const skills = dataWithKey.data as SkillsModuleData;
                setSkillsData({
                    skills: skills.skills?.join(", ") || "",
                });
                break;
            }
            case "links": {
                const links = dataWithKey.data as LinksModuleData;
                setLinksData(links.linkIds || []);
                break;
            }
            case "projects": {
                const projects = dataWithKey.data as ProjectsModuleData;
                setProjectsData(projects.projects || []);
                break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module?.id, module?.updatedAt]);

    const handleSubmit = async () => {
        if (!module) return;

        setIsPending(true);

        let updatedData: ModuleData;

        switch (module.type) {
            case "bio":
                updatedData = {
                    type: "bio",
                    name: bioData.name,
                    bio: bioData.bio,
                    avatar: bioData.avatar || null,
                };
                break;
            case "skills":
                updatedData = {
                    type: "skills",
                    skills: skillsData.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                };
                break;
            case "links":
                updatedData = {
                    type: "links",
                    linkIds: linksData,
                };
                break;
            case "projects":
                updatedData = {
                    type: "projects",
                    projects: projectsData,
                };
                break;
            default:
                setIsPending(false);
                return;
        }

        const result = await updateModule(module.id, {
            data: updatedData,
        });

        setIsPending(false);

        if (result.success) {
            toast.success("模块更新成功");
            onOpenChange(false);
            onSuccess();
        } else {
            toast.error("更新失败", { description: result.error });
        }
    };

    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>编辑{getModuleTypeLabel(module.type)}</DialogTitle>
                    <DialogDescription>
                        修改模块的内容和配置
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {module.type === "bio" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">姓名</Label>
                                <Input
                                    id="name"
                                    value={bioData.name}
                                    onChange={(e) => setBioData({ ...bioData, name: e.target.value })}
                                    placeholder="请输入姓名"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">简介</Label>
                                <Textarea
                                    id="bio"
                                    value={bioData.bio}
                                    onChange={(e) => setBioData({ ...bioData, bio: e.target.value })}
                                    rows={3}
                                    placeholder="请输入个人简介"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">头像 URL</Label>
                                <Input
                                    id="avatarUrl"
                                    value={bioData.avatar}
                                    onChange={(e) => setBioData({ ...bioData, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                        </>
                    )}

                    {module.type === "skills" && (
                        <div className="space-y-2">
                            <Label htmlFor="skills">技能标签</Label>
                            <Textarea
                                id="skills"
                                value={skillsData.skills}
                                onChange={(e) => setSkillsData({ skills: e.target.value })}
                                rows={4}
                                placeholder="React, TypeScript, Node.js, ..."
                            />
                            <p className="text-xs text-muted-foreground">
                                用逗号分隔多个技能标签
                            </p>
                        </div>
                    )}

                    {module.type === "links" && (
                        <div className="space-y-2">
                            <Label>选择要显示的链接</Label>
                            {linksLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : userLinks.length === 0 ? (
                                <div className="text-sm text-muted-foreground py-4">
                                    暂无链接，请先在&ldquo;个人信息&rdquo;页面添加链接
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {userLinks.map((link) => (
                                        <div
                                            key={link.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`link-${link.id}`}
                                                checked={linksData.includes(link.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setLinksData([...linksData, link.id]);
                                                    } else {
                                                        setLinksData(linksData.filter((id) => id !== link.id));
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-border"
                                            />
                                            <label
                                                htmlFor={`link-${link.id}`}
                                                className="flex-1 cursor-pointer flex items-center gap-2"
                                            >
                                                <span className="font-medium">{link.title}</span>
                                                <span className="text-sm text-muted-foreground truncate">
                                                    {link.url}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {module.type === "projects" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>项目列表</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setProjectsData([
                                            ...projectsData,
                                            {
                                                id: `temp-${Date.now()}`,
                                                name: "",
                                                description: "",
                                                url: null,
                                                imageUrl: null,
                                                tags: [],
                                            },
                                        ]);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    添加项目
                                </Button>
                            </div>
                            {projectsData.length === 0 ? (
                                <div className="text-sm text-muted-foreground py-4">
                                    暂无项目，点击上方按钮添加
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                                    {projectsData.map((project, index) => (
                                        <div
                                            key={project.id}
                                            className="p-4 rounded-lg border space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">项目 {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => {
                                                        setProjectsData(
                                                            projectsData.filter((p) => p.id !== project.id)
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    value={project.name}
                                                    onChange={(e) => {
                                                        const newProjects = [...projectsData];
                                                        newProjects[index] = {
                                                            ...project,
                                                            name: e.target.value,
                                                        };
                                                        setProjectsData(newProjects);
                                                    }}
                                                    placeholder="项目名称"
                                                />
                                                <Textarea
                                                    value={project.description}
                                                    onChange={(e) => {
                                                        const newProjects = [...projectsData];
                                                        newProjects[index] = {
                                                            ...project,
                                                            description: e.target.value,
                                                        };
                                                        setProjectsData(newProjects);
                                                    }}
                                                    rows={2}
                                                    placeholder="项目描述"
                                                />
                                                <Input
                                                    value={project.url || ""}
                                                    onChange={(e) => {
                                                        const newProjects = [...projectsData];
                                                        newProjects[index] = {
                                                            ...project,
                                                            url: e.target.value || null,
                                                        };
                                                        setProjectsData(newProjects);
                                                    }}
                                                    placeholder="项目链接（可选）"
                                                />
                                                <Input
                                                    value={project.imageUrl || ""}
                                                    onChange={(e) => {
                                                        const newProjects = [...projectsData];
                                                        newProjects[index] = {
                                                            ...project,
                                                            imageUrl: e.target.value || null,
                                                        };
                                                        setProjectsData(newProjects);
                                                    }}
                                                    placeholder="图片 URL（可选）"
                                                />
                                                <Input
                                                    value={project.tags.join(", ")}
                                                    onChange={(e) => {
                                                        const newProjects = [...projectsData];
                                                        newProjects[index] = {
                                                            ...project,
                                                            tags: e.target.value
                                                                .split(",")
                                                                .map((t) => t.trim())
                                                                .filter(Boolean),
                                                        };
                                                        setProjectsData(newProjects);
                                                    }}
                                                    placeholder="标签（用逗号分隔）"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                            "保存"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
