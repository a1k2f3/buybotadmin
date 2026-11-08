// app/admin/_components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  BadgeDollarSign,
  Menu,
  X,
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
  { href: "/guestorder", label: "Guest Orders", icon: ShoppingCart },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/logs", label: "Activity Logs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigation = (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      {menu.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors
              ${active ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:hidden">
        <h1 className="text-xl font-bold text-indigo-600">BuyBot Admin</h1>
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-admin-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside className="hidden w-64 shrink-0 flex-col bg-white shadow-lg md:flex">
        <div className="border-b p-5">
          <h1 className="text-2xl font-bold text-indigo-600">BuyBot Admin</h1>
          <ThemeToggle />
        </div>
        {navigation}
        <div className="border-t p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside
            id="mobile-admin-navigation"
            className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-bold text-indigo-600">BuyBot Admin</h2>
              <ThemeToggle />
            </div>
            {navigation}
            <div className="border-t p-4">
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}