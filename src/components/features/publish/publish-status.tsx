"use client";

import { useState, useEffect } from "react";
import { getPublishStatus } from "@/actions/publish-actions";
import { Loader2 } from "lucide-react";

/**
 * PublishStatus Component
 *
 * Displays the current publish status (draft/published) with timestamp.
 *
 * Requirements: 24.4, 24.5
 */
export function PublishStatus() {
    const [status, setStatus] = useState<{
        isPublished: boolean;
        publishedAt: Date | null;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadStatus() {
            try {
                const result = await getPublishStatus();
                if (isMounted) {
                    if (result.success) {
                        setStatus({
                            isPublished: result.data.isPublished,
                            publishedAt: result.data.publishedAt ? new Date(result.data.publishedAt) : null,
                        });
                    }
                    // 即使失败也停止加载，避免一直卡在加载状态
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to load publish status:", error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        loadStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
            </div>
        );
    }

    if (!status) return null;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            {status.isPublished ? (
                <>
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">已发布</span>
                    {status.publishedAt && (
                        <span className="text-muted-foreground">
                            · {formatDate(status.publishedAt)}
                        </span>
                    )}
                </>
            ) : (
                <>
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">草稿</span>
                </>
            )}
        </div>
    );
}
