'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose?: () => void
  duration?: number
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        if (onClose) {
          setTimeout(onClose, 300) // 애니메이션 완료 후 onClose 호출
        }
      }, duration)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
      }`}
    >
      <div className="bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        <span>{message}</span>
      </div>
    </div>
  )
}


