'use client'

import Image from 'next/image'

interface LoadingScreenProps {
  message: string
  subMessage?: string
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-64 h-64 mb-10">
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute inset-10 rounded-full border border-purple-200/40 blur-lg" />
        <div className="absolute inset-3 rounded-full border-t-4 border-r-4 border-b-4 border-transparent border-t-[#C8AFFF] border-r-[#A689FF] ring-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-purple-200/40 rounded-full blur-2xl" />
        </div>
        <div className="orbit-wrapper">
          <Image
            src="/ghost_1.png"
            alt="돌아가는 귀령"
            width={100}
            height={100}
            className="orbiting-ghost"
            priority
          />
          <div className="orbit-trail" />
        </div>
      </div>

      <p className="text-xl font-semibold text-gray-100 mb-2">{message}</p>
      {subMessage && <p className="text-sm text-gray-300">{subMessage}</p>}
    </div>
  )
}
