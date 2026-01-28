'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

/**
 * ProjectsSection - 项目作品章节
 *
 * 背面组件的子章节，展示项目作品网格
 */
interface ProjectsSectionProps {
  projects?: Project[];
  className?: string;
}

export function ProjectsSection({ projects, className }: ProjectsSectionProps) {
  console.log('[ProjectsSection] Received projects:', projects);
  if (!projects || projects.length === 0) {
    return null;
  }

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className={cn('mb-8', className)}>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <Rocket className="w-5 h-5" />
        项目作品
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {projects.map((project) => (
          <motion.a
            key={project.id}
            href={project.url || '#'}
            target={project.url ? '_blank' : undefined}
            rel={project.url ? 'noopener noreferrer' : undefined}
            variants={itemVariants}
            className="aurora-glass-card rounded-2xl p-3 aurora-focus-ring cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 项目缩略图 */}
            {project.imageUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-white/5">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 项目名称 */}
            <h3 className="text-white text-sm font-semibold mb-1 truncate" style={{ fontFamily: 'var(--font-body)' }}>
              {project.name}
            </h3>

            {/* 项目描述 */}
            {project.description && (
              <p className="text-white/50 text-xs line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>
                {project.description}
              </p>
            )}

            {/* 项目标签 */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
