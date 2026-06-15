"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Home, User, Building2, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const registerSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
  confirmPassword: z.string().min(6, "请确认密码"),
  role: z.enum(["TENANT", "LANDLORD"], {
    required_error: "请选择用户角色",
  }),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"TENANT" | "LANDLORD">("TENANT");

  if (session) {
    router.push("/properties");
    return null;
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "TENANT",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
      });

      if (response.data.success) {
        toast.success("注册成功！正在登录...");
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        router.push("/properties");
        router.refresh();
      } else {
        toast.error(response.data.message || "注册失败");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: "TENANT" | "LANDLORD") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Home className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">创建账号</h2>
          <p className="mt-2 text-sm text-gray-600">
            已有账号？{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              立即登录
            </Link>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">我是</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect("TENANT")}
              className={cn(
                "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all",
                selectedRole === "TENANT"
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <User className={cn("h-8 w-8 mb-2", selectedRole === "TENANT" ? "text-blue-600" : "text-gray-400")} />
              <span className="font-medium">租客</span>
              <span className="text-xs text-gray-500 mt-1">找房子租</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("LANDLORD")}
              className={cn(
                "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all",
                selectedRole === "LANDLORD"
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Building2 className={cn("h-8 w-8 mb-2", selectedRole === "LANDLORD" ? "text-blue-600" : "text-gray-400")} />
              <span className="font-medium">房东</span>
              <span className="text-xs text-gray-500 mt-1">发布房源</span>
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("role")} />

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className={cn(
                  "appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm",
                  errors.name ? "border-red-500" : "border-gray-300"
                )}
                placeholder="请输入您的姓名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm",
                  errors.email ? "border-red-500" : "border-gray-300"
                )}
                placeholder="请输入邮箱地址"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                手机号码 <span className="text-gray-400">(选填)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className={cn(
                  "appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm",
                  errors.phone ? "border-red-500" : "border-gray-300"
                )}
                placeholder="请输入手机号码"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                设置密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className={cn(
                    "appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm",
                    errors.password ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="请输入密码（至少6位）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={cn(
                    "appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm",
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="请再次输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                我已阅读并同意{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  用户协议
                </a>{" "}
                和{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  隐私政策
                </a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "注册账号"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
