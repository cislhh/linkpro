"use client";

import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";
import { ExternalLink, User } from "lucide-react";
import type { Link, ThemeType } from "@/types";

interface LivePreviewProps {
    /** User display name */
    userName?: string | null;
    /** User bio */
    userBio?: string | null;
    /** User avatar URL */
    userAvatar?: string | null;
    /** Optional className for the container */
    className?: string;
    /** Device mode for preview */
    deviceMode?: "mobile" | "desktop";
}

/**
 * LivePreview Component
 * 
 * Renders a real-time preview of the user's public page.
 * Reads state from Zustand store and updates within 200ms of any change.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function LivePreview({
    userName,
    userBio,
    userAvatar,
    className,
    deviceMode = "mobile",
}: LivePreviewProps) {
    const { links, theme } = useEditorStore();
    // Sort links by order and filter active ones
    const activeLinks = [...links]
        .filter((link) => link.isActive)
        .sort((a, b) => a.order - b.order);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-background shadow-lg",
                deviceMode === "mobile" ? "w-[375px]" : "w-full max-w-2xl",
                className
            )}
        >
            {/* Phone Frame (mobile mode only) */}
            {deviceMode === "mobile" && (
                <div className="absolute inset-x-0 top-0 z-10 flex h-6 items-center justify-center bg-black/5">
                    <div className="h-1.5 w-20 rounded-full bg-black/20" />
                </div>
            )}

            {/* Preview Content */}
            <div
                className={cn(
                    "min-h-[600px] overflow-auto",
                    deviceMode === "mobile" && "pt-6"
                )}
            >
                <ThemeRenderer
                    theme={theme}
                    links={activeLinks}
                    userName={userName}
                    userBio={userBio}
                    userAvatar={userAvatar}
                />
            </div>
        </div>
    );
}


/**
 * ThemeRenderer Component
 * 
 * Renders the preview content with the selected theme styling.
 * This component will be enhanced when theme components are implemented (Task 16).
 */
interface ThemeRendererProps {
    theme: ThemeType;
    links: Link[];
    userName?: string | null;
    userBio?: string | null;
    userAvatar?: string | null;
}

function ThemeRenderer({
    theme,
    links,
    userName,
    userBio,
    userAvatar,
}: ThemeRendererProps) {
    // Theme-specific background styles
    const themeStyles = getThemeStyles(theme);
    return (
        <div
            className={cn(
                "flex min-h-[600px] flex-col items-center px-6 py-12",
                themeStyles.background
            )}
        >
            {/* Profile Section */}
            <div className="mb-8 flex flex-col items-center text-center">
                {/* Avatar */}
                <div
                    className={cn(
                        "mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full",
                        themeStyles.avatar
                    )}
                >
                    {userAvatar ? (
                        <img
                            src={userAvatar}
                            alt={userName || "User avatar"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className={cn("h-12 w-12", themeStyles.avatarIcon)} />
                    )}
                </div>

                {/* Name */}
                <h1 className={cn("text-2xl font-bold", themeStyles.text)}>
                    {userName || "Your Name"}
                </h1>

                {/* Bio */}
                {userBio && (
                    <p className={cn("mt-2 max-w-xs text-sm opacity-80", themeStyles.text)}>
                        {userBio}
                    </p>
                )}
            </div>

            {/* Links Section */}
            <div className="w-full max-w-sm space-y-3">
                {links.length === 0 ? (
                    <div
                        className={cn(
                            "rounded-xl border-2 border-dashed p-6 text-center",
                            themeStyles.emptyState
                        )}
                    >
                        <p className={cn("text-sm opacity-60", themeStyles.text)}>
                            No links yet. Add your first link!
                        </p>
                    </div>
                ) : (
                    links.map((link) => (
                        <LinkButton key={link.id} link={link} theme={theme} />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8">
                <p className={cn("text-xs opacity-50", themeStyles.text)}>
                    Powered by LinkPro
                </p>
            </div>
        </div>
    );
}


/**
 * LinkButton Component
 * 
 * Renders a single link button with theme-specific styling.
 */
interface LinkButtonProps {
    link: Link;
    theme: ThemeType;
}

function LinkButton({ link, theme }: LinkButtonProps) {
    const themeStyles = getThemeStyles(theme);

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-center font-medium transition-all duration-200",
                themeStyles.button,
                themeStyles.buttonHover
            )}
        >
            <span className="truncate">{link.title}</span>
            <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
    );
}

/**
 * Get theme-specific styles
 * 
 * Returns Tailwind classes for each theme type.
 * These will be enhanced when full theme components are implemented (Task 16).
 */
function getThemeStyles(theme: ThemeType) {
    switch (theme) {
        case "aurora":
            return {
                background: "bg-slate-950",
                text: "text-white",
                avatar: "bg-white/10 backdrop-blur-sm ring-2 ring-white/20",
                avatarIcon: "text-white",
                button:
                    "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20",
                buttonHover: "hover:scale-[1.02]",
                emptyState: "border-white/20",
            };
        case "cyber":
            return {
                background: "bg-gray-950",
                text: "text-cyan-400",
                avatar:
                    "bg-gray-900 ring-2 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
                avatarIcon: "text-cyan-400",
                button:
                    "bg-gray-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]",
                buttonHover: "hover:border-cyan-400 hover:text-cyan-300",
                emptyState: "border-cyan-500/30",
            };
        case "glass":
            return {
                background:
                    "bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500",
                text: "text-white",
                avatar: "bg-white/10 backdrop-blur-xl ring-4 ring-white/30",
                avatarIcon: "text-white",
                button:
                    "bg-white/10 backdrop-blur-xl text-white border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
                buttonHover: "hover:bg-white/20 hover:scale-[1.02]",
                emptyState: "border-white/20",
            };
        default:
            return {
                background: "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
                text: "text-white",
                avatar: "bg-white/20 backdrop-blur-sm ring-2 ring-white/30",
                avatarIcon: "text-white",
                button: "bg-white/20 backdrop-blur-sm text-white border border-white/30",
                buttonHover: "hover:bg-white/30 hover:scale-[1.02]",
                emptyState: "border-white/30",
            };
    }
}

// Export for use in other components
export { ThemeRenderer, LinkButton, getThemeStyles };
