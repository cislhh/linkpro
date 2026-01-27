"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * PageHeader Component
 *
 * A distinctive, reusable header component for all dashboard pages.
 * Features:
 * - Bold typography with gradient accents
 * - Optional stats pills display
 * - Flexible action buttons slot
 * - Animated entrance effect
 *
 * Design: Creative Studio aesthetic with modern creator-focused styling
 */

interface StatItem {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
}

interface PageHeaderProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    stats?: StatItem[];
    actions?: ReactNode;
    variant?: "default" | "gradient" | "minimal";
    size?: "default" | "compact";
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    stats,
    actions,
    variant = "default",
    size = "default"
}: PageHeaderProps) {

    const sizeClasses = {
        default: "gap-6",
        compact: "gap-4"
    };

    return (
        <div className={cn(
            "flex items-start justify-between",
            sizeClasses[size],
            "animate-in fade-in slide-in-from-top-4 duration-500"
        )}>
            {/* Left: Title Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className={cn(
                            "text-3xl font-bold tracking-tight",
                            variant === "gradient" && "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                        )}>
                            {title}
                        </h1>
                    </div>
                </div>
                <p className="text-muted-foreground max-w-xl">
                    {description}
                </p>
            </div>

            {/* Right: Stats and Actions */}
            {(stats || actions) && (
                <div className="flex items-center gap-4 shrink-0">
                    {/* Stats Pills */}
                    {stats && stats.length > 0 && (
                        <div className="flex items-center gap-2">
                            {stats.map((stat, index) => {
                                const StatIcon = stat.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <StatIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground leading-none uppercase tracking-wider">
                                                {stat.label}
                                            </span>
                                            <span className="text-sm font-semibold leading-tight tabular-nums">
                                                {stat.value}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Compact variant for sub-sections
 */
interface PageSectionHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: ReactNode;
}

export function PageSectionHeader({
    title,
    description,
    icon: Icon,
    actions
}: PageSectionHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
