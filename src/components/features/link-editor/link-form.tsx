"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLink, updateLink } from "@/actions/link-actions";
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
import type { Link } from "@/types";

// Form-specific schema for the UI
const linkFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    url: z.string().url("Invalid URL format"),
    icon: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface LinkFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingLink?: Link | null;
}

/**
 * LinkForm Component
 * 
 * A dialog form for adding and editing links.
 * Uses React Hook Form with Zod validation.
 * 
 * Requirements: 2.1, 2.2
 */
export function LinkForm({ open, onOpenChange, editingLink }: LinkFormProps) {
    const { setLinks, links } = useEditorStore();
    const isEditing = !!editingLink;

    const form = useForm<LinkFormValues>({
        resolver: zodResolver(linkFormSchema),
        defaultValues: {
            title: editingLink?.title ?? "",
            url: editingLink?.url ?? "",
            icon: editingLink?.icon ?? "",
        },
    });

    // Reset form when dialog opens with new data
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset({
                title: editingLink?.title ?? "",
                url: editingLink?.url ?? "",
                icon: editingLink?.icon ?? "",
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
                    // Update the link in the store
                    setLinks(
                        links.map((l) => (l.id === editingLink.id ? result.data : l))
                    );
                    toast.success("Link updated successfully");
                    onOpenChange(false);
                    form.reset();
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
                    // Add the new link to the store
                    setLinks([...links, result.data]);
                    toast.success("Link created successfully");
                    onOpenChange(false);
                    form.reset();
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
                                    <FormLabel>Icon (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="github, twitter, linkedin..."
                                            {...field}
                                            value={field.value ?? ""}
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
