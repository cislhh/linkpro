"use client";

import { cn } from "@/lib/utils";
import { ReactNode, memo } from "react";

// rendering-hoist-jsx: 提取常量避免硬编码
const PHONE_SPECS = {
  WIDTH: 393,
  HEIGHT: 852,
  BEZEL: 12,
  RADIUS: 55,
  INNER_RADIUS: 47,
  DYNAMIC_ISLAND: {
    TOP: 12,
    WIDTH: 126,
    HEIGHT: 37,
  },
  HOME_INDICATOR: {
    BOTTOM: 8,
    WIDTH: 134,
    HEIGHT: 5,
  },
  BUTTONS: {
    WIDTH: 3,
    POSITIONS: {
      POWER_START: 180,
      POWER_MAIN: 240,
      POWER_LOWER: 320,
      VOLUME_UPPER: 180,
      VOLUME_LOWER: 250,
      ACTION: 330,
    },
  },
} as const;

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
        "relative inline-block overflow-hidden",
        className
      )}
      style={{
        width: PHONE_SPECS.WIDTH,
        height: PHONE_SPECS.HEIGHT,
      }}
    >
      {variant === "default" && (
        <>
          {/* Phone Frame - Outer Ring */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-2xl"
            style={{ borderRadius: PHONE_SPECS.RADIUS }}
          />

          {/* Phone Inner Frame - Screen Bezel */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: PHONE_SPECS.BEZEL,
              borderRadius: PHONE_SPECS.INNER_RADIUS,
              backgroundColor: contentBackground,
            }}
          >
            {children}
          </div>

          {/* Power Button (Right Side) */}
          <div
            className="absolute right-0 bg-gray-700 rounded-r-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.POWER_START,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 28,
            }}
          />
          <div
            className="absolute right-0 bg-gray-700 rounded-r-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.POWER_MAIN,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 55,
            }}
          />
          <div
            className="absolute right-0 bg-gray-700 rounded-r-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.POWER_LOWER,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 55,
            }}
          />

          {/* Volume Buttons (Left Side) */}
          <div
            className="absolute left-0 bg-gray-700 rounded-l-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.VOLUME_UPPER,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 55,
            }}
          />
          <div
            className="absolute left-0 bg-gray-700 rounded-l-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.VOLUME_LOWER,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 55,
            }}
          />

          {/* Action Button (Left Side, below volume) */}
          <div
            className="absolute left-0 bg-gray-700 rounded-l-sm"
            style={{
              top: PHONE_SPECS.BUTTONS.POSITIONS.ACTION,
              width: PHONE_SPECS.BUTTONS.WIDTH,
              height: 32,
            }}
          />
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
          className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-black shadow-lg"
          style={{
            top: PHONE_SPECS.DYNAMIC_ISLAND.TOP,
            width: PHONE_SPECS.DYNAMIC_ISLAND.WIDTH,
            height: PHONE_SPECS.DYNAMIC_ISLAND.HEIGHT,
          }}
        >
          {/* Camera lens indicator */}
          <div className="absolute right-[20px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-gray-900/50" />
        </div>
      )}

      {/* Home Indicator (Bottom Safe Area) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/30 backdrop-blur-sm"
        style={{
          bottom: PHONE_SPECS.HOME_INDICATOR.BOTTOM,
          width: PHONE_SPECS.HOME_INDICATOR.WIDTH,
          height: PHONE_SPECS.HOME_INDICATOR.HEIGHT,
        }}
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

// rerender-memo: 使用 memo 避免不必要的重渲染
export const PhoneFrameContent = memo(function PhoneFrameContent({
  children,
  className,
  paddingTop = "50px",
  paddingBottom = "24px",
}: PhoneFrameContentProps) {
  return (
    <div
      className={cn(
        // Safe area padding - fill available space
        "w-full h-full",
        // Only prevent horizontal overflow
        "overflow-x-hidden",
        // Allow inner component to handle scrolling
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
});

/**
 * PhoneFrameSkeleton Component
 *
 * Loading skeleton for PhoneFrame.
 */
export const PhoneFrameSkeleton = memo(function PhoneFrameSkeleton() {
  return (
    <div
      className="rounded-[55px] bg-gray-100 dark:bg-gray-900 animate-pulse"
      style={{
        width: PHONE_SPECS.WIDTH,
        height: PHONE_SPECS.HEIGHT,
      }}
    />
  );
});
