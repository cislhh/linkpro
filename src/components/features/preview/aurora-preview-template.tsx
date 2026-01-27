"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { PageModule, Link, LayoutItem, Project } from "@/types";
import { Sparkle, Github, Twitter, Linkedin, Instagram, Globe, Mail, Phone } from "lucide-react";

/**
 * AuroraPreviewTemplate Component
 *
 * Complete Aurora theme preview template with seamless design.
 * Renders rich styled content based on layout structure.
 *
 * Design System (from ui-ux-pro-max):
 * - Style: Aurora/Motion-Driven with mesh gradients
 * - Colors: Cyan #00FFFF, Magenta #FF00FF, Blue #0066FF, Green #00FF66
 * - Animation: 8-12s smooth gradient flow, entrance animations
 * - Typography: Friendly, readable, good contrast
 * - Layout: Seamless business card style, no hard module boundaries
 * - Accessibility: 4.5:1 contrast minimum, reduced-motion support
 *
 * Features:
 * - Animated aurora background
 * - Smooth entrance animations
 * - Seamless module rendering (no card boundaries)
 * - Unified glassmorphism container
 * - Business card/Resume aesthetic
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
  // Create a map of layout items by module ID
  const layoutMap = new Map(layout.map((item) => [item.i, item]));

  // Grid configuration: MUST MATCH layout editor (layout-grid.tsx)
  // From layout editor: cols=2, rowHeight=80, margin=[16,16]
  const cols = 2;
  const rowHeight = 80;  // Must match LayoutGrid rowHeight
  const gap = 16;        // Must match LayoutGrid margin [16, 16]

  // Calculate the maximum row
  let maxRow = 0;
  layout.forEach((item) => {
    const endRow = item.y + item.h;
    if (endRow > maxRow) maxRow = endRow;
  });

  // Group modules by type for cohesive rendering
  const bioModule = modules.find(m => m.type === "bio");
  const linksModule = modules.find(m => m.type === "links");
  const skillsModule = modules.find(m => m.type === "skills");
  const projectsModule = modules.find(m => m.type === "projects");

  return (
    <div
      className={cn(
        "relative min-h-full w-full",
        "overflow-hidden",
        className
      )}
    >
      {/* Aurora Background - Animated mesh gradient */}
      <AuroraBackground />

      {/* Unified Glassmorphism Container - Business Card Style */}
      <div className="relative z-10 px-3 pb-3 pt-3">
        <motion.div
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Content Grid - Seamless Layout */}
          <div
            className="p-4"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridAutoRows: `${rowHeight}px`,
              gap: `${gap}px`,
              minHeight: maxRow * rowHeight + (maxRow - 1) * gap,
            }}
          >
            {modules.length === 0 ? (
              // Empty state
              <div
                className="col-span-2 flex flex-col items-center justify-center py-12"
                style={{ minHeight: "300px" }}
              >
                <Sparkle className="h-16 w-16 text-white/20 mb-4" />
                <p className="text-white/60 text-sm">暂无模块内容</p>
                <p className="text-white/40 text-xs mt-2">请先在页面管理中添加模块</p>
              </div>
            ) : (
              modules.map((module, index) => {
                const layoutItem = layoutMap.get(module.id);
                if (!layoutItem) return null;

                return (
                  <motion.div
                    key={module.id}
                    style={{
                      gridColumn: `${layoutItem.x + 1} / span ${layoutItem.w}`,
                      gridRow: `${layoutItem.y + 1} / span ${layoutItem.h}`,
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  >
                    <SeamlessModuleContent
                      module={module}
                      links={links}
                      userProjects={userProjects}
                      userName={userName}
                      userBio={userBio}
                      userAvatar={userAvatar}
                      userPhone={userPhone}
                      userContact={userContact}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="relative z-10 py-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-xs text-white/30 font-medium">
          Powered by LinkPro
        </p>
      </motion.div>
    </div>
  );
}

/**
 * AuroraBackground Component
 *
 * Animated aurora/mesh gradient background.
 * Uses multiple gradient layers for depth.
 */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 bg-slate-950">
      {/* Layer 1 - Purple/Blue gradient */}
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.4), transparent)',
            'radial-gradient(ellipse 80% 50% at 60% 40%, rgba(120, 119, 198, 0.4), transparent)',
            'radial-gradient(ellipse 80% 50% at 40% 60%, rgba(120, 119, 198, 0.4), transparent)',
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 119, 198, 0.4), transparent)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Layer 2 - Green/Cyan gradient */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.3), transparent)',
            'radial-gradient(ellipse 60% 40% at 40% 40%, rgba(74, 222, 128, 0.3), transparent)',
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(74, 222, 128, 0.3), transparent)',
            'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(74, 222, 128, 0.3), transparent)',
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Layer 3 - Pink/Magenta gradient */}
      <motion.div
        className="absolute inset-0 opacity-35"
        animate={{
          background: [
            'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.25), transparent)',
            'radial-gradient(ellipse 70% 60% at 60% 60%, rgba(236, 72, 153, 0.25), transparent)',
            'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(236, 72, 153, 0.25), transparent)',
            'radial-gradient(ellipse 70% 60% at 70% 70%, rgba(236, 72, 153, 0.25), transparent)',
          ],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
    </div>
  );
}

