'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * 404 Not Found Page - 用户不存在页面
 * 
 * 当访问不存在的用户名时显示此页面
 * 
 * Requirements: 5.5
 */
export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20" />
                <motion.div
                    className="absolute inset-0 opacity-30"
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
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 404 Number */}
                    <motion.h1
                        className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        404
                    </motion.h1>

                    {/* Error Message */}
                    <motion.h2
                        className="mt-4 text-2xl md:text-3xl font-semibold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        用户不存在
                    </motion.h2>

                    <motion.p
                        className="mt-2 text-white/60 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        抱歉，您访问的用户页面不存在。请检查用户名是否正确，或返回首页。
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Link
                            href="/"
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-105"
                        >
                            返回首页
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-all hover:scale-105"
                        >
                            创建账号
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="mt-16 text-xs text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    Powered by LinkPro
                </motion.div>
            </div>
        </div>
    );
}
