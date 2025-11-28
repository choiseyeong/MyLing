'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AboutPage() {
  const [animationKey, setAnimationKey] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // About 페이지로 이동할 때마다 애니메이션 재시작
    setAnimationKey(prev => prev + 1)
  }, [pathname])

  return (
    <div className="min-h-screen bg-black px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-4">
        <p key={`about-title-${animationKey}`} className="text-white text-4xl font-bold animate-fade-in" style={{ fontFamily: 'Pretendard, sans-serif' }}>
          About
        </p>
        {/* 큰 흰색 카드 */}
        <div className="bg-white rounded-3xl px-12 pt-7 pb-0 text-[#6E6E6E] relative overflow-hidden">
          {/* 제목 */}
          <h1 key={`why-myling-${animationKey}`} className="text-4xl font-bold mb-3 animate-slide-up" style={{ color: '#E85ADA', animationDelay: '0.1s' }}>
            Why MyLing?
          </h1>

          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-3 gap-8 relative z-10">
            {/* 왼쪽: 텍스트 콘텐츠 */}
            <div className="col-span-2 space-y-6">
              {/* MyLing 이름 설명 */}
              <div key={`myling-name-${animationKey}`} className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-2xl font-semibold mb-2">
                  <span style={{ color: '#7556FF' }}>MyLing</span> ={' '}
                  <span style={{ color: '#7556FF' }}>My</span>{' '}
                  <span className="text-[#6E6E6E]">(나의)</span> +{' '}
                  <span style={{ color: '#7556FF' }}>Ling</span>{' '}
                  <span className="text-[#6E6E6E]">(언어)</span>
                </p>
                <p className="leading-relaxed">
                  'Ling'은 라틴어에서 '혀'를 뜻하는 'lingua'에서 유래했으며, 이는 '언어'를 의미합니다.
                </p>
              </div>

              {/* 서비스 기원 */}
              <div key={`service-origin-${animationKey}`} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="leading-relaxed">
                  MyLing은 고등학생 시절 영어 지문을 공부할 때 겪었던 불편함을 시작으로 만들어졌습니다.<br /> 
                  몇 번의 클릭만으로 지문을 내 마음대로 조정할 수 있다면 좋겠다는 고등학생의 생각이<br /> 
                  수년 후 오픈소스소프트웨어 수업의 텀프로젝트에서 실현될 수 있었습니다.
                </p>
              </div>

              {/* 서비스 목표 */}
              <div key={`service-goal-${animationKey}`} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <p className="leading-relaxed">
                  항상 곁에서 학습을 도와주는 유령 '링기'가 살고 있는 MyLing은
                  몽환적인 보라색과<br /> 조명의 디자인으로 '따뜻한 나만의 학습 공간'을 만드는 것을 목표로 했습니다.
                </p>
              </div>
            </div>

            {/* 오른쪽: 유령 캐릭터 */}
            <div className="flex items-center justify-center">
              <div key={`ghost-${animationKey}`} className="relative flex items-center justify-center w-56 h-56 -translate-y-4 animate-float">
                <Image
                  src="/ghost_4.png"
                  alt="Lingi Ghost"
                  width={220}
                  height={220}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* 하단: 노트북 일러스트와 Developer 섹션 */}
          <div className="grid grid-cols-2 gap-6 mt-2 relative z-10">
            {/* 왼쪽: 노트북과 램프 일러스트 */}
            <div key={`lamp-desk-${animationKey}`} className="relative ml-20 animate-fade-in" style={{ height: '176px', animationDelay: '0.5s' }}>
              <Image
                src="/lampwithdesk.png"
                alt="Lingi lamp and desk"
                width={500}
                height={300}
                className="object-contain"
                style={{ position: 'absolute', bottom: 0, marginBottom: 0 }}
                priority
              />
            </div>

            {/* 오른쪽: Developer 섹션 */}
            <div key={`developer-section-${animationKey}`} className="flex flex-col items-end text-right gap-2 mt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h2 key={`developer-title-${animationKey}`} className="text-4xl font-bold animate-slide-up" style={{ color: '#E85ADA', animationDelay: '0.7s' }}>
                Developer
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-6">
                  <Link
                    href="https://www.instagram.com/0se.ee/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Instagram</span>
                  </Link>
                  <Link
                    href="https://github.com/choiseyeong"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>GitHub</span>
                  </Link>
                </div>

                {/* 이메일 */}
                <div className="flex items-center gap-3 justify-end">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:going-well6681@seoultech.ac.kr"
                    className="hover:opacity-80 transition-opacity"
                  >
                    going-well6681@seoultech.ac.kr
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



