'use client'

interface LoadingScreenProps {
  message: string
  subMessage?: string
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* 회전하는 점들로 구성된 로딩 애니메이션 */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full bg-gray-400"
            style={{
              animation: `loading-dot 1.4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </div>
      
      {/* 메시지 */}
      <p className="text-xl font-semibold text-gray-800 mb-2">{message}</p>
      {subMessage && (
        <p className="text-sm text-gray-600">{subMessage}</p>
      )}
    </div>
  )
}
