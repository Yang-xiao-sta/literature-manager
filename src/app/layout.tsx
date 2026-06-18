import type { Metadata } from "next";
import { Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

const sans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "文献记录与总结管理网站",
  description: "面向科研文献分类、表格化记录、详细总结与检索管理的本地运行 MVP。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
