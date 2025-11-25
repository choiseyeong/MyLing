'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const heroFigures = [
  { src: '/twinkle_1.png', alt: '보라색 별', className: 'absolute top-10 left-24 w-20 animate-float-slow', delay: '0s' },
  { src: '/twinkle_2.png', alt: '핑크 별', className: 'absolute top-[55%] right-16 w-16 animate-float-slow', delay: '0.2s' },
  { src: '/ghost_1.png', alt: '윙크하는 귀령', className: 'absolute top-[55%] left-16 w-32 animate-float-slow', delay: '0.4s' },
  { src: '/ghost_2.png', alt: '웃는 귀령', className: 'absolute top-12 right-16 w-32 animate-float-slow', delay: '0.6s' },
]

export default function Home() {
  const [lampOn, setLampOn] = useState(true)
  const [heroAnimKey, setHeroAnimKey] = useState(0)

  useEffect(() => {
    const handler = () => setHeroAnimKey((prev) => prev + 1)
    if (typeof window !== 'undefined') {
      window.addEventListener('hero-text-refresh', handler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hero-text-refresh', handler)
      }
    }
  }, [])
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative max-w-5xl mx-auto px-6 pt-0 sm:pt-0 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none">
          {heroFigures.map((figure) => (
            <Image
              key={figure.alt}
              src={figure.src}
              alt={figure.alt}
              width={160}
              height={160}
              className={figure.className}
              style={{ animationDelay: figure.delay }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative w-[220px] h-[220px]">
            <Image
              src="/homelight.png"
              alt="보라색 조명"
              fill
              sizes="220px"
              priority
              className={`transition-opacity duration-200 ease-out ${lampOn ? 'opacity-0' : 'opacity-100'}`}
              style={{ objectFit: 'contain' }}
            />
            <div className="absolute inset-x-[15px] top-0 bottom-[30px]">
              <Image
                src="/homelight_off.png"
                alt="꺼진 조명"
                fill
                sizes="190px"
                priority
                className={`transition-opacity duration-200 ease-out ${lampOn ? 'opacity-100' : 'opacity-0'}`}
                style={{ objectFit: 'contain', objectPosition: 'top center' }}
              />
            </div>
          </div>
          <div key={heroAnimKey}>
            <p className="text-2xl text-white/80 mb-2 hero-text-fade">내가 찾던 나만의 영어 지문 학습 장소</p>
            <h1 className="text-5xl sm:text-4xl font-bold hero-text-fade hero-text-fade-delay">지금, 마일링에서 시작하세요!</h1>
          </div>
          <Link
            href="/learn"
            className="mt-7 px-12 py-3 rounded-full text-white font-semibold text-xl btn-glow"
            onMouseEnter={() => setLampOn(false)}
            onMouseLeave={() => setLampOn(true)}
            style={{ backgroundImage: 'linear-gradient(90deg, #7556FF 0%, #C673FA 100%)' }}
          >
            분석 시작하기
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pt-60 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-12 text-center sm:text-left">
          <div className="flex justify-center">
            <Image src="/ghost_3.png" alt="링기" width={160} height={160} className="animate-float-slow" />
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">
              안녕하세요! <span className="text-[#A88BFF]">Hello!</span>
            </p>
            <p className="text-2xl text-white/80 leading-relaxed">
              저는 당신의 학습을 도와줄 유령 링기라고 해요. <br />
              제가 MyLing 사용법에 대해 소개해 드릴게요.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}



