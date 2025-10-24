import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import { LangProvider } from './providers/LangProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CFS Solutions - Năng Lượng Tái Tạo',
  description: 'Công ty chuyên về năng lượng tái tạo, cung cấp giải pháp xanh bền vững cho tương lai.',
  keywords: 'năng lượng tái tạo, điện mặt trời, điện gió, năng lượng xanh, bền vững',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
      <LangProvider>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <FloatingContact />
        </LangProvider>
      </body>
    </html>
  )
}


