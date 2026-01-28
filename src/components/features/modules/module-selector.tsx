"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Link2,
    User,
    Sparkles,
    FolderKanban,
    Plus,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createModule } from "@/actions/module-actions";
import { toast } from "sonner";
import type { ModuleType, PageModule, ModuleData } from "@/types";

interface ModuleSelectorProps {
    onModuleCreated?: (module: PageModule) => void;
    className?: string;
}

interface ModuleTypeOption {
    type: ModuleType;
    label: string;
    description: string;
    icon: React.ReactNode;
    defaultData: ModuleData;
    defaultTitle: string;
}

/**
 * Module type options with their default configurations
 * 
 * Requirements: 11.1
 */
const moduleTypes: ModuleTypeOption[] = [
    {
        type: "links",
        label: "链接模块",
        description: "展示社交链接列表",
        icon: <Link2 className="h-6 w-6" />,
        defaultData: { type: "links", linkIds: [] },
        defaultTitle: "我的链接",
    },
    {
        type: "bio",
        label: "个人简介",
        description: "头像、姓名和简介",
        icon: <User className="h-6 w-6" />,
        defaultData: { type: "bio", name: "", bio: "", avatar: null },
        defaultTitle: "关于我",
    },
    {
        type: "skills",
        label: "技能标签",
        description: "技能标签云展示",
        icon: <Sparkles className="h-6 w-6" />,
        defaultData: { type: "skills", skills: [] },
        defaultTitle: "技能",
    },
    {
        type: "projects",
        label: "项目展示",
        description: "项目卡片列表",
        icon: <FolderKanban className="h-6 w-6" />,
        defaultData: { type: "projects", projectIds: [] },
        defaultTitle: "项目",
    },
];

/**
 * ModuleSelector Component
 * 
 * Displays available module types that users can add to their page.
 * Clicking a module type creates a new module with default data.
 * 
 * Requirements: 11.1
 */
export function ModuleSelector({ onModuleCreated, className }: ModuleSelectorProps) {
    const [loadingType, setLoadingType] = useState<ModuleType | null>(null);

    const handleAddModule = async (option: ModuleTypeOption) => {
        setLoadingType(option.type);

        try {
            const result = await createModule({
                type: option.type,
                title: option.defaultTitle,
                data: option.defaultData,
                order: 0,
                gridX: 0,
                gridY: 0,
                gridW: 1,
                gridH: 1,
            });

            if (result.success) {
                toast.success(`${option.label}已添加`);
                onModuleCreated?.(result.data);
            } else {
                toast.error(result.error || "添加模块失败");
            }
        } catch {
            toast.error("添加模块时发生错误");
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    添加模块
                </CardTitle>
                <CardDescription>
                    选择要添加到页面的模块类型
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {moduleTypes.map((option) => (
                        <ModuleTypeCard
                            key={option.type}
                            option={option}
                            isLoading={loadingType === option.type}
                            disabled={loadingType !== null}
                            onClick={() => handleAddModule(option)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface ModuleTypeCardProps {
    option: ModuleTypeOption;
    isLoading: boolean;
    disabled: boolean;
    onClick: () => void;
}

/**
 * ModuleTypeCard Component
 * 
 * Individual card for each module type option.
 * Shows icon, label, and description with hover animation.
 */
function ModuleTypeCard({ option, isLoading, disabled, onClick }: ModuleTypeCardProps) {
    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
            <Button
                variant="outline"
                className={cn(
                    "h-auto w-full flex-col items-start gap-2 p-4 text-left",
                    "hover:border-primary/50 hover:bg-accent/50",
                    disabled && !isLoading && "opacity-50"
                )}
                disabled={disabled}
                onClick={onClick}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            option.icon
                        )}
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                        {option.description}
                    </p>
                </div>
            </Button>
        </motion.div>
    );
}
