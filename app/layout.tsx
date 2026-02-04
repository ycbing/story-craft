import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // 防止移动端画布操作时意外缩放
};

export const metadata: Metadata = {
  title: "Story Craft - AI 儿童绘本创作平台",
  description: "用 AI 创作独一无二的儿童绘本。支持 7 种艺术风格，3 个年龄段，简单易用，专业品质。只需几分钟，从创意到成品。",
  keywords: ["AI 绘本", "儿童绘本", "故事创作", "AI 写作", "绘本制作", "儿童故事"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* 1. html 标签必须在 Provider 内部或紧邻，且加上 suppressHydrationWarning */}
      <html lang="zh-CN" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {/* 2. 所有的 UI 内容，包括 Toaster，都应该在 ThemeProvider 内部 */}
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
