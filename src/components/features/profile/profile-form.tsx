"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/actions/user-actions";
import { uploadAvatar } from "@/actions/upload-actions";
import { AVATAR_SPEC } from "@/lib/constants";
import { updateProfileSchema } from "@/lib/validations";
import { useUserStore } from "@/stores/user-store";
import type { UpdateProfileInput } from "@/lib/validations";

// Form schema with phone and contact validation
const profileFormSchema = updateProfileSchema.extend({
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]*$/, "电话号码格式无效")
    .max(50, "电话号码过长")
    .optional()
    .or(z.literal("")),
  contact: z.string().max(200, "联系方式过长").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
}

/**
 * ProfileForm Component
 *
 * Editable profile form with phone, contact, and avatar upload.
 * Uses React Hook Form with Zod validation.
 *
 * Requirements: Profile editing with avatar upload
 */
export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = useUserStore((state) => state.profile);
  const setUserProfile = useUserStore((state) => state.setUserProfile);

  useEffect(() => {
    setAvatarPreview(profile.avatarUrl);
  }, [profile.avatarUrl]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      phone: "",
      contact: "",
    },
    values: {
      name: profile.name || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      phone: profile.phone || "",
      contact: profile.contact || "",
    },
    mode: "onBlur",
  });

  const handleAvatarUpload = async (file: File) => {
    // Validate file size
    if (file.size > AVATAR_SPEC.maxSize) {
      toast.error("文件过大", {
        description: `最大文件大小为 ${AVATAR_SPEC.maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    // Validate file type
    const isValidType = AVATAR_SPEC.allowedFormats.some(
      (format) => format === file.type
    );
    if (!isValidType) {
      toast.error("不支持的文件格式", {
        description: "支持的格式: JPG, PNG, WebP",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadAvatar(formData);

      if (result.success) {
        // Auto-save avatar URL to database
        const currentValues = form.getValues();
        const updateResult = await updateUserProfile({
          ...currentValues,
          avatarUrl: result.data.url,
        } as UpdateProfileInput);

        if (updateResult.success) {
          // 更新 store
          const { name, bio, avatarUrl, phone, contact } = updateResult.data;
          setUserProfile({ name, bio, avatarUrl, phone, contact });

          // Update form with returned data
          form.reset({
            name: updateResult.data.name || "",
            bio: updateResult.data.bio || "",
            avatarUrl: updateResult.data.avatarUrl || "",
            phone: updateResult.data.phone || "",
            contact: updateResult.data.contact || "",
          });
          setAvatarPreview(updateResult.data.avatarUrl);
          toast.success("头像上传成功");
        } else {
          toast.error("保存失败", { description: updateResult.error });
        }
      } else {
        toast.error("上传失败", { description: result.error });
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("上传失败", { description: "请稍后重试" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleRemoveAvatar = useCallback(() => {
    form.setValue("avatarUrl", "");
    setAvatarPreview(null);
  }, [form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsPending(true);

    try {
      const result = await updateUserProfile(data as UpdateProfileInput);

      if (result.success) {
        // 更新 store
        const { name, bio, avatarUrl, phone, contact } = result.data;
        setUserProfile({ name, bio, avatarUrl, phone, contact });
        // Update form with returned data (preserves all values)
        form.reset({
          name: result.data.name || "",
          bio: result.data.bio || "",
          avatarUrl: result.data.avatarUrl || "",
          phone: result.data.phone || "",
          contact: result.data.contact || "",
        });

        // Update avatar preview if it changed
        if (result.data.avatarUrl) {
          setAvatarPreview(result.data.avatarUrl);
        }

        toast.success("个人资料已更新", {
          description: "您的信息已成功保存",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });

        onSuccess?.();
      } else {
        toast.error("更新失败", { description: result.error });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("更新失败", { description: "请稍后重试" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>个人资料</CardTitle>
        </div>
        <CardDescription>更新您的个人信息和联系方式</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <FormLabel>头像</FormLabel>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-muted">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isPending}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        选择图片
                      </>
                    )}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      移除头像
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                推荐尺寸: {AVATAR_SPEC.recommendedSize.width}x
                {AVATAR_SPEC.recommendedSize.height}px • 最大文件大小:{" "}
                {AVATAR_SPEC.maxSize / 1024 / 1024}MB • 格式: JPG, PNG, WebP
              </p>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入您的姓名"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    电话
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+86 138 0000 0000"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    用于联系的电话号码
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    联系方式
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="微信、邮箱或其他联系方式"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    其他联系方式，如微信号、邮箱等
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>个人简介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="简单介绍一下自己"
                      rows={3}
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    最多 500 个字符
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存更改"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
