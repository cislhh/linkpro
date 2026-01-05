'use client';

import { ThemeProps } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * CyberTheme - 赛博朋克主题
 * 
 * 特点：
 * - 霓虹边框和发光特效
 * - 扫描线动画效果
 * - 赛博朋克风格配色
 * - 60fps 流畅动画
 * 
 * Requirements: 3.5
 */
export function CyberTheme({ links, user, className }: ThemeProps) {
    const activeLinks = links.filter((link) => link.isActive);

    return (
        <div className={cn('relative min-h-screen w-full overflow-hidden bg-black', className)}>
            {/* Cyber Background */}
            <div className="absolute inset-0">
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Animated scan line */}
                <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"
                    animate={{
                        top: ['0%', '100%'],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Glow effects */}
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-md px-4 py-12">
                {/* User Profile Section */}
                <motion.div
                    className="mb-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {user.avatarUrl && (
                        <motion.div
                            className="relative mx-auto mb-4 h-24 w-24"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Neon glow ring */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 blur-md opacity-60" />
                            <img
                                src={user.avatarUrl}
                                alt={user.name || user.username}
                                className="relative h-24 w-24 rounded-full object-cover border-2 border-cyan-400"
                            />
                        </motion.div>
                    )}
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                        {user.name || `@${user.username}`}
                    </h1>
                    {user.bio && (
                        <p className="mt-2 text-sm text-cyan-200/70">{user.bio}</p>
                    )}
                </motion.div>

                {/* Links Section */}
                <div className="space-y-3">
                    {activeLinks.map((link, index) => (
                        <motion.a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block w-full overflow-hidden rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Neon border glow */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />

                            {/* Border */}
                            <div className="absolute inset-[1px] rounded-lg bg-black" />

                            {/* Content */}
                            <div className="relative px-4 py-3 text-center">
                                <span className="flex items-center justify-center gap-2 text-cyan-100 group-hover:text-white transition-colors">
                                    {link.icon && <span>{link.icon}</span>}
                                    <span>{link.title}</span>
                                </span>
                            </div>

                            {/* Hover scan effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100"
                                initial={false}
                                animate={{
                                    x: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />
                        </motion.a>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    className="mt-12 text-center text-xs text-cyan-400/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <span className="font-mono">[ Powered by LinkPro ]</span>
                </motion.div>
            </div>
        </div>
    );
}
