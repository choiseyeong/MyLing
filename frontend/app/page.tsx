'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

const heroFigures = [
  { src: '/twinkle_1.png', alt: '보라색 별', className: 'absolute top-10 left-24 w-20 animate-float-slow', delay: '0s' },
  { src: '/twinkle_2.png', alt: '핑크 별', className: 'absolute top-[55%] right-16 w-16 animate-float-slow', delay: '0.2s' },
  { src: '/ghost_1.png', alt: '윙크하는 귀령', className: 'absolute top-[55%] left-16 w-32 animate-float-slow', delay: '0.4s' },
  { src: '/ghost_2.png', alt: '웃는 귀령', className: 'absolute top-12 right-16 w-32 animate-float-slow', delay: '0.6s' },
]

export default function Home() {
  const [lampOn, setLampOn] = useState(true)
  const [heroAnimKey, setHeroAnimKey] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

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

  // Intersection Observer로 스크롤 애니메이션 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id))
          } else {
            setVisibleSections((prev) => {
              const newSet = new Set(prev)
              newSet.delete(entry.target.id)
              return newSet
            })
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
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
            scroll={true}
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
        <div 
          id="intro-section"
          ref={(el) => { sectionRefs.current['intro-section'] = el }}
          className={`max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-12 text-center sm:text-left transition-all duration-1000 ${
            visibleSections.has('intro-section')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
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

      {/* 웹사이트 소개 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        {/* 1단계 */}
        <div 
          id="step-1"
          ref={(el) => { sectionRefs.current['step-1'] = el }}
          className={`flex flex-col items-center gap-12 transition-all duration-1000 ${
            visibleSections.has('step-1')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full space-y-4 text-center">
            <div className="text-4xl font-bold mb-6">
              <span className="text-primary">1.</span> 지문 준비하기
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              우선 번역하고 싶은 영어지문이 담긴 pdf 혹은 이미지 파일을 준비해 주세요!<br/>
              저는 제 친구가 이번 학기에 듣고 있는 수업에서의 지문을 가져왔어요.
            </p>
          </div>
          <div className="w-full flex flex-row gap-6 justify-center items-center flex-wrap">
            <div className="relative transform -rotate-2 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/1-2.jpg" 
                alt="PDF 파일 준비" 
                width={180} 
                height={180}
                className="rounded-lg w-full max-w-md h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
            <div className="relative transform rotate-2 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/1-1.png" 
                alt="이미지 파일 준비" 
                width={150} 
                height={130}
                className="rounded-lg w-full max-w-md h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 2단계 */}
        <div 
          id="step-2"
          ref={(el) => { sectionRefs.current['step-2'] = el }}
          className={`flex flex-col items-center gap-12 transition-all duration-1000 ${
            visibleSections.has('step-2')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full space-y-4 text-center">
            <div className="text-4xl font-bold mb-6">
              <span className="text-primary">2.</span> '학습하기' 탭에서 지문을 번역해요.
            </div>
            <ul className="text-lg text-white/70 leading-relaxed space-y-4 list-none max-w-3xl mx-auto text-center">
              <li className="mb-6">
                <div className="mb-4">• 지문의 문단은 자동 구분되며, '문단 편집' 기능을 통해 수동으로 구분도 가능해요.</div>
                <div className="w-full flex flex-col gap-6 items-center">
                  <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
                    <Image 
                      src="/screens/2-1.png" 
                      alt="문단 편집" 
                      width={576} 
                      height={360}
                      className="rounded-lg w-full max-w-lg h-auto"
                      style={{
                        boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                      }}
                    />
                  </div>
                  <div className="relative transform rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
                    <Image 
                      src="/screens/2-2.png" 
                      alt="번역 결과" 
                      width={576} 
                      height={360}
                      className="rounded-lg w-full max-w-lg h-auto"
                      style={{
                        boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                      }}
                    />
                  </div>
                  <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
                    <Image 
                      src="/screens/2-3.png" 
                      alt="PDF 저장" 
                      width={576} 
                      height={360}
                      className="rounded-lg w-full max-w-lg h-auto"
                      style={{
                        boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>
              </li>
              <li className="mb-6">
                <div className="w-full text-center mb-6">
                  <div className="mb-4">• Step 2에서 pdf 저장하기를 누를시,
                    <br/>영어 원문 + 번역된 한글이 pdf에 저장돼요.</div>
                  <div className="mb-4">• Step 3에서 단어를 추가한 뒤 pdf 저장하기를 누를시,<br/>
                    영어 원문 + 번역된 한글과 추가한 단어들까지 pdf에 저장돼요.</div>
                </div>
                <div className="w-full flex flex-row gap-6 items-center justify-center">
                  <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
                    <Image 
                      src="/screens/2-5.png" 
                      alt="저장된 PDF" 
                      width={240} 
                      height={150}
                      className="rounded-lg h-auto"
                      style={{
                        boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                      }}
                    />
                  </div>
                  <div className="relative transform rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
                    <Image 
                      src="/screens/2-4.png" 
                      alt="저장된 PDF" 
                      width={240} 
                      height={150}
                      className="rounded-lg h-auto"
                      style={{
                        boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-white/60 mt-4">▲ 저장된 PDF</p>
              </li>
            </ul>
          </div>
        </div>

        {/* 3단계 */}
        <div 
          id="step-3"
          ref={(el) => { sectionRefs.current['step-3'] = el }}
          className={`flex flex-col items-center gap-12 transition-all duration-1000 ${
            visibleSections.has('step-3')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full space-y-4 text-center">
            <div className="text-4xl font-bold mb-6">
              <span className="text-primary">3.</span> 저장한 단어들은 '단어장' 탭에 한 번에!
            </div>
            
            <ul className="text-lg text-white/70 leading-relaxed space-y-2 list-none max-w-3xl mx-auto text-center">
              <li className="mb-2">• 전체 단어 혹은 지문별 단어를 확인할 수 있어요.</li>
              <li className="mb-2">• 이제 완전히 아는 단어는 단어 옆 동그라미 버튼을 눌러 표시 가능하며,</li>
              <li className="mb-2">추가로 공부가 필요한 단어들만 모아볼 수 있어요.</li>
            </ul>
          </div>
          <div className="w-full flex flex-col gap-6 items-center">
            <div className="relative transform rotate-2 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/3-1.png" 
                alt="단어장 목록" 
                width={576} 
                height={360}
                className="rounded-lg w-full max-w-lg h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
            <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/3-2.png" 
                alt="단어 학습" 
                width={576} 
                height={360}
                className="rounded-lg w-full max-w-lg h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 4단계 */}
        <div 
          id="step-4"
          ref={(el) => { sectionRefs.current['step-4'] = el }}
          className={`flex flex-col items-center gap-12 transition-all duration-1000 ${
            visibleSections.has('step-4')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full space-y-4 text-center">
            <div className="text-4xl font-bold mb-6">
              <span className="text-primary">4.</span> '마이페이지' 탭에서 학습한 지문들을 다시볼 수 있어요.
            </div>
            
            <ul className="text-lg text-white/70 leading-relaxed space-y-2 list-none max-w-3xl mx-auto text-center">
              <li className="mb-2">• '바로가기' 버튼을 통해 pdf를 다시 저장하거나, 단어를 추가로 학습할 수 있어요</li>
              <li className="mb-2">• 각 지문마다 자동 분류된 주제를 확인할 수 있어요.</li>
            </ul>
          </div>
          <div className="w-full flex flex-col gap-6 items-center">
            <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/4-1.png" 
                alt="마이페이지" 
                width={576} 
                height={360}
                className="rounded-lg w-full max-w-lg h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 5단계 */}
        <div 
          id="step-5"
          ref={(el) => { sectionRefs.current['step-5'] = el }}
          className={`flex flex-col items-center gap-12 transition-all duration-1000 ${
            visibleSections.has('step-5')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full space-y-4 text-center">
            <div className="text-4xl font-bold mb-6" style={{ lineHeight: '1.6' }}>
              <span className="text-primary">5.</span> 마지막으로 당신을 위해<br/>
              제가 종이 몇 장을 배달해 드릴게요.
            </div>
            <ul className="text-lg text-white/70 leading-relaxed space-y-2 list-none max-w-3xl mx-auto text-center">
              <li className="mb-2">• '마이페이지'의 주제와 관련된 다양한 논문과 기사를 가져왔어요.</li>
              <li className="mb-2">• 평소라면 접하기 어려운 글들을 통해 영어 실력뿐 아니라<br/>
              세상의 문을 열어드리는 경험을 제가 시켜드릴게요 :D</li>
            </ul>
          </div>
          <div className="w-full flex flex-col gap-6 items-center">
            <div className="relative transform rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/5-1.png" 
                alt="논문 배달" 
                width={480} 
                height={300}
                className="rounded-lg w-full max-w-md h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
            <div className="relative transform -rotate-1 transition-transform duration-300 hover:scale-150 hover:z-10">
              <Image 
                src="/screens/5-2.png" 
                alt="논문 목록" 
                width={480} 
                height={300}
                className="rounded-lg w-full max-w-md h-auto"
                style={{
                  boxShadow: '0 0 30px rgba(200, 180, 255, 0.4), 0 0 60px rgba(200, 180, 255, 0.2), 0 0 90px rgba(200, 180, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 하단 CTA 섹션 */}
      <section className="max-w-5xl mx-auto px-6 py-32 pb-40 text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex justify-center items-center w-64 h-64">
            {/* 주변 반짝이는 별들 */}
            <div className="absolute top-0 left-1/2 w-3 h-3 animate-twinkle" style={{ animationDelay: '0s', transform: 'translateX(-50%)' }}>
              <Image src="/twinkle_1.png" alt="별" width={24} height={24} />
            </div>
            <div className="absolute top-1/4 right-0 w-2 h-2 animate-twinkle" style={{ animationDelay: '0.5s' }}>
              <Image src="/twinkle_2.png" alt="별" width={20} height={20} />
            </div>
            <div className="absolute bottom-1/4 left-0 w-2.5 h-2.5 animate-twinkle" style={{ animationDelay: '1s' }}>
              <Image src="/twinkle_1.png" alt="별" width={22} height={22} />
            </div>
            <div className="absolute bottom-0 left-1/3 w-2 h-2 animate-twinkle" style={{ animationDelay: '1.5s', transform: 'translateX(-50%)' }}>
              <Image src="/twinkle_2.png" alt="별" width={18} height={18} />
            </div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 animate-twinkle" style={{ animationDelay: '2s' }}>
              <Image src="/twinkle_1.png" alt="별" width={20} height={20} />
            </div>
            
            {/* 펄스 링 효과 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-48 h-48 border-2 border-purple-300/30 rounded-full animate-pulse-ring"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-56 h-56 border-2 border-purple-200/20 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* ghost_5 이미지 */}
            <div className="relative z-10">
              <Image 
                src="/ghost_5.png" 
                alt="링기" 
                width={160} 
                height={160} 
                className="animate-float-slow" 
              />
            </div>
          </div>
          <p className="text-3xl font-bold text-white/90">
            이제 마일링을 이용할 준비가 되셨나요?
          </p>
          <Link
            href="/learn"
            scroll={true}
            className="px-12 py-3 rounded-full text-white font-semibold text-xl btn-glow transition-transform duration-300 hover:scale-105"
            onMouseEnter={() => setLampOn(false)}
            onMouseLeave={() => setLampOn(true)}
            style={{ backgroundImage: 'linear-gradient(90deg, #7556FF 0%, #C673FA 100%)' }}
          >
            분석 시작하기
          </Link>
        </div>
      </section>
    </main>
  )
}



