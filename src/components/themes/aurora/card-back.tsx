'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeProps } from '@/types';
import { AuroraBackground } from './background';
import { ExperienceSection } from './sections/experience';
import { ProjectsSection } from './sections/projects';
import { SkillsSection } from './sections/skills';
import { ContactSection } from './sections/contact';

/**
 * AuroraCardBack - 背面组件
 *
 * 展示详细信息：
 * - 固定顶部返回提示
 * - 工作经历
 * - 项目作品
 * - 技能专长
 * - 所有链接
 * - 联系方式
 *
 * 布局特点：
 * - overflow-y-auto (可滚动)
 * - overflow-x-hidden
 *
 * Requirements: Aurora 设计规范 - 背面布局
 */
interface AuroraCardBackProps extends Omit<ThemeProps, 'className'> {
  className?: string;
}

export function AuroraCardBack({ links, user, projects, skills, experience, className }: AuroraCardBackProps) {
  // 调试日志
  console.log('[AuroraCardBack] Received props:', {
    skillsCount: skills?.length || 0,
    projectsCount: projects?.length || 0,
    experienceCount: experience?.length || 0
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-y-auto overflow-x-hidden',
        className
      )}
    >
      {/* 极光背景 - 固定定位 */}
      <AuroraBackground fixed />

      {/* 固定顶部返回提示 */}
      <div className="sticky top-0 z-20 aurora-glass-card border-b border-white/10">
        <motion.div
          className="flex items-center justify-center min-h-14 px-6 aurora-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-white/60" />
          <p className="text-sm text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
            双击返回
          </p>
        </motion.div>
      </div>

      {/* 滚动内容区域 */}
      <motion.div
        className="relative z-10 px-6 pb-12 pt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 工作经历 */}
        <ExperienceSection experience={experience} />

        {/* 项目作品 */}
        <ProjectsSection projects={projects} />

        {/* 技能专长 */}
        <SkillsSection skills={skills} />

        {/* 所有链接 + 联系方式 */}
        <ContactSection links={links} user={user} />

        {/* 底部留白 */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
