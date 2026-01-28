'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Link, ThemeProps } from '@/types';

/**
 * AuroraCardFront - 正面卡片组件
 *
 * 显示内容：
 * - 头像
 * - 姓名（Caveat 字体）
 * - 简介
 * - 技能预览（3个）
 * - 主要链接（3个）
 * - 联系方式
 * - 翻转按钮
 */
interface AuroraCardFrontProps {
  user: ThemeProps['user'];
  links?: Link[];
  skills?: string[];
  onFlip: () => void;
  className?: string;
}

export function AuroraCardFront({ user, links = [], skills = [], onFlip, className }: AuroraCardFrontProps) {
  // 筛选激活的链接，取前3个
  const activeLinks = links.filter((link) => link.isActive).slice(0, 3);
  // 技能预览，取前3个
  const skillsPreview = skills.slice(0, 3);

  return (
    <div className={cn('relative z-10 flex items-center justify-center h-screen px-6', className)}>
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* 头像 */}
        {user.avatarUrl && (
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={user.avatarUrl}
              alt={user.name || user.username}
              className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
            />
          </motion.div>
        )}

        {/* 姓名 */}
        <motion.h1
          className="text-3xl font-bold text-white mb-2 text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {user.name || `@${user.username}`}
        </motion.h1>

        {/* 简介 */}
        {user.bio && (
          <motion.p
            className="text-sm text-white/70 text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {user.bio}
          </motion.p>
        )}

        {/* 技能预览 */}
        {skillsPreview.length > 0 && (
          <motion.div
            className="flex justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {skillsPreview.map((skill: string, index: number) => (
              <div
                key={index}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80 text-sm font-medium border border-white/20"
                title={skill}
              >
                {skill.length <= 2 ? skill.toUpperCase() : skill.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </motion.div>
        )}

        {/* 主要链接 */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {activeLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full min-h-11 px-6 py-4 rounded-2xl text-center text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center justify-center gap-3">
                {link.icon && <span>{link.icon}</span>}
                <span className="font-medium">{link.title}</span>
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* 联系方式 */}
        <motion.div
          className="space-y-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {user.contact && (
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Mail className="w-4 h-4" />
              <span>{user.contact}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Phone className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
          )}
        </motion.div>

        {/* 翻转按钮 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.button
            onClick={onFlip}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="查看更多信息"
          >
            <span className="text-white/80 text-sm">查看更多</span>
            <ArrowRight className="w-4 h-4 text-white/60" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
