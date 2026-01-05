'use client';

import { ThemeProps } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * AuroraTheme - 极光主题
 * 
 * 特点：
 * - 动画渐变背景效果（极光效果）
 * - 柔和的颜色过渡
 * - 60fps 流畅动画
 * 
 * Requirements: 3.4
 */
export function AuroraTheme({ links, user, className }: ThemeProps) {
    const activeLinks = links.filter((link) => link.isActive);

    return (
        <div className={cn('relative min-h-screen w-full overflow-hidden', className)}>
            {/* Aurora Background */}
            <div className="absolute inset-0 bg-slate-950">
                {/* Aurora gradient layers */}
                <motion.div
                    className="absolute inset-0 opacity-50"
                    animate={{
                        background: [
                            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.3), transparent)',
                            'radial-gradient(ellipse 80% 50% at 60% 40%, rgba(120, 119, 198, 0.3), transparent)',
                            'radial-gradient(ellipse 80% 50% at 40% 60%, rgba(120, 119, 198, 0.3), transparent)',
                            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.3), transparent)',
                        ],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute inset-0 opacity-50"
                    animate={{
                        background: [
                            'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.2), transparent)',
                            'radial-gradient(ellipse 60% 40% at 40% 40%, rgba(74, 222, 128, 0.2), transparent)',
                            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(74, 222, 128, 0.2), transparent)',
                            'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.2), transparent)',
                        ],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute inset-0 opacity-40"
                    animate={{
                        background: [
                            'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.2), transparent)',
                            'radial-gradient(ellipse 70% 60% at 60% 60%, rgba(236, 72, 153, 0.2), transparent)',
                            'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(236, 72, 153, 0.2), transparent)',
                            'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.2), transparent)',
                        ],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                {/* Subtle noise overlay for texture */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
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
                        <motion.img
                            src={user.avatarUrl}
                            alt={user.name || user.username}
                            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-white/20"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    )}
                    <h1 className="text-2xl font-bold text-white">
                        {user.name || `@${user.username}`}
                    </h1>
                    {user.bio && (
                        <p className="mt-2 text-sm text-white/70">{user.bio}</p>
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
                            className="block w-full rounded-xl bg-white/10 px-4 py-3 text-center text-white backdrop-blur-md transition-colors hover:bg-white/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {link.icon && <span>{link.icon}</span>}
                                <span>{link.title}</span>
                            </span>
                        </motion.a>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    className="mt-12 text-center text-xs text-white/40"
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
