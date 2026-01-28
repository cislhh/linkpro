'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Link } from '@/types';

/**
 * ContactSection - 联系方式章节
 *
 * 背面组件的子章节，展示完整链接列表和联系方式
 */
interface ContactSectionProps {
  links: Link[];
  user: {
    phone?: string | null;
    contact?: string | null;
  };
  className?: string;
}

export function ContactSection({ links, user, className }: ContactSectionProps) {
  const activeLinks = links.filter((link) => link.isActive);

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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section className={cn('mb-8', className)}>
      {/* 所有链接 */}
      {activeLinks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Globe className="w-5 h-5" />
            所有链接
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {activeLinks.map((link) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                className="aurora-glass-card block w-full min-h-11 px-6 py-4 rounded-2xl text-white aurora-focus-ring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3">
                  {link.icon && <span>{link.icon}</span>}
                  <span className="font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                    {link.title}
                  </span>
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      )}

      {/* 联系方式 */}
      {(user.phone || user.contact) && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            联系方式
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {user.phone && (
              <motion.a
                href={`tel:${user.phone}`}
                variants={itemVariants}
                className="aurora-glass-card flex items-center gap-3 px-6 py-4 rounded-2xl text-white aurora-focus-ring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5" />
                <span style={{ fontFamily: 'var(--font-body)' }}>{user.phone}</span>
              </motion.a>
            )}

            {user.contact && (
              <motion.a
                href={`mailto:${user.contact}`}
                variants={itemVariants}
                className="aurora-glass-card flex items-center gap-3 px-6 py-4 rounded-2xl text-white aurora-focus-ring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5" />
                <span style={{ fontFamily: 'var(--font-body)' }}>{user.contact}</span>
              </motion.a>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
