"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "@/stores/editor-store";
import { deleteLink, getUserLinks } from "@/actions/link-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Link } from "@/types";

interface LinkItemProps {
    link: Link;
    onEdit: (link: Link) => void;
}

/**
 * LinkItem Component
 * 
 * A single link card with drag handle, edit and delete actions.
 * Uses @dnd-kit/sortable for drag-and-drop functionality.
 * 
 * Requirements: 2.2, 2.3, 2.8
 */
export function LinkItem({ link, onEdit }: LinkItemProps) {
    const { setLinks, links } = useEditorStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDelete = async () => {
        // Optimistically remove from UI
        const previousLinks = links;
        setLinks(links.filter((l) => l.id !== link.id));

        const result = await deleteLink(link.id);

        if (result.success) {
            // Refresh links from server to ensure data consistency
            const linksResult = await getUserLinks();
            if (linksResult.success) {
                setLinks(linksResult.data);
            }
            toast.success("Link deleted successfully");
        } else {
            // Revert on failure
            setLinks(previousLinks);
            toast.error(result.error);
        }
    };

    /**
     * Handle edit button click
     * Passes the complete link data to the parent for form pre-population
     * 
     * Requirements: 2.8
     */
    const handleEdit = () => {
        onEdit(link);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? "opacity-50 shadow-lg" : ""}`}
        >
            <CardContent className="flex items-center gap-3 p-3">
                {/* Drag Handle */}
                <button
                    className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                {/* Link Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{link.title}</h3>
                        {!link.isActive && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Hidden
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                    >
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open link in new tab"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="More options">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
