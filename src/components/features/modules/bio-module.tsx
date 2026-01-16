"use client";

import { User, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BioModuleData, PageModule, BioVisibleFields } from "@/types";
import { cn } from "@/lib/utils";

interface UserData {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
}

interface BioModuleProps {
  module: PageModule;
  userData?: UserData;
  className?: string;
}

// Default visibility configuration - all fields visible
const DEFAULT_VISIBLE_FIELDS: BioVisibleFields = {
  name: true,
  bio: true,
  avatar: true,
  phone: true,
  contact: true,
};

/**
 * BioModule Component
 *
 * Displays personal introduction with avatar, name, bio, phone, and contact.
 *
 * Data priority:
 * 1. User table data (if provided via userData prop)
 * 2. Module data (legacy fallback for backward compatibility)
 *
 * Visibility control:
 * - Respects visibleFields config from module data
 * - Falls back to default (all visible) if not configured
 *
 * Requirements: 11.1
 */
export function BioModule({ module, userData, className }: BioModuleProps) {
  const moduleData = module.data as BioModuleData;

  // Get visibility configuration, fallback to defaults
  const visibleFields: BioVisibleFields = {
    ...DEFAULT_VISIBLE_FIELDS,
    ...moduleData?.visibleFields,
  };

  // Use user data if available, otherwise fall back to module data (legacy)
  const name = userData?.name || moduleData?.name || "";
  const bio = userData?.bio || moduleData?.bio || "";
  const avatar = userData?.avatarUrl || moduleData?.avatar || null;
  const phone = userData?.phone || null;
  const contact = userData?.contact || null;

  // Check if any content is visible
  const hasContent = visibleFields.name && name;
  const hasContactInfo = (visibleFields.phone && phone) || (visibleFields.contact && contact);
  const hasBio = visibleFields.bio && bio;

  return (
    <Card className={cn("h-full", className)}>
      {module.title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{module.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex flex-col items-center text-center", !module.title && "pt-6")}>
        {/* Avatar */}
        {visibleFields.avatar && (
          <div className="mb-4">
            {avatar ? (
              <img
                src={avatar}
                alt={name || "用户头像"}
                className="h-24 w-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Name */}
        {hasContent && (
          <h2 className="text-xl font-bold mb-2">{name}</h2>
        )}

        {/* Contact Info */}
        {hasContactInfo && (
          <div className="flex flex-col gap-2 mb-3">
            {visibleFields.phone && phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
            )}
            {visibleFields.contact && contact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{contact}</span>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {hasBio && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-prose">
            {bio}
          </p>
        )}

        {/* Empty state */}
        {!hasContent && !hasContactInfo && !hasBio && (
          <p className="text-muted-foreground text-sm">
            暂无个人简介
          </p>
        )}
      </CardContent>
    </Card>
  );
}
