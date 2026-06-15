"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "数据概览",
    href: "/landlord/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "房源管理",
    href: "/landlord/properties",
    icon: Home,
  },
  {
    label: "预约管理",
    href: "/landlord/bookings",
    icon: Calendar,
  },
  {
    label: "发布房源",
    href: "/landlord/properties/create",
    icon: PlusCircle,
  },
];

export default function LandlordNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/landlord/properties"
                ? pathname.startsWith("/landlord/properties") &&
                  !pathname.startsWith("/landlord/properties/create")
                : pathname === item.href ||
                  (item.href !== "/landlord/dashboard" &&
                    pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
