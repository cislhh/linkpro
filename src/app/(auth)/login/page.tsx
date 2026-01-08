"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/lib/validations";
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
 * Login Page
 * 
 * Implements user authentication with email and password.
 * Uses React Hook Form with Zod validation.
 * Includes "Remember Me" functionality with 7-day session persistence.
 * 
 * Requirements: 1.2 - User login with valid credentials
 */
export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [isLoading, setIsLoading] = useState(false);

    // Auth store for remember me functionality
    const { rememberMe, setRememberMe, setLoginExpiry } = useAuthStore();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginInput) {
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("邮箱或密码错误");
                return;
            }

            // Set login expiry if remember me is checked
            setLoginExpiry();

            toast.success("登录成功！");
            router.push(callbackUrl);
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
                    <CardTitle className="text-2xl font-bold text-white">欢迎回来</CardTitle>
                    <CardDescription className="text-zinc-400">
                        登录你的 LinkPro 账号
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-300">密码</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                disabled={isLoading}
                                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-zinc-900"
                                />
                                <label
                                    htmlFor="rememberMe"
                                    className="text-sm text-zinc-400 cursor-pointer select-none"
                                >
                                    记住我（7天内免登录）
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "登录中..." : "登录"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-zinc-500">
                        还没有账号？{" "}
                        <Link
                            href="/register"
                            className="text-purple-400 font-medium hover:underline"
                        >
                            立即注册
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
