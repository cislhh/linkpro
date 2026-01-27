"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * PhoneFrame Component
 *
 * iPhone 14 Pro Max frame for mobile preview.
 * Dimensions: 393×852px
 *
 * Features:
 * - Realistic phone frame with Dynamic Island
 * - Safe area considerations
 * - Optional content background
 * - Touch-friendly interactions
 *
 * Accessibility: Cursor pointer on interactive elements
 * Performance: GPU accelerated transforms
 */
interface PhoneFrameProps {
  /** Content to render inside the phone frame */
  children: ReactNode;
  /** Additional className for customization */
  className?: string;
  /** Content background color */
  contentBackground?: string;
  /** Show/hide the notch/Dynamic Island */
  showNotch?: boolean;
  /** Frame variant - default, minimal, or bordered-only */
  variant?: "default" | "minimal" | "bordered-only";
}

export function PhoneFrame({
  children,
  className,
  contentBackground = "#000000",
  showNotch = true,
  variant = "default",
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "relative inline-block",
        // iPhone 14 Pro Max dimensions with scale consideration
        "w-[393px] h-[852px]",
        // Prevent overflow
        "overflow-hidden",
        className
      )}
    >
      {variant === "default" && (
        <>
          {/* Phone Frame - Outer Ring */}
          <div className="absolute inset-0 rounded-[55px] bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-2xl" />

          {/* Phone Inner Frame - Screen Bezel */}
          <div
            className="absolute inset-[12px] rounded-[47px]"
            style={{ backgroundColor: contentBackground }}
          />

          {/* Screen Content Area */}
          <div className="absolute inset-[12px] rounded-[47px] overflow-hidden">
            {children}
          </div>

          {/* Power Button (Right Side) */}
          <div className="absolute right-0 top-[180px] w-[3px] h-[28px] bg-gray-700 rounded-r-sm" />
          <div className="absolute right-0 top-[240px] w-[3px] h-[55px] bg-gray-700 rounded-r-sm" />
          <div className="absolute right-0 top-[320px] w-[3px] h-[55px] bg-gray-700 rounded-r-sm" />

          {/* Volume Buttons (Left Side) */}
          <div className="absolute left-0 top-[180px] w-[3px] h-[55px] bg-gray-700 rounded-l-sm" />
          <div className="absolute left-0 top-[250px] w-[3px] h-[55px] bg-gray-700 rounded-l-sm" />

          {/* Action Button (Left Side, below volume) */}
          <div className="absolute left-0 top-[330px] w-[3px] h-[32px] bg-gray-700 rounded-l-sm" />
        </>
      )}

      {variant === "minimal" && (
        <>
          {/* Minimal Frame - Simple Border */}
          <div className="absolute inset-0 rounded-[40px] border-[8px] border-gray-900 shadow-2xl" />

          {/* Screen Content Area */}
          <div className="absolute inset-[8px] rounded-[32px] overflow-hidden">
            {children}
          </div>
        </>
      )}

      {variant === "bordered-only" && (
        <>
          {/* Bordered Only - No Frame */}
          <div className="absolute inset-0 rounded-[24px] border border-gray-300 dark:border-gray-700 shadow-xl" />

          {/* Screen Content Area */}
          <div className="absolute inset-[1px] rounded-[23px] overflow-hidden">
            {children}
          </div>
        </>
      )}

      {/* Dynamic Island / Notch (Always show when enabled) */}
      {showNotch && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-50",
            // Dynamic Island dimensions and positioning
            "top-[12px]",
            "w-[126px] h-[37px]",
            "rounded-full",
            // Black appearance
            "bg-black",
            // Subtle shadow for depth
            "shadow-lg"
          )}
        >
          {/* Camera lens indicator */}
          <div className="absolute right-[20px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-gray-900/50" />
        </div>
      )}

      {/* Home Indicator (Bottom Safe Area) */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50",
          // Positioned at bottom with safe area
          "bottom-[8px]",
          "w-[134px] h-[5px]",
          "rounded-full",
          // Light color with backdrop
          "bg-white/30",
          "backdrop-blur-sm"
        )}
      />
    </div>
  );
}

/**
 * PhoneFrameContent Component
 *
 * Wrapper for content inside PhoneFrame.
 * Handles safe area insets automatically.
 */
interface PhoneFrameContentProps {
  children: ReactNode;
  /** Additional className for content */
  className?: string;
  /** Padding top to account for Dynamic Island */
  paddingTop?: string;
  /** Padding bottom to account for Home Indicator */
  paddingBottom?: string;
}

export function PhoneFrameContent({
  children,
  className,
  paddingTop = "50px",
  paddingBottom = "24px",
}: PhoneFrameContentProps) {
  return (
    <div
      className={cn(
        // Safe area padding
        "w-full h-full",
        // Scroll behavior
        "overflow-y-auto overflow-x-hidden",
        // Smooth scrolling
        "scroll-smooth",
        // Hide scrollbar but allow scrolling
        "scrollbar-hide",
        className
      )}
      style={{
        paddingTop,
        paddingBottom,
      }}
    >
      {children}
    </div>
  );
}

/**
 * PhoneFrameSkeleton Component
 *
 * Loading skeleton for PhoneFrame.
 */
export function PhoneFrameSkeleton() {
  return (
    <div className="w-[393px] h-[852px] rounded-[55px] bg-gray-100 dark:bg-gray-900 animate-pulse" />
  );
}
