'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Mail } from 'lucide-react'
import { useLang } from '@/app/providers/LangProvider'

type Lang = 'vi' | 'en'

// Helpers nhớ trạng thái
const LANG_KEY = 'site_lang'
const setCookie = (k: string, v: string, days = 365) => {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${k}=${encodeURIComponent(v)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`
}
const getCookie = (k: string) => {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.match(new RegExp('(^| )' + k + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : ''
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { lang, setLang } = useLang()

  // Khởi tạo từ cookie/localStorage hoặc fallback theo trình duyệt
 // useEffect(() => {
 //   const fromCookie = getCookie(LANG_KEY) as Lang
 //   const fromLS = (typeof window !== 'undefined' && window.localStorage.getItem(LANG_KEY)) as Lang | null
 //   const browser = (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi')) ? 'vi' : 'en'
 //   const initial: Lang = (fromCookie === 'vi' || fromCookie === 'en')
 //     ? fromCookie
 //     : (fromLS === 'vi' || fromLS === 'en') ? fromLS : (browser as Lang)
 //   setLang(initial)
//  }, [])

  // Đồng bộ html lang + persist
//  useEffect(() => {
 //   if (!lang) return
//    if (typeof document !== 'undefined') {
//      document.documentElement.lang = lang
 //     try { localStorage.setItem(LANG_KEY, lang) } catch {}
 //     setCookie(LANG_KEY, lang, 365)
 //   }
 // }, [lang])

  // Bảng dịch gọn
  const t = useMemo(() => ({
    vi: {
      home: 'Trang chủ',
      about: 'Năng lực',
      trends: 'Xu hướng xanh',
      contact: 'Liên hệ',
      hotline: 'Hotline',
      mailBtn: 'Liên hệ',
      mobileMail: 'Liên hệ info.dientaitao.vn@gmail.com',
      mobileHotline: 'Hotline +84 961 596 889',
      brand: 'CFS Solutions',
    },
    en: {
      home: 'Home',
      about: 'Capabilities',
      trends: 'Green Trends',
      contact: 'Contact',
      hotline: 'Hotline',
      mailBtn: 'Email',
      mobileMail: 'Email info.dientaitao.vn@gmail.com',
      mobileHotline: 'Hotline +84 961 596 889',
      brand: 'CFS Solutions',
    },
  } as const)[lang], [lang])

  const navigation = useMemo(() => ([
    { name: t.home, href: '/' },
    { name: t.about, href: '/about' },
    { name: t.trends, href: '/trends' },
    { name: t.contact, href: '/contact' },
  ]), [t])

  const LangSwitch = () => (
    <div className="inline-flex items-center rounded-lg border bg-white overflow-hidden">
      <button
        onClick={() => setLang('vi')}
        className={`px-3 py-1.5 text-sm ${lang === 'vi' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
        aria-pressed={lang === 'vi'}
      >
        VI
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 text-sm ${lang === 'en' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <img
                  src="/uploads/logo/logo.jpg"
                  alt="logo"
                  className="w-10 h-10"
                />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                {t.brand}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href + item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right: Lang + Contact */}
          <div className="hidden md:flex items-center space-x-3">
            <LangSwitch />

            {/* Hotline */}
            <a href="tel:+84961596889">
              <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                <Phone className="w-4 h-4 mr-2" />
                {t.hotline}
              </Button>
            </a>

            {/* Email */}
            <a href="mailto:info.dientaitao.vn@gmail.com">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Mail className="w-4 h-4 mr-2" />
                {t.mailBtn}
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LangSwitch />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.href + item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                <a href="tel:+84961596889" className="w-full">
                  <Button variant="outline" className="w-full text-green-600 border-green-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {t.mobileHotline}
                  </Button>
                </a>
                <a href="mailto:info.dientaitao.vn@gmail.com" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Mail className="w-4 h-4 mr-2" />
                    {t.mobileMail}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
