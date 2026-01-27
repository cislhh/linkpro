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
import { getUserProfile } from "@/actions/user-actions";
import { BioModuleConfigDialog } from "./bio-module-config-dialog";
import { ProjectsModuleConfigDialog } from "./projects-module-config-dialog";
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
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [bioConfigOpen, setBioConfigOpen] = useState(false);
    const [projectsConfigOpen, setProjectsConfigOpen] = useState(false);

    // Form state for each module type
    const [bioData, setBioData] = useState({ name: "", bio: "", avatar: "" });
    const [skillsData, setSkillsData] = useState({ skills: "" });
    const [linksData, setLinksData] = useState<string[]>([]);

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

    // Load user projects when dialog opens for projects module
    useEffect(() => {
        let isMounted = true;

        if (open && module?.type === "projects" && userProjects.length === 0) {
            setProjectsLoading(true);
            getUserProfile().then((result) => {
                if (isMounted) {
                    if (result.success && result.data.projects) {
                        setUserProjects(result.data.projects);
                    }
                    setProjectsLoading(false);
                }
            }).catch((error) => {
                console.error("Failed to load user projects:", error);
                if (isMounted) {
                    setProjectsLoading(false);
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
            // projects module now uses config dialog, no need to load data here
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
                // 支持中英文逗号分隔: "," 和 "，"
                // 同时支持换行符分隔，提升用户输入体验
                updatedData = {
                    type: "skills",
                    skills: skillsData.skills
                        .split(/[,，\n]/)
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                };
                break;
            case "links":
                updatedData = {
                    type: "links",
                    linkIds: linksData,
                };
                break;
            case "projects":
                // Projects module now uses config dialog, this case should not be reached
                setIsPending(false);
                return;
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
                        <div className="py-8 text-center space-y-4">
                            <div>
                                <p className="text-muted-foreground mb-2">
                                    个人简介的数据来自"个人信息"页面
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    您可以在此配置哪些字段在页面上显示
                                </p>
                            </div>
                            <Button asChild variant="outline" className="mb-4">
                                <a href="/dashboard/profile">前往个人信息页面</a>
                            </Button>
                            <div className="pt-4 border-t">
                                <Button
                                    type="button"
                                    onClick={() => setBioConfigOpen(true)}
                                    className="w-full"
                                >
                                    配置显示设置
                                </Button>
                            </div>
                        </div>
                    )}

                    {module.type === "skills" && (
                        <div className="space-y-2">
                            <Label htmlFor="skills">技能标签</Label>
                            <Textarea
                                id="skills"
                                value={skillsData.skills}
                                onChange={(e) => setSkillsData({ skills: e.target.value })}
                                rows={4}
                                placeholder="React&#10;TypeScript&#10;Node.js&#10;&#10;或使用逗号: React, TypeScript, Node.js"
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                支持多种分隔方式：换行、英文逗号(,)或中文逗号(，)
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
                        <div className="py-8 text-center space-y-4">
                            <div>
                                <p className="text-muted-foreground mb-2">
                                    项目数据来自"个人信息"页面
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    您可以在此勾选想要展示的项目
                                </p>
                            </div>
                            <Button asChild variant="outline" className="mb-4">
                                <a href="/dashboard/profile">前往个人信息页面</a>
                            </Button>
                            <div className="pt-4 border-t">
                                {projectsLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : userProjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        暂无项目，请先添加项目
                                    </p>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setProjectsConfigOpen(true)}
                                        className="w-full"
                                    >
                                        配置展示项目 ({userProjects.length} 个可用)
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {module.type === "bio" || module.type === "projects" ? (
                        // bio 和 projects 模块只显示关闭按钮，因为使用配置弹窗
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            关闭
                        </Button>
                    ) : (
                        // skills 和 links 模块显示保存按钮
                        <>
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
                        </>
                    )}
                </DialogFooter>
            </DialogContent>

            {/* Bio Module Config Dialog */}
            <BioModuleConfigDialog
                module={module}
                open={bioConfigOpen}
                onOpenChange={setBioConfigOpen}
                onSuccess={onSuccess}
            />

            {/* Projects Module Config Dialog */}
            <ProjectsModuleConfigDialog
                module={module}
                userProjects={userProjects}
                open={projectsConfigOpen}
                onOpenChange={setProjectsConfigOpen}
                onSuccess={onSuccess}
            />
        </Dialog>
    );
}
