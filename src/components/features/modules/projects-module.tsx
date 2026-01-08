"use client";

import { ExternalLink, FolderGit2, ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectsModuleData, PageModule, Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectsModuleProps {
    module: PageModule;
    className?: string;
    isPreview?: boolean;
}

/**
 * ProjectsModule Component
 * 
 * Displays a list of project cards with images, descriptions, and tags.
 * Supports linking to project URLs.
 * 
 * Requirements: 11.1
 */
export function ProjectsModule({ module, className, isPreview = false }: ProjectsModuleProps) {
    const data = module.data as ProjectsModuleData;
    const projects = data.projects || [];

    return (
        <Card className={cn("h-full", className)}>
            {module.title && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4" />
                        {module.title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(!module.title && "pt-6")}>
                {projects.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        暂无项目
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} isPreview={isPreview} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ProjectCardProps {
    project: Project;
    isPreview?: boolean;
}

/**
 * ProjectCard Component
 * 
 * Individual project card with image, title, description, and tags.
 */
function ProjectCard({ project, isPreview }: ProjectCardProps) {
    const content = (
        <div className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
            {/* Project Image */}
            {project.imageUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                    <ImageOff className="h-8 w-8 text-muted-foreground" />
                </div>
            )}

            {/* Project Info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    {project.url && !isPreview && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>

                {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.map((tag, index) => (
                            <span
                                key={`${tag}-${index}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (isPreview || !project.url) {
        return <div className={cn(!project.url && "cursor-default")}>{content}</div>;
    }

    return (
        <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            {content}
        </a>
    );
}
