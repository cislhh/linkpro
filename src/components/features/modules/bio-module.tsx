"use client";

import { User, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BioModuleData, PageModule } from "@/types";
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

/**
 * BioModule Component
 *
 * Displays personal introduction with avatar, name, bio, phone, and contact.
 *
 * Data priority:
 * 1. User table data (if provided via userData prop)
 * 2. Module data (legacy fallback for backward compatibility)
 *
 * Requirements: 11.1
 */
export function BioModule({ module, userData, className }: BioModuleProps) {
  // Use user data if available, otherwise fall back to module data (legacy)
  const name = userData?.name || (module.data as BioModuleData)?.name || "";
  const bio = userData?.bio || (module.data as BioModuleData)?.bio || "";
  const avatar = userData?.avatarUrl || (module.data as BioModuleData)?.avatar || null;
  const phone = userData?.phone || null;
  const contact = userData?.contact || null;

  return (
    <Card className={cn("h-full", className)}>
      {module.title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{module.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex flex-col items-center text-center", !module.title && "pt-6")}>
        {/* Avatar */}
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

        {/* Name */}
        {name && (
          <h2 className="text-xl font-bold mb-2">{name}</h2>
        )}

        {/* Contact Info */}
        {(phone || contact) && (
          <div className="flex flex-col gap-2 mb-3">
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
            )}
            {contact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{contact}</span>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-prose">
            {bio}
          </p>
        )}

        {/* Empty state */}
        {!name && !bio && !phone && !contact && (
          <p className="text-muted-foreground text-sm">
            暂无个人简介
          </p>
        )}
      </CardContent>
    </Card>
  );
}
