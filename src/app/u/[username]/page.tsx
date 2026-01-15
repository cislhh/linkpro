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

interface UserData {
    id: string;
    username: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phone: string | null;
    contact: string | null;
    theme: string;
    isPublished: boolean;
    links: Array<{
        id: string;
        userId: string;
        title: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

/**
 * 获取用户数据（SSR）
 * 根据 username 查询用户和链接
 */
async function getUserByUsername(username: string): Promise<UserData | null> {
    // Use raw SQL to get user with publish status
    const users = await prisma.$queryRaw<Array<{
        id: string;
        username: string;
        name: string | null;
        bio: string | null;
        avatarUrl: string | null;
        phone: string | null;
        contact: string | null;
        theme: string;
        isPublished: boolean;
    }>>`
        SELECT id, username, name, bio, "avatarUrl", phone, contact, theme, "isPublished"
        FROM "User"
        WHERE username = ${username}
    `;

    if (!users || users.length === 0) {
        return null;
    }

    const userData = users[0];
    if (!userData) {
        return null;
    }

    // Get user's active links
    const links = await prisma.link.findMany({
        where: {
            userId: userData.id,
            isActive: true
        },
        orderBy: { order: 'asc' },
    });

    return {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        bio: userData.bio,
        avatarUrl: userData.avatarUrl,
        phone: userData.phone,
        contact: userData.contact,
        theme: userData.theme,
        isPublished: userData.isPublished,
        links,
    };
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
 * - 检查页面是否已发布
 * - 根据 theme 字段动态渲染对应主题组件
 * - 处理不存在的用户名返回 404
 * 
 * Requirements: 5.1, 5.3, 5.5, 24.7
 */
export default async function PublicPage({ params }: PageProps) {
    const { username } = await params;
    const user = await getUserByUsername(username);

    // 处理不存在的用户名 - Requirements: 5.5
    if (!user) {
        notFound();
    }

    // 检查页面是否已发布 - Requirements: 24.7
    if (!user.isPublished) {
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
        phone: user.phone,
        contact: user.contact,
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
