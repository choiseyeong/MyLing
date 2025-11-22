'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/learn', label: '학습하기' },
    { href: '/vocabulary', label: '단어장' },
    { href: '/analysis', label: '분석' },
    { href: '/inquiry', label: '문의' },
    { href: '/mypage', label: '마이페이지' },
  ]

  return (
    <nav className="flex items-center justify-between px-8 py-4">
      <Link href="/" className="text-2xl font-bold text-primary">
        MyLing
      </Link>
      <div className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${
              pathname?.startsWith(item.href)
                ? 'text-primary'
                : 'text-white hover:text-primary'
            } transition-colors`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}



