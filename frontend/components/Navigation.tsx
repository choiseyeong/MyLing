'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Roboto_Mono } from 'next/font/google'

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function Navigation() {
  const pathname = usePathname()
  const triggerHeroAnimation = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hero-text-refresh'))
    }
  }

  const navItems = [
    { href: '/learn', label: '학습하기' },
    { href: '/vocabulary', label: '단어장' },
    { href: '/about', label: 'About' },
    { href: '/mypage', label: '마이페이지' },
  ]

  const mainNavItems = navItems.filter((item) => item.href !== '/mypage')
  const myPageItem = navItems.find((item) => item.href === '/mypage')

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-b from-white to-[#DBCFFF] shadow-sm">
      <Link
        href="/"
        className={`${robotoMono.className} text-2xl font-bold`}
        style={{ letterSpacing: '-0.17em', color: '#7556FF' }}
        onClick={triggerHeroAnimation}
      >
        MyLing
      </Link>
      <div className="flex-1 flex justify-center gap-24">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${
              pathname?.startsWith(item.href)
                ? 'text-primary'
                : 'text-black hover:text-primary'
            } text-xl font-semibold transition-colors`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {myPageItem && (
        <Link
          href={myPageItem.href}
          className={`${
            pathname?.startsWith(myPageItem.href)
              ? 'text-primary'
              : 'text-black hover:text-primary'
          } text-xl font-semibold transition-colors`}
        >
          {myPageItem.label}
        </Link>
      )}
    </nav>
  )
}



