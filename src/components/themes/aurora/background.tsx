'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * AuroraBackground - 极光渐变背景组件
 *
 * 特点：
 * - 多层径向渐变动画
 * - 缓慢的 30s 循环动画（不分散注意力）
 * - 使用 GPU 加速的 opacity 变化
 *
 * Requirements: Aurora 设计规范
 */
interface AuroraBackgroundProps {
  fixed?: boolean;
  className?: string;
}

export function AuroraBackground({ fixed = false, className }: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0',
        fixed && 'fixed',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, var(--aurora-bg-1), var(--aurora-bg-2), var(--aurora-bg-3))',
      }}
    >
      {/* 渐变层 1 - 紫色 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, var(--aurora-accent-1), transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 渐变层 2 - 青色 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 80% 70%, var(--aurora-accent-3), transparent 50%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 渐变层 3 - 粉色 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, var(--aurora-accent-2), transparent 50%)',
        }}
        animate={{
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 噪点纹理 - 增加质感 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
