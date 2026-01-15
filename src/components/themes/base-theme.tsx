'use client';

import { ThemeProps } from '@/types';
import { cn } from '@/lib/utils';
import { Phone, Mail } from 'lucide-react';

/**
 * BaseTheme - 主题组件的基础布局
 *
 * 提供所有主题共享的基础结构：
 * - 用户头像、名称、简介、电话、联系方式
 * - 链接列表渲染
 * - 响应式布局
 *
 * Requirements: 3.1
 */
export function BaseTheme({ links, user, className }: ThemeProps) {
    const activeLinks = links.filter((link) => link.isActive);

    return (
        <div className={cn('min-h-screen w-full', className)}>
            <div className="mx-auto max-w-md px-4 py-12">
                {/* User Profile Section */}
                <div className="mb-8 text-center">
                    {user.avatarUrl && (
                        <img
                            src={user.avatarUrl}
                            alt={user.name || user.username}
                            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                        />
                    )}
                    <h1 className="text-2xl font-bold">
                        {user.name || `@${user.username}`}
                    </h1>
                    {user.bio && (
                        <p className="mt-2 text-sm opacity-80">{user.bio}</p>
                    )}

                    {/* Contact Info */}
                    {(user.phone || user.contact) && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                            {user.phone && (
                                <div className="flex items-center gap-2 text-sm opacity-70">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.contact && (
                                <div className="flex items-center gap-2 text-sm opacity-70">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{user.contact}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                    {activeLinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full rounded-lg bg-white/10 px-4 py-3 text-center backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {link.icon && <span>{link.icon}</span>}
                                <span>{link.title}</span>
                            </span>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs opacity-50">
                    Powered by LinkPro
                </div>
            </div>
        </div>
    );
}
