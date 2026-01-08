"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLink, updateLink, getUserLinks } from "@/actions/link-actions";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { IconSelect } from "./icon-select";
import { getAllIconIds } from "@/lib/icon-dictionary";
import type { Link } from "@/types";

// Get valid icon IDs for validation
const validIconIds = getAllIconIds();

// Form-specific schema for the UI with icon validation
const linkFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    url: z.string().url("Invalid URL format"),
    icon: z.string().refine(
        (val) => val === "" || validIconIds.includes(val),
        { message: "Please select a valid icon" }
    ).optional(),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface LinkFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingLink?: Link | null;
    onSuccess?: () => void;
}

/**
 * LinkForm Component
 * 
 * A dialog form for adding and editing links.
 * Uses React Hook Form with Zod validation.
 * 
 * Requirements: 2.1, 2.2, 2.8
 */
export function LinkForm({ open, onOpenChange, editingLink, onSuccess }: LinkFormProps) {
    const { setLinks } = useEditorStore();
    const isEditing = !!editingLink;

    const form = useForm<LinkFormValues>({
        resolver: zodResolver(linkFormSchema),
        defaultValues: {
            title: "",
            url: "",
            icon: "",
        },
    });

    /**
     * Reset form when editingLink changes (edit mode initialization)
     * This ensures the form is pre-populated with saved values when editing
     * 
     * Requirements: 2.8
     */
    useEffect(() => {
        if (editingLink) {
            form.reset({
                title: editingLink.title,
                url: editingLink.url,
                icon: editingLink.icon ?? "",
            });
        } else {
            form.reset({
                title: "",
                url: "",
                icon: "",
            });
        }
    }, [editingLink, form]);

    // Reset form when dialog opens with new data
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Clear form when closing
            form.reset({
                title: "",
                url: "",
                icon: "",
            });
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (data: LinkFormValues) => {
        try {
            if (isEditing && editingLink) {
                // Update existing link
                const result = await updateLink(editingLink.id, {
                    title: data.title,
                    url: data.url,
                    icon: data.icon || undefined,
                });
                if (result.success) {
                    // Refresh links from server to ensure data consistency
                    const linksResult = await getUserLinks();
                    if (linksResult.success) {
                        setLinks(linksResult.data);
                    }
                    toast.success("Link updated successfully");
                    onOpenChange(false);
                    form.reset();
                    onSuccess?.();
                } else {
                    toast.error(result.error);
                }
            } else {
                // Create new link - order and isActive have defaults in the server action
                const result = await createLink({
                    title: data.title,
                    url: data.url,
                    icon: data.icon || undefined,
                    order: 0,
                    isActive: true,
                });
                if (result.success) {
                    // Refresh links from server to ensure data consistency
                    const linksResult = await getUserLinks();
                    if (linksResult.success) {
                        setLinks(linksResult.data);
                    }
                    toast.success("Link created successfully");
                    onOpenChange(false);
                    form.reset();
                    onSuccess?.();
                } else {
                    toast.error(result.error);
                }
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Link" : "Add New Link"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Website" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>图标 (可选)</FormLabel>
                                    <FormControl>
                                        <IconSelect
                                            value={field.value}
                                            onChange={(iconId) => field.onChange(iconId ?? "")}
                                            placeholder="选择图标 (可选)"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update Link"
                                        : "Add Link"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
