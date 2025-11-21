// app/admin/layout.tsx

import type { Metadata } from "next";
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google";
// import "./admin.css";  
// import { Toaster } from "@/components/ui/toaster"// optional admin-only styles
import AdminSidebar from "@/components/AdminSidebar";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuyBot–Admin",
  description: "Admin dashboard for BuyBot",
  icons: { icon: "/favicon.ico" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-gray-50">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}