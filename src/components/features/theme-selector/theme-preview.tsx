'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ThemeType } from '@/types';

/**
 * ThemePreview - 主题预览卡片组件
 * 
 * 展示主题的缩略图预览，包含：
 * - 主题名称和描述
 * - 视觉预览缩略图
 * - 选中状态指示
 * 
 * Requirements: 3.1
 */

interface ThemePreviewProps {
    theme: ThemeType;
    isSelected: boolean;
    onClick: () => void;
}

// 主题元数据配置
const themeMetadata: Record<ThemeType, { name: string; description: string }> = {
    aurora: {
        name: 'Aurora',
        description: '极光渐变动效背景',
    },
    cyber: {
        name: 'Cyber',
        description: '霓虹边框发光特效',
    },
    glass: {
        name: 'Glass',
        description: '玻璃拟态 3D 效果',
    },
};

/**
 * Aurora 主题缩略图
 */
function AuroraThumbnail() {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-950">
            {/* Aurora gradient layers */}
            <motion.div
                className="absolute inset-0 opacity-60"
                animate={{
                    background: [
                        'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.4), transparent)',
                        'radial-gradient(ellipse 80% 50% at 60% 40%, rgba(120, 119, 198, 0.4), transparent)',
                        'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.4), transparent)',
                    ],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute inset-0 opacity-50"
                animate={{
                    background: [
                        'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.3), transparent)',
                        'radial-gradient(ellipse 60% 40% at 40% 40%, rgba(74, 222, 128, 0.3), transparent)',
                        'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.3), transparent)',
                    ],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute inset-0 opacity-40"
                animate={{
                    background: [
                        'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.3), transparent)',
                        'radial-gradient(ellipse 70% 60% at 60% 60%, rgba(236, 72, 153, 0.3), transparent)',
                        'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.3), transparent)',
                    ],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            {/* Sample link buttons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <div className="h-2 w-12 rounded-full bg-white/30" />
                <div className="h-4 w-16 rounded-md bg-white/20" />
                <div className="h-4 w-16 rounded-md bg-white/20" />
            </div>
        </div>
    );
}

/**
 * Cyber 主题缩略图
 */
function CyberThumbnail() {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px',
                }}
            />
            {/* Scan line */}
            <motion.div
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                animate={{
                    top: ['0%', '100%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl" />
            <div className="absolute bottom-0 right-1/4 h-16 w-16 rounded-full bg-pink-500/20 blur-xl" />
            {/* Sample link buttons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <div className="h-2 w-12 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500" />
                <div className="h-4 w-16 rounded-md border border-cyan-400/50 bg-transparent" />
                <div className="h-4 w-16 rounded-md border border-cyan-400/50 bg-transparent" />
            </div>
        </div>
    );
}

/**
 * Glass 主题缩略图
 */
function GlassThumbnail() {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500">
            {/* Animated blobs */}
            <motion.div
                className="absolute top-1/4 left-1/4 h-12 w-12 rounded-full bg-blue-400/40 blur-xl"
                animate={{
                    x: [0, 10, 0],
                    y: [0, 5, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 h-12 w-12 rounded-full bg-pink-400/40 blur-xl"
                animate={{
                    x: [0, -5, 0],
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            {/* Sample link buttons */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <div className="h-2 w-12 rounded-full bg-white/50" />
                <div className="h-4 w-16 rounded-md bg-white/20 backdrop-blur-sm border border-white/30" />
                <div className="h-4 w-16 rounded-md bg-white/20 backdrop-blur-sm border border-white/30" />
            </div>
        </div>
    );
}

// 主题缩略图组件映射
const thumbnailComponents: Record<ThemeType, React.ComponentType> = {
    aurora: AuroraThumbnail,
    cyber: CyberThumbnail,
    glass: GlassThumbnail,
};

export function ThemePreview({ theme, isSelected, onClick }: ThemePreviewProps) {
    const metadata = themeMetadata[theme];
    const ThumbnailComponent = thumbnailComponents[theme];

    return (
        <motion.button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative w-full overflow-hidden rounded-xl border-2 bg-card p-4 text-left transition-all',
                'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:border-primary/50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Selected indicator */}
            {isSelected && (
                <motion.div
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </motion.div>
            )}

            {/* Thumbnail preview */}
            <div className="mb-3 h-32 overflow-hidden rounded-lg">
                <ThumbnailComponent />
            </div>

            {/* Theme info */}
            <div>
                <h3 className="font-semibold text-foreground">{metadata.name}</h3>
                <p className="text-sm text-muted-foreground">{metadata.description}</p>
            </div>
        </motion.button>
    );
}
