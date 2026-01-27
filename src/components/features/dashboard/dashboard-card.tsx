"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * DashboardCard Component
 *
 * Enhanced card component with distinctive styling and visual depth.
 * Features:
 * - Gradient backgrounds and borders
 * - Hover lift effect
 * - Optional icon headers
 * - Multiple style variants
 *
 * Design: Creative Studio aesthetic with layered depth
 */

interface DashboardCardProps {
    children: ReactNode;
    icon?: LucideIcon;
    title?: string;
    description?: string;
    variant?: "default" | "gradient" | "glass" | "elevated" | "bordered";
    hover?: boolean;
    className?: string;
    contentClassName?: string;
}

export function DashboardCard({
    children,
    icon: Icon,
    title,
    description,
    variant = "default",
    hover = true,
    className,
    contentClassName
}: DashboardCardProps) {

    const variantStyles = {
        default: "bg-card border-border",
        gradient: "bg-gradient-to-br from-card to-card/50 border-border/50",
        glass: "bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-border/50",
        elevated: "bg-card shadow-xl shadow-primary/5 border-primary/10",
        bordered: "bg-transparent border-2 border-border"
    };

    const hoverStyles = hover
        ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
        : "";

    return (
        <Card
            className={cn(
                variantStyles[variant],
                hoverStyles,
                className
            )}
        >
            {(title || Icon) && (
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        {Icon && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            {title && <CardTitle className="text-lg">{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                </CardHeader>
            )}
            <CardContent className={cn("pt-0", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}

/**
 * DashboardStatCard - Specialized card for displaying metrics
 */
interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
    variant?: "default" | "success" | "warning" | "info";
    className?: string;
}

export function DashboardStatCard({
    label,
    value,
    icon: Icon,
    trend,
    variant = "default",
    className
}: StatCardProps) {

    const variantColors = {
        default: "from-primary/20 to-primary/5 border-primary/20 text-primary",
        success: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-600",
        warning: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-600",
        info: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-600"
    };

    const trendIcons = {
        up: "↑",
        down: "↓",
        neutral: "→"
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-5",
            "bg-gradient-to-br",
            variantColors[variant],
            "transition-all duration-300",
            "hover:shadow-lg hover:scale-[1.02]",
            className
        )}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] [background-size:16px_16px]" />
            </div>

            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium opacity-80">{label}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-sm">
                            <span className="opacity-60">{trendIcons[trend.direction]}</span>
                            <span className="font-medium">{trend.value}</span>
                        </div>
                    )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

/**
 * DashboardGrid - Responsive grid container for dashboard cards
 */
interface DashboardGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

export function DashboardGrid({
    children,
    cols = 2,
    className
}: DashboardGridProps) {

    const colsClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    };

    return (
        <div className={cn(
            "grid gap-6",
            colsClasses[cols],
            className
        )}>
            {children}
        </div>
    );
}
