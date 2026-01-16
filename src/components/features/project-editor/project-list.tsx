"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus, FolderGit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserProjects } from "@/actions/user-actions";
import { ProjectItem } from "./project-item";
import { ProjectForm } from "./project-form";
import type { Project } from "@/types";

/**
 * ProjectList Component
 *
 * Displays user's projects with drag-and-drop reordering support.
 * Uses @dnd-kit for accessible drag-and-drop functionality.
 *
 * Requirements: Project management in profile page
 */
export function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load projects on mount (from session data)
    useEffect(() => {
        // Projects will be loaded via server component props
        // For now, initialize with empty array
        setProjects([]);
        setIsLoading(false);
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex((p) => p.id === active.id);
            const newIndex = projects.findIndex((p) => p.id === over.id);

            // Optimistically update the UI
            const newProjects = arrayMove(projects, oldIndex, newIndex);
            setProjects(newProjects);

            // Persist to database
            await saveProjects(newProjects);
        }
    };

    const saveProjects = async (projectsToSave: Project[]) => {
        setIsSaving(true);
        try {
            const result = await updateUserProjects(projectsToSave);
            if (!result.success) {
                toast.error("保存失败", { description: result.error });
            }
        } catch (error) {
            console.error("Failed to save projects:", error);
            toast.error("保存失败", { description: "请稍后重试" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProject(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (projectId: string) => {
        const newProjects = projects.filter((p) => p.id !== projectId);
        setProjects(newProjects);
        await saveProjects(newProjects);
    };

    const handleFormClose = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setEditingProject(null);
        }
    };

    const handleProjectSave = async (project: Project) => {
        let newProjects: Project[];

        if (editingProject) {
            // Update existing project
            newProjects = projects.map((p) =>
                p.id === project.id ? project : p
            );
        } else {
            // Add new project
            newProjects = [...projects, project];
        }

        setProjects(newProjects);
        await saveProjects(newProjects);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">我的项目</h2>
                <Button onClick={handleAddNew} size="sm" disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    添加项目
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                        暂无项目，点击上方按钮添加您的第一个项目
                    </p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={projects.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <ProjectItem
                                    key={project.id}
                                    project={project}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <ProjectForm
                open={isFormOpen}
                onOpenChange={handleFormClose}
                editingProject={editingProject}
                onSave={handleProjectSave}
            />
        </div>
    );
}
