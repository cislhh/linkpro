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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/actions/module-actions";
import type { PageModule, BioVisibleFields, BioModuleData } from "@/types";

interface BioModuleConfigDialogProps {
    module: PageModule | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

// Default visibility configuration - all fields visible
const DEFAULT_VISIBLE_FIELDS: BioVisibleFields = {
    name: true,
    bio: true,
    avatar: true,
    phone: true,
    contact: true,
};

// Field definitions with labels and descriptions
const FIELD_DEFINITIONS = [
    {
        key: "name" as keyof BioVisibleFields,
        label: "姓名",
        description: "显示您的姓名",
        icon: "👤",
    },
    {
        key: "bio" as keyof BioVisibleFields,
        label: "个人简介",
        description: "显示您的个人介绍",
        icon: "📝",
    },
    {
        key: "avatar" as keyof BioVisibleFields,
        label: "头像",
        description: "显示您的个人头像",
        icon: "🖼️",
    },
    {
        key: "phone" as keyof BioVisibleFields,
        label: "电话",
        description: "显示您的电话号码",
        icon: "📞",
    },
    {
        key: "contact" as keyof BioVisibleFields,
        label: "联系方式",
        description: "显示您的其他联系方式（微信、邮箱等）",
        icon: "✉️",
    },
];

/**
 * BioModuleConfigDialog Component
 *
 * Configuration dialog for bio module field visibility.
 * Allows users to control which fields are displayed in the bio module.
 *
 * Requirements: Bio module field visibility control
 */
export function BioModuleConfigDialog({
    module,
    open,
    onOpenChange,
    onSuccess,
}: BioModuleConfigDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [visibleFields, setVisibleFields] = useState<BioVisibleFields>(DEFAULT_VISIBLE_FIELDS);

    // Reset form when module changes or dialog opens
    useEffect(() => {
        if (!module) return;

        const moduleData = module.data as BioModuleData;
        // Use existing config or defaults
        setVisibleFields({
            ...DEFAULT_VISIBLE_FIELDS,
            ...moduleData?.visibleFields,
        });
    }, [module?.id, module?.updatedAt]);

    const handleToggleField = (field: keyof BioVisibleFields, checked: boolean) => {
        setVisibleFields((prev) => ({
            ...prev,
            [field]: checked,
        }));
    };

    const handleSubmit = async () => {
        if (!module) return;

        setIsPending(true);

        try {
            // Get current module data and update only visibleFields
            const moduleData = module.data as BioModuleData;
            const updatedData: BioModuleData = {
                type: "bio",
                name: moduleData?.name || "",
                bio: moduleData?.bio || "",
                avatar: moduleData?.avatar || null,
                visibleFields: visibleFields,
            };

            const result = await updateModule(module.id, {
                data: updatedData,
            });

            if (result.success) {
                toast.success("显示配置已更新");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("更新失败", { description: result.error });
            }
        } catch (error) {
            console.error("Failed to update bio module config:", error);
            toast.error("更新失败", { description: "请稍后重试" });
        } finally {
            setIsPending(false);
        }
    };

    const visibleCount = Object.values(visibleFields).filter(Boolean).length;

    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>个人简介显示设置</DialogTitle>
                    <DialogDescription>
                        选择在个人简介模块中显示哪些信息（已选中 {visibleCount} 项）
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {FIELD_DEFINITIONS.map((field) => {
                        const isChecked = visibleFields[field.key];

                        return (
                            <div
                                key={field.key}
                                className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50"
                            >
                                <Checkbox
                                    id={`field-${field.key}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                        handleToggleField(field.key, checked as boolean)
                                    }
                                    disabled={isPending}
                                />
                                <div className="flex-1 space-y-1">
                                    <Label
                                        htmlFor={`field-${field.key}`}
                                        className="font-medium cursor-pointer flex items-center gap-2"
                                    >
                                        <span>{field.icon}</span>
                                        <span>{field.label}</span>
                                        {isChecked ? (
                                            <Eye className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {field.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：取消选中某项后，该信息将不在页面上显示。数据本身不会被删除。
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        取消
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || visibleCount === 0}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            "保存配置"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
