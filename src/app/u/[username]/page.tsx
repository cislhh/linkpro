import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getThemeComponent } from '@/components/themes';
import type { ThemeType, Link } from '@/types';

/**
 * Public Page - 用户公开主页
 * 
 * 使用 SSR 获取用户数据并渲染对应主题
 * 
 * Requirements: 5.1, 5.3, 5.5
 */

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

/**
 * 获取用户数据（SSR）
 * 根据 username 查询用户和链接
 */
async function getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatarUrl: true,
            theme: true,
            links: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    userId: true,
                    title: true,
                    url: true,
                    icon: true,
                    order: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    return user;
}

/**
 * 生成动态 Open Graph 元数据
 * Requirements: 5.4
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
        return {
            title: 'User Not Found - LinkPro',
            description: 'The requested user page does not exist.',
        };
    }

    const displayName = user.name || `@${user.username}`;
    const description = user.bio || `Check out ${displayName}'s links on LinkPro`;

    return {
        title: `${displayName} - LinkPro`,
        description,
        openGraph: {
            title: `${displayName} - LinkPro`,
            description,
            type: 'profile',
            url: `/u/${user.username}`,
            ...(user.avatarUrl && {
                images: [
                    {
                        url: user.avatarUrl,
                        width: 200,
                        height: 200,
                        alt: displayName,
                    },
                ],
            }),
        },
        twitter: {
            card: 'summary',
            title: `${displayName} - LinkPro`,
            description,
            ...(user.avatarUrl && {
                images: [user.avatarUrl],
            }),
        },
    };
}

/**
 * 公开页面组件
 * 
 * - 使用 SSR 获取用户数据
 * - 根据 theme 字段动态渲染对应主题组件
 * - 处理不存在的用户名返回 404
 */
export default async function PublicPage({ params }: PageProps) {
    const { username } = await params;
    const user = await getUserByUsername(username);

    // 处理不存在的用户名 - Requirements: 5.5
    if (!user) {
        notFound();
    }

    // 获取对应的主题组件 - Requirements: 5.3
    const theme = user.theme as ThemeType;
    const ThemeComponent = getThemeComponent(theme);

    // 准备用户数据
    const userData = {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        username: user.username,
    };

    // 转换链接数据类型
    const links: Link[] = user.links.map((link) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt),
    }));

    // 渲染主题组件 - Requirements: 5.1
    return <ThemeComponent links={links} user={userData} />;
}
