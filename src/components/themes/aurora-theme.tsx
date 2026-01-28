'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeProps } from '@/types';
import { AuroraBackground, AuroraCardFront, AuroraCardBack } from './aurora';

/**
 * AuroraTheme - 双面翻转卡片主题
 *
 * 核心特性：
 * - 双面卡片系统（正面/背面）
 * - Y 轴 3D 翻转动画（350ms）
 * - 支持减弱动画偏好
 * - 键盘导航支持（Enter/Escape）
 * - 点击按钮翻转
 *
 * Requirements: Aurora 设计规范 - 完整实现
 */
export function AuroraTheme({ links, user, projects, skills, experience, className }: ThemeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 翻转动画配置
  const flipDuration = prefersReducedMotion ? 0 : 0.35;
  const flipAnimation = {
    duration: flipDuration,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  // 处理翻转
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFlipped) {
      setIsFlipped(false);
    }
  };

  return (
    <div
      className={cn(
        'relative w-screen h-screen overflow-hidden',
        className
      )}
      style={{ fontFamily: 'var(--font-body)' }}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          // 正面
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={flipAnimation}
            style={{
              backfaceVisibility: 'hidden',
              position: 'absolute',
              inset: 0,
            }}
          >
            {/* Aurora 背景 */}
            <AuroraBackground />

            {/* 正面内容 */}
            <AuroraCardFront
              user={user}
              links={links}
              skills={skills}
              onFlip={handleFlip}
            />
          </motion.div>
        ) : (
          // 背面
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={flipAnimation}
            style={{
              backfaceVisibility: 'hidden',
              position: 'absolute',
              inset: 0,
            }}
            className="overflow-y-auto overflow-x-hidden"
          >
            {/* Aurora 背景 - 固定 */}
            <AuroraBackground fixed />

            {/* 背面内容 */}
            <AuroraCardBack
              user={user}
              links={links}
              skills={skills}
              projects={projects}
              experience={experience}
              onFlip={handleFlip}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
