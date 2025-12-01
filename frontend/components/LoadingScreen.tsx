'use client'

import Image from 'next/image'

interface LoadingScreenProps {
  message: string
  subMessage?: string
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* 동적 로딩 애니메이션 */}
      <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
        {/* 외부 회전 링 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        {/* 중간 펄스 링 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 border-4 border-primary rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        </div>
        {/* 내부 회전 링 (반대 방향) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-purple-300 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        </div>
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-purple-100 to-white shadow-inner animate-pulse" style={{ animationDuration: '2.5s' }} />
        {/* 링기 이미지 */}
        <Image
          src="/ghost_6.png"
          alt="로딩 중 링기"
          width={160}
          height={160}
          className="relative drop-shadow-lg animate-bounce"
          style={{ animationDuration: '2s' }}
          priority
        />
        {/* 주변 점들 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* 텍스트 애니메이션 */}
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 mb-2">
          {message}
          <span className="inline-block ml-1">
            <span className="animate-pulse" style={{ animationDelay: '0s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
          </span>
        </p>
        {subMessage && (
          <p className="text-sm text-gray-600 animate-pulse" style={{ animationDuration: '2s' }}>
            {subMessage}
          </p>
        )}
      </div>
      
      {/* 진행 바 애니메이션 */}
      <div className="w-64 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-400 via-primary to-purple-400 rounded-full animate-progress"></div>
      </div>
    </div>
  )
}
