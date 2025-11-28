import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'MyLing',
  description: 'Learn English through reading and translation',
  icons: {
    icon: '/ghost_3.png',
    shortcut: '/ghost_3.png',
    apple: '/ghost_3.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}



