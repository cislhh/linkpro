"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerUser } from "@/actions/user-actions";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Register Page
 * 
 * Implements user registration with email, password, and username.
 * Uses React Hook Form with Zod validation.
 * 
 * Requirements: 1.1 - User registration with valid credentials
 * Requirements: 1.3 - Unique username assignment
 */
export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setLoginExpiry } = useAuthStore();

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            username: "",
        },
    });

    async function onSubmit(data: RegisterInput) {
        setIsLoading(true);

        try {
            const result = await registerUser(data);

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            // Auto sign in after successful registration
            const signInResult = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error("注册成功，但自动登录失败。请手动登录。");
                router.push("/login");
                return;
            }

            // Set login expiry for new users (default session)
            setLoginExpiry();

            toast.success("账号创建成功！");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("发生意外错误");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
            <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">创建账号</CardTitle>
                    <CardDescription className="text-zinc-400">
                        开始创建你的 LinkPro 主页
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">邮箱</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                disabled={isLoading}
                                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">用户名</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="yourname"
                                                autoComplete="username"
                                                disabled={isLoading}
                                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-zinc-500">
                                            你的公开主页地址将是 linkpro.com/u/{field.value || "yourname"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">密码</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-zinc-500">
                                            至少 8 个字符
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "创建中..." : "创建账号"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-zinc-500">
                        已有账号？{" "}
                        <Link
                            href="/login"
                            className="text-purple-400 font-medium hover:underline"
                        >
                            立即登录
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
