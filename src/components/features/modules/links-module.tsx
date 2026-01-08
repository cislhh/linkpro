"use client";

import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIconById } from "@/lib/icon-dictionary";
import type { Link, LinksModuleData, PageModule } from "@/types";
import { cn } from "@/lib/utils";

interface LinksModuleProps {
    module: PageModule;
    links: Link[];
    className?: string;
    isPreview?: boolean;
}

/**
 * LinksModule Component
 * 
 * Displays a list of social links within a page module.
 * Reuses existing link display patterns from link-item component.
 * 
 * Requirements: 11.1
 */
export function LinksModule({ module, links, className, isPreview = false }: LinksModuleProps) {
    const moduleData = module.data as LinksModuleData;

    // Filter links that belong to this module
    const moduleLinks = links.filter((link) =>
        moduleData.linkIds.includes(link.id) && link.isActive
    );

    // Sort by the order in linkIds array
    const sortedLinks = moduleLinks.sort((a, b) => {
        const indexA = moduleData.linkIds.indexOf(a.id);
        const indexB = moduleData.linkIds.indexOf(b.id);
        return indexA - indexB;
    });

    return (
        <Card className={cn("h-full", className)}>
            {module.title && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(!module.title && "pt-6")}>
                {sortedLinks.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        暂无链接
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedLinks.map((link) => (
                            <LinkCard key={link.id} link={link} isPreview={isPreview} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface LinkCardProps {
    link: Link;
    isPreview?: boolean;
}

function LinkCard({ link, isPreview }: LinkCardProps) {
    const iconDef = link.icon ? getIconById(link.icon) : null;
    const IconComponent = iconDef?.icon || LinkIcon;

    const content = (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
            <div className="flex-shrink-0">
                <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
    );

    if (isPreview) {
        return <div className="cursor-default">{content}</div>;
    }

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            {content}
        </a>
    );
}
