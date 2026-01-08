"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BioModuleData, PageModule } from "@/types";
import { cn } from "@/lib/utils";

interface BioModuleProps {
    module: PageModule;
    className?: string;
}

/**
 * BioModule Component
 * 
 * Displays personal introduction with avatar, name, and bio.
 * Used for showcasing user profile information on the public page.
 * 
 * Requirements: 11.1
 */
export function BioModule({ module, className }: BioModuleProps) {
    const data = module.data as BioModuleData;

    return (
        <Card className={cn("h-full", className)}>
            {module.title && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn("flex flex-col items-center text-center", !module.title && "pt-6")}>
                {/* Avatar */}
                <div className="mb-4">
                    {data.avatar ? (
                        <img
                            src={data.avatar}
                            alt={data.name || "用户头像"}
                            className="h-24 w-24 rounded-full object-cover border-2 border-border"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Name */}
                {data.name && (
                    <h2 className="text-xl font-bold mb-2">{data.name}</h2>
                )}

                {/* Bio */}
                {data.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-prose">
                        {data.bio}
                    </p>
                )}

                {/* Empty state */}
                {!data.name && !data.bio && (
                    <p className="text-muted-foreground text-sm">
                        暂无个人简介
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
