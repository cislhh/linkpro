'use client';

import { ThemeProps } from '@/types';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

/**
 * GlassTheme - 玻璃拟态主题
 * 
 * 特点：
 * - 背景模糊效果 (backdrop-filter)
 * - 3D 倾斜效果 (transform)
 * - 玻璃质感卡片
 * - 60fps 流畅动画
 * 
 * Requirements: 3.6
 */

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    href?: string;
}

function TiltCard({ children, className, href }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 300, damping: 30 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        x.set((e.clientX - centerX) / rect.width);
        y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const content = (
        <motion.div
            ref={ref}
            className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-white/10 backdrop-blur-xl',
                'border border-white/20',
                'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
                className
            )}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Glass highlight */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Content */}
            <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </motion.div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        );
    }

    return content;
}

export function GlassTheme({ links, user, className }: ThemeProps) {
    const activeLinks = links.filter((link) => link.isActive);

    return (
        <div className={cn('relative min-h-screen w-full overflow-hidden', className)}>
            {/* Gradient Background */}
            <div className="absolute inset-0">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500" />

                {/* Animated blobs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-400/30 blur-[80px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-400/30 blur-[80px]"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/20 blur-[60px]"
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-md px-4 py-12">
                {/* User Profile Section */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <TiltCard className="p-6 text-center">
                        {user.avatarUrl && (
                            <motion.img
                                src={user.avatarUrl}
                                alt={user.name || user.username}
                                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-white/30"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        )}
                        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                            {user.name || `@${user.username}`}
                        </h1>
                        {user.bio && (
                            <p className="mt-2 text-sm text-white/80">{user.bio}</p>
                        )}
                    </TiltCard>
                </motion.div>

                {/* Links Section */}
                <div className="space-y-3">
                    {activeLinks.map((link, index) => (
                        <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                            <TiltCard href={link.url} className="px-4 py-3">
                                <span className="flex items-center justify-center gap-2 text-white">
                                    {link.icon && <span>{link.icon}</span>}
                                    <span>{link.title}</span>
                                </span>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    className="mt-12 text-center text-xs text-white/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    Powered by LinkPro
                </motion.div>
            </div>
        </div>
    );
}
