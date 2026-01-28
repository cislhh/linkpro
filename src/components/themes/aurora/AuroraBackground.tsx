'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * AuroraBackground - 极光动画背景
 *
 * 三层动态渐变效果：
 * - 紫色 (#A855F7) - 8秒循环
 * - 青色 (#14B8A6) - 10秒循环
 * - 粉色 (#EC4899) - 12秒循环
 *
 * 主背景：linear-gradient(135deg, #0F172A, #581C87, #4A5568)
 */
interface AuroraBackgroundProps {
  className?: string;
  fixed?: boolean; // 是否固定定位（用于背面滚动）
}

export function AuroraBackground({ className, fixed = false }: AuroraBackgroundProps) {
  return (
    <div
      className={cn('absolute inset-0', className)}
      style={fixed ? { position: 'fixed' } : undefined}
    >
      {/* 主背景渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0F172A, #581C87, #4A5568)',
        }}
      />

      {/* 第一层 - 紫色光晕 */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 20% 30%, #A855F7, transparent 50%)' }}
      />

      {/* 第二层 - 青色光晕 */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 80% 70%, #14B8A6, transparent 50%)' }}
      />

      {/* 第三层 - 粉色光晕 */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 50% 50%, #EC4899, transparent 50%)' }}
      />
    </div>
  );
}
