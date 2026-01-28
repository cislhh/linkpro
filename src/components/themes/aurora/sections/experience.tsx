'use client';

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkExperience } from '@/types';

/**
 * ExperienceSection - 工作经历章节
 *
 * 背面组件的子章节，展示工作经历列表
 */
interface ExperienceSectionProps {
  experience?: WorkExperience[];
  className?: string;
}

export function ExperienceSection({ experience, className }: ExperienceSectionProps) {
  if (!experience || experience.length === 0) {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className={cn('mb-8', className)}>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <Briefcase className="w-5 h-5" />
        工作经历
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {experience.map((exp, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="aurora-glass-card rounded-2xl p-4"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                {exp.position}
              </h3>
              <span className="text-white/50 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                {exp.startDate} - {exp.endDate || '至今'}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'var(--font-body)' }}>
              {exp.company}
            </p>
            {exp.description && (
              <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                {exp.description}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
