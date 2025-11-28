'use client'

import Image from 'next/image'

interface LoadingScreenProps {
  message: string
  subMessage?: string
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-purple-100 to-white shadow-inner" />
        <Image
          src="/ghost_6.png"
          alt="로딩 중 링기"
          width={160}
          height={160}
          className="relative drop-shadow-lg"
          priority
        />
      </div>

      <p className="text-xl font-semibold text-gray-900 mb-2">{message}</p>
      {subMessage && <p className="text-sm text-gray-600">{subMessage}</p>}
    </div>
  )
}
