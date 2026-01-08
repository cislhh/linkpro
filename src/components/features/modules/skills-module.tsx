"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillsModuleData, PageModule } from "@/types";
import { cn } from "@/lib/utils";

interface SkillsModuleProps {
    module: PageModule;
    className?: string;
}

/**
 * SkillsModule Component
 * 
 * Displays skills as a tag cloud with visual styling.
 * Supports variable tag sizes for visual interest.
 * 
 * Requirements: 11.1
 */
export function SkillsModule({ module, className }: SkillsModuleProps) {
    const data = module.data as SkillsModuleData;
    const skills = data.skills || [];

    return (
        <Card className={cn("h-full", className)}>
            {module.title && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {module.title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(!module.title && "pt-6")}>
                {skills.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        暂无技能标签
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <SkillTag key={`${skill}-${index}`} skill={skill} index={index} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface SkillTagProps {
    skill: string;
    index: number;
}

/**
 * SkillTag Component
 * 
 * Individual skill tag with subtle color variations.
 * Uses index to create visual variety in the tag cloud.
 */
function SkillTag({ skill, index }: SkillTagProps) {
    // Color variants for visual interest
    const colorVariants = [
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
        "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    ];

    const colorClass = colorVariants[index % colorVariants.length];

    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-transform hover:scale-105",
                colorClass
            )}
        >
            {skill}
        </span>
    );
}
