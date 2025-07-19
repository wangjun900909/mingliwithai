import './globals.css'
import './mobile-optimization.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '日期匹配查询 - 手机版',
  description: '查询您的生日匹配关系，包括情人伴侣、工作伙伴朋友、竞争对手天敌、灵魂伴侣',
  keywords: '日期匹配,生日查询,情人伴侣,工作伙伴,竞争对手,灵魂伴侣',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 