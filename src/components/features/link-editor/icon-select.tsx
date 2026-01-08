"use client";

/**
 * IconSelect Component
 *
 * A dropdown select component for choosing link icons.
 * Displays icon preview and name with animated selection feedback.
 *
 * Requirements: 2.9, 2.10
 * Note: Avoids nested button elements for HTML validity
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ICON_DICTIONARY,
    ICON_CATEGORY_LABELS,
    getIconById,
    type IconDefinition,
    type IconCategory,
} from "@/lib/icon-dictionary";

interface IconSelectProps {
    value: string | null | undefined;
    onChange: (iconId: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
}

/**
 * IconSelect - Dropdown component for selecting link icons
 *
 * Features:
 * - Grouped by category (Chinese social media prioritized)
 * - Icon preview with label
 * - Animated selection feedback
 * - Clear selection option
 */
export function IconSelect({
    value,
    onChange,
    placeholder = "选择图标 (可选)",
    disabled = false,
}: IconSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedIcon = value ? getIconById(value) : null;

    // Group icons by category
    const groupedIcons = ICON_DICTIONARY.reduce(
        (acc, icon) => {
            if (!acc[icon.category]) {
                acc[icon.category] = [];
            }
            acc[icon.category].push(icon);
            return acc;
        },
        {} as Record<IconCategory, IconDefinition[]>
    );

    // Category order (Chinese social media first)
    const categoryOrder: IconCategory[] = [
        "chinese-social",
        "international-social",
        "communication",
        "general",
    ];

    const handleSelect = (iconId: string) => {
        onChange(iconId);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(undefined);
    };

    const handleTriggerClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="relative">
            {/* Trigger - using div with role="combobox" to avoid nested buttons */}
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={handleTriggerClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTriggerClick();
                    }
                }}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
                    "bg-background ring-offset-background cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    disabled && "cursor-not-allowed opacity-50",
                    isOpen && "ring-2 ring-ring ring-offset-2"
                )}
            >
                <div className="flex items-center gap-2">
                    {selectedIcon ? (
                        <>
                            <selectedIcon.icon className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedIcon.labelZh}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {selectedIcon && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    handleClear(e as unknown as React.MouseEvent);
                                }
                            }}
                            className="rounded-sm p-0.5 hover:bg-accent cursor-pointer"
                            aria-label="清除选择"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </div>

            {/* Dropdown Content */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Menu */}
                        <motion.div
                            role="listbox"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                                "absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md",
                                "max-h-[300px] overflow-y-auto"
                            )}
                        >
                            {categoryOrder.map((category) => {
                                const icons = groupedIcons[category];
                                if (!icons || icons.length === 0) return null;

                                return (
                                    <div key={category} className="mb-2 last:mb-0">
                                        {/* Category Label */}
                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                            {ICON_CATEGORY_LABELS[category].zh}
                                        </div>

                                        {/* Icons Grid */}
                                        <div className="grid grid-cols-2 gap-1" role="group">
                                            {icons.map((icon) => (
                                                <IconOption
                                                    key={icon.id}
                                                    icon={icon}
                                                    isSelected={value === icon.id}
                                                    onSelect={() => handleSelect(icon.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Individual icon option with animated selection feedback
 */
interface IconOptionProps {
    icon: IconDefinition;
    isSelected: boolean;
    onSelect: () => void;
}

function IconOption({ icon, isSelected, onSelect }: IconOptionProps) {
    const IconComponent = icon.icon;

    return (
        <motion.div
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect();
                }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                "transition-colors cursor-pointer",
                isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
            )}
        >
            <motion.div
                initial={false}
                animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <IconComponent className="h-4 w-4" />
            </motion.div>
            <span className="truncate">{icon.labelZh}</span>
        </motion.div>
    );
}

export default IconSelect;
