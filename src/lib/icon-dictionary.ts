/**
 * Icon Dictionary Configuration
 * 
 * Centralized icon definitions for link icons.
 * Prioritizes Chinese social media platforms while including international platforms.
 * 
 * Requirements: 2.9
 */

import {
  // Chinese Social Media
  MessageCircle, // WeChat
  Tv, // Bilibili
  BookOpen, // Zhihu
  Camera, // Xiaohongshu
  Music, // Douyin/TikTok
  Newspaper, // Weibo
  
  // International Platforms
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Twitch,
  
  // General
  Globe,
  Mail,
  Link,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  Coffee,
  Heart,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon definition with metadata
 */
export interface IconDefinition {
  id: string;
  icon: LucideIcon;
  label: string;
  labelZh: string;
  category: IconCategory;
}

/**
 * Icon categories for grouping
 */
export type IconCategory = 
  | "chinese-social"
  | "international-social"
  | "communication"
  | "general";

/**
 * Category labels for display
 */
export const ICON_CATEGORY_LABELS: Record<IconCategory, { en: string; zh: string }> = {
  "chinese-social": { en: "Chinese Social Media", zh: "国内社交媒体" },
  "international-social": { en: "International Platforms", zh: "国际平台" },
  "communication": { en: "Communication", zh: "联系方式" },
  "general": { en: "General", zh: "通用" },
};

/**
 * Complete icon dictionary
 * Organized by category with Chinese platforms prioritized
 */
export const ICON_DICTIONARY: IconDefinition[] = [
  // Chinese Social Media (prioritized)
  { id: "wechat", icon: MessageCircle, label: "WeChat", labelZh: "微信", category: "chinese-social" },
  { id: "weibo", icon: Newspaper, label: "Weibo", labelZh: "微博", category: "chinese-social" },
  { id: "douyin", icon: Music, label: "Douyin/TikTok", labelZh: "抖音", category: "chinese-social" },
  { id: "xiaohongshu", icon: Camera, label: "Xiaohongshu", labelZh: "小红书", category: "chinese-social" },
  { id: "bilibili", icon: Tv, label: "Bilibili", labelZh: "B站", category: "chinese-social" },
  { id: "zhihu", icon: BookOpen, label: "Zhihu", labelZh: "知乎", category: "chinese-social" },
  
  // International Social Platforms
  { id: "github", icon: Github, label: "GitHub", labelZh: "GitHub", category: "international-social" },
  { id: "twitter", icon: Twitter, label: "Twitter/X", labelZh: "推特", category: "international-social" },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", labelZh: "领英", category: "international-social" },
  { id: "instagram", icon: Instagram, label: "Instagram", labelZh: "Instagram", category: "international-social" },
  { id: "youtube", icon: Youtube, label: "YouTube", labelZh: "YouTube", category: "international-social" },
  { id: "facebook", icon: Facebook, label: "Facebook", labelZh: "脸书", category: "international-social" },
  { id: "twitch", icon: Twitch, label: "Twitch", labelZh: "Twitch", category: "international-social" },
  
  // Communication
  { id: "mail", icon: Mail, label: "Email", labelZh: "邮箱", category: "communication" },
  { id: "phone", icon: Phone, label: "Phone", labelZh: "电话", category: "communication" },
  { id: "location", icon: MapPin, label: "Location", labelZh: "位置", category: "communication" },
  
  // General
  { id: "globe", icon: Globe, label: "Website", labelZh: "网站", category: "general" },
  { id: "link", icon: Link, label: "Link", labelZh: "链接", category: "general" },
  { id: "blog", icon: FileText, label: "Blog", labelZh: "博客", category: "general" },
  { id: "portfolio", icon: Briefcase, label: "Portfolio", labelZh: "作品集", category: "general" },
  { id: "education", icon: GraduationCap, label: "Education", labelZh: "教育", category: "general" },
  { id: "coffee", icon: Coffee, label: "Buy Me Coffee", labelZh: "请我喝咖啡", category: "general" },
  { id: "donate", icon: Heart, label: "Donate", labelZh: "赞助", category: "general" },
  { id: "featured", icon: Star, label: "Featured", labelZh: "精选", category: "general" },
  { id: "special", icon: Sparkles, label: "Special", labelZh: "特别", category: "general" },
];

/**
 * Get icon definition by ID
 */
export function getIconById(id: string): IconDefinition | undefined {
  return ICON_DICTIONARY.find((icon) => icon.id === id);
}

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): IconDefinition[] {
  return ICON_DICTIONARY.filter((icon) => icon.category === category);
}

/**
 * Get all icon IDs (for validation)
 */
export function getAllIconIds(): string[] {
  return ICON_DICTIONARY.map((icon) => icon.id);
}

/**
 * Check if an icon ID is valid
 */
export function isValidIconId(id: string): boolean {
  return ICON_DICTIONARY.some((icon) => icon.id === id);
}