/**
 * SeamlessModuleContent Component
 *
 * Renders module content without card boundaries.
 * Content blends seamlessly into the unified container.
 */
interface SeamlessModuleContentProps {
  module: PageModule;
  links?: Link[];
  userProjects?: Project[];
  userName?: string | null;
  userBio?: string | null;
  userAvatar?: string | null;
  userPhone?: string | null;
  userContact?: string | null;
}

function SeamlessModuleContent({
  module,
  links = [],
  userProjects = [],
  userName,
  userBio,
  userAvatar,
  userPhone,
  userContact,
}: SeamlessModuleContentProps) {
  switch (module.type) {
    case "bio":
      return <BioModule userName={userName} userBio={userBio} userAvatar={userAvatar} />;

    case "links":
      return <LinksModule links={links} />;

    case "skills":
      return <SkillsModule module={module} />;

    case "projects":
      return <ProjectsModule projects={userProjects} />;

    default:
      return null;
  }
}

/**
 * BioModule - User profile section (seamless)
 */
function BioModule({
  userName,
  userBio,
  userAvatar,
}: {
  userName?: string | null;
  userBio?: string | null;
  userAvatar?: string | null;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {userAvatar ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
            <img
              src={userAvatar}
              alt={userName || "Avatar"}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/20 to-purple-400/20 blur-xl -z-10" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center ring-1 ring-white/10"
        >
          <Sparkle className="h-10 w-10 text-white/50" />
        </motion.div>
      )}

      {userName && (
        <motion.h3
          className="text-xl font-bold text-white mt-3 mb-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {userName}
        </motion.h3>
      )}

      {userBio && (
        <motion.p
          className="text-sm text-white/60 leading-relaxed px-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {userBio}
        </motion.p>
      )}
    </div>
  );
}

/**
 * LinksModule - Social links section (seamless)
 */
function LinksModule({
  links,
}: {
  links?: Link[];
}) {
  const activeLinks = links?.filter((link) => link.isActive) || [];

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      github: <Github className="h-4 w-4" />,
      twitter: <Twitter className="h-4 w-4" />,
      linkedin: <Linkedin className="h-4 w-4" />,
      instagram: <Instagram className="h-4 w-4" />,
      globe: <Globe className="h-4 w-4" />,
      mail: <Mail className="h-4 w-4" />,
      phone: <Phone className="h-4 w-4" />,
    };
    return icons[iconName] || <Globe className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex flex-col justify-center gap-2">
      {activeLinks.map((link, index) => (
        <motion.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/5 hover:border-white/10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          {link.icon && (
            <span className="text-white/60 group-hover:text-cyan-400 transition-colors duration-300">
              {getIcon(link.icon)}
            </span>
          )}
          <span className="text-sm text-white/80 group-hover:text-white font-medium transition-colors duration-300 flex-1">
            {link.title}
          </span>
          <span className="text-white/30 group-hover:text-white/50 transition-colors duration-300">
            <Globe className="h-3 w-3" />
          </span>
        </motion.a>
      ))}
    </div>
  );
}

/**
 * SkillsModule - Skills tags section (seamless)
 */
function SkillsModule({
  module,
}: {
  module: PageModule;
}) {
  const skills = module.type === "skills" ? (module.data as { skills: string[] }).skills || [] : [];

  return (
    <div className="h-full flex flex-wrap items-center justify-center gap-2 content-center">
      {skills.map((skill: string, index: number) => (
        <motion.span
          key={index}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/5 hover:border-white/10 transition-all duration-300 cursor-default"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: index * 0.04 }}
          whileHover={{ scale: 1.05 }}
        >
          {skill}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * ProjectsModule - Projects showcase section (seamless)
 */
function ProjectsModule({
  projects,
}: {
  projects?: Project[];
}) {
  const displayProjects = projects || [];

  return (
    <div className="h-full flex flex-col justify-center gap-2">
      {displayProjects.map((project, index) => (
        <motion.div
          key={project.id || index}
          className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkle className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300">
                {project.name}
              </h4>
              {project.description && (
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              )}
              {project.url && (
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400/70 hover:text-cyan-400 mt-2 inline-flex items-center gap-1 transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  查看项目
                  <Globe className="h-3 w-3" />
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
