'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, ArrowLeft, Briefcase, Rocket, Lightbulb, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Link, Project, WorkExperience, ThemeProps } from '@/types';

/**
 * AuroraCardBack - 背面卡片组件
 *
 * 显示内容：
 * - 固定顶部返回按钮
 * - 工作经历
 * - 项目作品（2列网格）
 * - 技能专长（全部）
 * - 所有链接
 * - 联系方式
 */
interface AuroraCardBackProps {
  user: ThemeProps['user'];
  links?: Link[];
  skills?: string[];
  projects?: Project[];
  experience?: WorkExperience[];
  onFlip: () => void;
  className?: string;
}

export function AuroraCardBack({
  user,
  links = [],
  skills = [],
  projects = [],
  experience = [],
  onFlip,
  className
}: AuroraCardBackProps) {
  // 筛选激活的链接
  const activeLinks = links.filter((link) => link.isActive);

  return (
    <div className={cn('relative', className)}>
      {/* 固定顶部返回按钮 */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="flex items-center justify-center min-h-14 px-6">
          <motion.button
            onClick={onFlip}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="返回正面"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </motion.button>
        </div>
      </div>

      {/* 滚动内容区域 */}
      <div className="relative z-10 px-6 pb-12 pt-4">
        {/* 工作经历 */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Briefcase className="w-5 h-5" />
              工作经历
            </h2>
            <div className="space-y-3">
              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-semibold">{exp.position}</h3>
                    <span className="text-white/50 text-xs">{exp.startDate} - {exp.endDate || '至今'}</span>
                  </div>
                  <p className="text-white/70 text-sm mb-1">{exp.company}</p>
                  {exp.description && (
                    <p className="text-white/50 text-sm">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 项目作品 */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Rocket className="w-5 h-5" />
              项目作品
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {projects.map((project, index) => (
                <motion.a
                  key={project.id || index}
                  href={project.url || '#'}
                  target={project.url ? '_blank' : undefined}
                  rel={project.url ? 'noopener noreferrer' : undefined}
                  className="rounded-2xl p-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {project.imageUrl && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-white/5">
                      <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="text-white text-sm font-semibold mb-1 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-white/50 text-xs line-clamp-2">{project.description}</p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {/* 技能专长 */}
        {skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Lightbulb className="w-5 h-5" />
              技能专长
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/15"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </section>
        )}

        {/* 所有链接 */}
        {activeLinks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Globe className="w-5 h-5" />
              所有链接
            </h2>
            <div className="space-y-3">
              {activeLinks.map((link) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full min-h-11 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    {link.icon && <span>{link.icon}</span>}
                    <span className="font-medium">{link.title}</span>
                  </span>
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {/* 联系方式 */}
        {(user.phone || user.contact) && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              联系方式
            </h2>
            <div className="space-y-3">
              {user.contact && (
                <motion.a
                  href={`mailto:${user.contact}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  <span>{user.contact}</span>
                </motion.a>
              )}
              {user.phone && (
                <motion.a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-5 h-5" />
                  <span>{user.phone}</span>
                </motion.a>
              )}
            </div>
          </section>
        )}

        {/* 底部留白 */}
        <div className="h-8" />
      </div>
    </div>
  );
}
