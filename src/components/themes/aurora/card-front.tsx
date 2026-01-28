'use client';

import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeProps, Project, WorkExperience } from '@/types';
import { AuroraBackground } from './background';

/**
 * AuroraCardFront - 正面组件
 *
 * 展示核心信息：
 * - 头像 (80x80px, 圆形, ring-4)
 * - 姓名 (text-2xl, bold, 白色)
 * - 简介 (text-sm, text-white/70)
 * - 技能预览 (最多3个图标)
 * - 主要链接 (最多3个, 毛玻璃卡片)
 * - 联系方式预览
 * - 翻转提示 (脉冲动画)
 *
 * Requirements: Aurora 设计规范 - 正面布局
 */
interface AuroraCardFrontProps extends Omit<ThemeProps, 'className'> {
  className?: string;
}

export function AuroraCardFront({ links, user, projects, skills, experience, className }: AuroraCardFrontProps) {
  // 调试日志
  console.log('[AuroraCardFront] Received props:', {
    skillsCount: skills?.length || 0,
    projectsCount: projects?.length || 0,
    skills,
    projects
  });

  const activeLinks = links.filter((link) => link.isActive);
  const mainLinks = activeLinks.slice(0, 3); // 最多显示3个主要链接
  const skillsList = skills?.slice(0, 3) || []; // 最多显示3个技能

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        className
      )}
    >
      {/* 极光背景 */}
      <AuroraBackground />

      {/* 内容区域 - 居中卡片 */}
      <div className="relative z-10 flex items-center justify-center h-screen px-6">
        <motion.div
          className="w-full max-w-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 头像 */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            {user.avatarUrl && (
              <motion.img
                src={user.avatarUrl}
                alt={user.name || user.username}
                className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>

          {/* 姓名和简介 */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {user.name || `@${user.username}`}
            </h1>
            {user.bio && (
              <p className="text-sm text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
                {user.bio}
              </p>
            )}
          </motion.div>

          {/* 技能预览 - 显示技能图标或首字母 */}
          {skillsList.length > 0 && (
            <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-6">
              {skillsList.map((skill: string, index: number) => (
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

          {/* 主要链接 - 阻止双击事件冒泡 */}
          <motion.div variants={itemVariants} className="space-y-3 mb-6">
            {mainLinks.map((link) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-glass-card block w-full min-h-11 px-6 py-4 rounded-2xl text-center text-white aurora-focus-ring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onDoubleClick={(e) => e.stopPropagation()} // 阻止双击链接时翻转
              >
                <span className="flex items-center justify-center gap-3">
                  {link.icon && <span>{link.icon}</span>}
                  <span className="font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                    {link.title}
                  </span>
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* 联系方式预览 */}
          <motion.div variants={itemVariants} className="space-y-2 mb-8">
            {user.contact && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4" />
                <span style={{ fontFamily: 'var(--font-body)' }}>{user.contact}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4" />
                <span style={{ fontFamily: 'var(--font-body)' }}>{user.phone}</span>
              </div>
            )}
          </motion.div>

          {/* 翻转提示 */}
          <motion.div
            variants={itemVariants}
            className="text-center aurora-pulse"
          >
            <p className="text-sm text-white/50" style={{ fontFamily: 'var(--font-body)' }}>
              « 双击查看更多 »
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
