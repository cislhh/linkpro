"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ExternalLink, Edit, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";

interface ProjectItemProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
}

/**
 * ProjectItem Component
 *
 * Displays a single project card with drag handle, edit and delete actions.
 *
 * Requirements: Project management in profile page
 */
export function ProjectItem({ project, onEdit, onDelete }: ProjectItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="group">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div
                            className="cursor-grab active:cursor-grabbing pt-1"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Project Image Preview */}
                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted border">
                            {project.imageUrl ? (
                                <img
                                    src={project.imageUrl}
                                    alt={project.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{project.name}</h3>
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
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            查看项目
                                        </a>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onEdit(project)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onDelete(project.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
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
                </CardContent>
            </Card>
        </div>
    );
}
