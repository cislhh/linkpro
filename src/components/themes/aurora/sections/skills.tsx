'use client';

import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SkillsSection - 技能专长章节
 *
 * 背面组件的子章节，展示技能标签云
 */
interface SkillsSectionProps {
  skills?: string[];
  className?: string;
}

export function SkillsSection({ skills, className }: SkillsSectionProps) {
  console.log('[SkillsSection] Received skills:', skills);
  if (!skills || skills.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className={cn('mb-8', className)}>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <Lightbulb className="w-5 h-5" />
        技能专长
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2"
      >
        {skills.map((skill, index) => (
          <motion.span
            key={index}
            variants={itemVariants}
            className="aurora-glass-card px-4 py-2 rounded-full text-white/80 text-sm"
            style={{ fontFamily: 'var(--font-body)' }}
            whileHover={{ scale: 1.05, backgroundColor: 'var(--aurora-glass-bg-hover)' }}
            transition={{ duration: 0.2 }}
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}
