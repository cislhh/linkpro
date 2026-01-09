"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { publishPage, unpublishPage, getPublishStatus } from "@/actions/publish-actions";
import { Globe, GlobeLock, Copy, ExternalLink, Loader2 } from "lucide-react";

/**
 * PublishButton Component
 * 
 * Displays publish/unpublish button and public URL when published.
 * 
 * Requirements: 24.1, 24.3, 24.6
 */
export function PublishButton() {
    const [isPublished, setIsPublished] = useState(false);
    const [publicUrl, setPublicUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Load initial publish status
    useEffect(() => {
        async function loadStatus() {
            const result = await getPublishStatus();
            if (result.success) {
                setIsPublished(result.data.isPublished);
                if (result.data.isPublished) {
                    setPublicUrl(window.location.origin + result.data.publicUrl);
                }
            }
            setIsInitializing(false);
        }
        loadStatus();
    }, []);

    const handlePublish = async () => {
        setIsLoading(true);
        const result = await publishPage();
        setIsLoading(false);

        if (result.success) {
            setIsPublished(true);
            setPublicUrl(window.location.origin + result.data.url);
            toast.success("页面发布成功！", {
                description: "你的个人主页现在可以被访问了",
            });
        } else {
            toast.error("发布失败", { description: result.error });
        }
    };

    const handleUnpublish = async () => {
        setIsLoading(true);
        const result = await unpublishPage();
        setIsLoading(false);

        if (result.success) {
            setIsPublished(false);
            setPublicUrl("");
            toast.success("已取消发布");
        } else {
            toast.error("操作失败", { description: result.error });
        }
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        toast.success("链接已复制到剪贴板");
    };

    if (isInitializing) {
        return (
            <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">加载中...</span>
                </div>
            </div>
        );
    }

    if (isPublished) {
        return (
            <div className="flex flex-col gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">页面已发布</span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={publicUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 rounded border text-muted-foreground"
                    />
                    <Button size="sm" variant="outline" onClick={copyUrl} title="复制链接">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" asChild title="打开页面">
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnpublish}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GlobeLock className="mr-2 h-4 w-4" />
                    )}
                    取消发布
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={handlePublish}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Globe className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "发布中..." : "发布页面"}
        </Button>
    );
}
