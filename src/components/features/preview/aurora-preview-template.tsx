"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PageModule, Link, LayoutItem, Project } from "@/types";
import { RotateCw } from "lucide-react";

/**
 * AuroraPreviewTemplate Component
 *
 * 双面翻转卡片预览模板 - 完整修复版
 *
 * 修复内容：
 * - 头像距离顶部 15px（安全区域内）
 * - 右上角悬浮按钮翻转
 * - 背景不溢出容器
 * - 背面背景延伸到内容底部
 * - 自定义滚动条样式
 * - 正面内容不足时背景仍填满容器
 * - 背面单一滚动区域（无双重滚动）
 */
interface AuroraPreviewTemplateProps {
  /** Modules to render */
  modules: PageModule[];
  /** Layout configuration */
  layout: LayoutItem[];
  /** User data */
  userName?: string | null;
  userBio?: string | null;
  userAvatar?: string | null;
  userPhone?: string | null;
  userContact?: string | null;
  /** Social links */
  links?: Link[];
  /** Projects data */
  userProjects?: Project[];
  /** Additional className */
  className?: string;
}

export function AuroraPreviewTemplate({
  modules,
  layout,
  userName,
  userBio,
  userAvatar,
  userPhone,
  userContact,
  links = [],
  userProjects = [],
  className,
}: AuroraPreviewTemplateProps) {
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

  // 从模块中提取数据
  const skillsModule = modules.find(m => m.type === "skills");
  const skills = skillsModule?.type === "skills"
    ? (skillsModule.data as { skills: string[] }).skills || []
    : [];

  const activeLinks = links.filter((link) => link.isActive);

  return (
    <div
      className={cn(
        "relative w-full h-full",
        className
      )}
      style={{
        fontFamily: 'var(--font-body)',
      }}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          // 正面 - 最小高度填满容器
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={flipAnimation}
            className="relative w-full min-h-full flex flex-col"
          >
            {/* Aurora 背景 */}
            <AuroraBackground />

            {/* 悬浮翻转按钮 - 右上角 */}
            <motion.button
              onClick={handleFlip}
              className="absolute top-4 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="查看更多信息"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </motion.button>

            {/* 正面内容 - 头像距离顶部 15px，flex-1 确保填满 */}
            <FrontContent
              userName={userName}
              userBio={userBio}
              userAvatar={userAvatar}
              userPhone={userPhone}
              userContact={userContact}
              links={activeLinks}
              skills={skills}
            />
          </motion.div>
        ) : (
          // 背面 - 单一滚动区域
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={flipAnimation}
            className="relative w-full h-full overflow-hidden"
          >
            {/* 背面内容 - 背景内置，单一滚动 */}
            <BackContent
              userName={userName}
              userPhone={userPhone}
              userContact={userContact}
              links={activeLinks}
              skills={skills}
              projects={userProjects}
              onFlip={handleFlip}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * AuroraBackground - 极光动画背景
 * 确保不溢出容器
 */
function AuroraBackground() {
  return (
    <div className="absolute inset-0">
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

/**
 * FrontContent - 正面内容组件
 * 使用 flex 布局确保内容不足时背景仍填满容器
 */
function FrontContent({
  userName,
  userBio,
  userAvatar,
  userPhone,
  userContact,
  links,
  skills,
}: {
  userName?: string | null;
  userBio?: string | null;
  userAvatar?: string | null;
  userPhone?: string | null;
  userContact?: string | null;
  links: Link[];
  skills: string[];
}) {
  // 取前3个链接和技能
  const mainLinks = links.slice(0, 3);
  const skillsPreview = skills.slice(0, 3);

  return (
    <div className="relative z-10 flex-1 flex flex-col px-6 aurora-scrollbar overflow-y-auto" style={{ paddingTop: '55px', paddingBottom: '24px' }}>
      <motion.div
        className="w-full max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* 头像 - 距离顶部 15px */}
        {userAvatar && (
          <motion.div
            className="text-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={userAvatar}
              alt={userName || "用户"}
              className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
            />
          </motion.div>
        )}

        {/* 姓名 */}
        <motion.h1
          className="text-3xl font-bold text-white mb-2 text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {userName || "用户名"}
        </motion.h1>

        {/* 简介 */}
        {userBio && (
          <motion.p
            className="text-sm text-white/70 text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {userBio}
          </motion.p>
        )}

        {/* 技能预览 */}
        {skillsPreview.length > 0 && (
          <motion.div
            className="flex justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {skillsPreview.map((skill: string, index: number) => (
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

        {/* 主要链接 */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {mainLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full min-h-11 px-6 py-4 rounded-2xl text-center text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center justify-center gap-3">
                {link.icon && <span>{link.icon}</span>}
                <span className="font-medium">{link.title}</span>
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* 联系方式 */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {userContact && (
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <span className="text-xs">邮箱:</span>
              <span>{userContact}</span>
            </div>
          )}
          {userPhone && (
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <span className="text-xs">电话:</span>
              <span>{userPhone}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * BackContent - 背面内容组件
 * 单一滚动区域，背景延伸到内容底部
 */
function BackContent({
  userName,
  userPhone,
  userContact,
  links,
  skills,
  projects,
  onFlip,
}: {
  userName?: string | null;
  userPhone?: string | null;
  userContact?: string | null;
  links: Link[];
  skills: string[];
  projects: Project[];
  onFlip: () => void;
}) {
  return (
    <div className="relative h-full flex flex-col">
      {/* Aurora 背景 - 延伸到内容底部 */}
      <div className="absolute inset-0">
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

      {/* 悬浮翻转按钮 - 右上角 */}
      <motion.button
        onClick={onFlip}
        className="absolute top-4 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="返回正面"
      >
        <RotateCw className="w-5 h-5 text-white" />
      </motion.button>

      {/* 单一滚动内容区域 */}
      <div className="relative z-10 flex-1 px-6 pb-12 aurora-scrollbar overflow-y-auto" style={{ paddingTop: '70px' }}>
        {/* 项目作品 */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
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
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {/* 技能专长 */}
        {skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
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
        {links.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              所有链接
            </h2>
            <div className="space-y-3">
              {links.map((link) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full min-h-11 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
        {(userPhone || userContact) && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              联系方式
            </h2>
            <div className="space-y-3">
              {userContact && (
                <motion.a
                  href={`mailto:${userContact}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>✉</span>
                  <span>{userContact}</span>
                </motion.a>
              )}
              {userPhone && (
                <motion.a
                  href={`tel:${userPhone}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white backdrop-blur-md bg-white/10 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>📞</span>
                  <span>{userPhone}</span>
                </motion.a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
