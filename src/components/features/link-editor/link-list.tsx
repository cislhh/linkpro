"use client";

import { useState } from "react";
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
import { useEditorStore } from "@/stores/editor-store";
import { reorderLinks } from "@/actions/link-actions";
import { LinkItem } from "./link-item";
import { LinkForm } from "./link-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Link } from "@/types";

/**
 * LinkList Component
 * 
 * Displays user's links with drag-and-drop reordering support.
 * Uses @dnd-kit for accessible drag-and-drop functionality.
 * 
 * Requirements: 2.3, 2.4
 */
export function LinkList() {
    const { links, setLinks } = useEditorStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<Link | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = links.findIndex((link) => link.id === active.id);
            const newIndex = links.findIndex((link) => link.id === over.id);

            // Optimistically update the UI
            const newLinks = arrayMove(links, oldIndex, newIndex).map((link, index) => ({
                ...link,
                order: index,
            }));
            setLinks(newLinks);

            // Persist to database
            const linkIds = newLinks.map((link) => link.id);
            const result = await reorderLinks(linkIds);

            if (!result.success) {
                // Revert on failure
                setLinks(links);
                toast.error(result.error);
            }
        }
    };

    const handleEdit = (link: Link) => {
        setEditingLink(link);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingLink(null);
        setIsFormOpen(true);
    };

    const handleFormClose = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setEditingLink(null);
        }
    };

    // Sort links by order
    const sortedLinks = [...links].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Links</h2>
                <Button onClick={handleAddNew} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Link
                </Button>
            </div>

            {sortedLinks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                        No links yet. Add your first link to get started!
                    </p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedLinks.map((link) => link.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sortedLinks.map((link) => (
                                <LinkItem
                                    key={link.id}
                                    link={link}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <LinkForm
                open={isFormOpen}
                onOpenChange={handleFormClose}
                editingLink={editingLink}
            />
        </div>
    );
}
