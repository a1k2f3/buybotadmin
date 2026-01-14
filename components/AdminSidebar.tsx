// app/admin/_components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Store,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  BadgeDollarSign
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const menu = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Home },
  { href: "/discount", label: "Discounts", icon: BadgeDollarSign },
  { href: "/categories", label: "Categories", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/users", label: "Users", icon: Users },
  { href: "/sales", label: "Sales & Orders", icon: ShoppingCart },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/logs", label: "Activity Logs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">BuyBot Admin</h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${active ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}