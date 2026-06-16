import Link from "next/link";
import { Home as HomeIcon, Search, UserPlus, LogIn, Building2, ShieldCheck, Heart, Star } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "城市租房平台 - 找到你的理想居所",
  description: "专业的城市租房平台，提供海量真实房源，安全便捷的租房体验",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">城市租房</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>登录</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>注册</span>
            </Link>
          </div>
        </div>

        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            找到你的<span className="text-blue-600">理想居所</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            海量真实房源，专业房东服务，让租房变得简单、安全、省心
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Search className="w-6 h-6" />
            开始找房
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <HomeIcon className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">海量房源</h3>
            <p className="text-gray-600">
              覆盖全国主要城市，数万套真实房源，总有一套适合你
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">安全保障</h3>
            <p className="text-gray-600">
              房源信息审核认证，交易流程安全规范，让你放心租房
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
              <Star className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">优质服务</h3>
            <p className="text-gray-600">
              专业房东团队，贴心客户服务，解决你租房过程中的一切问题
            </p>
          </div>
        </div>

        <div className="py-16 text-center border-t border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">准备好开始了吗？</h2>
          <p className="text-gray-600 mb-8">立即注册，开启你的找房之旅</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/properties"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              浏览房源
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              免费注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
