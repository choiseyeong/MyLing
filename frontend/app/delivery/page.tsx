'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface Paper {
  id: string
  coverImage: string
  englishTitle: string
  koreanTitle: string
  url: string
}

interface TopicSection {
  id: string
  title: string
  papers: Paper[]
}

export default function DeliveryPage() {
  const searchParams = useSearchParams()
  const topicParam = searchParams.get('topic')
  
  // 주제별 섹션 ID 매핑 (백엔드 주제 -> 페이지 섹션)
  const topicToSectionId: { [key: string]: string } = {
    '인문': 'humanities',
    '자연과학': 'natural-science',
    '공학·기술': 'engineering',
    '예술·문화': 'arts'
  }
  
  // 섹션 refs
  const humanitiesRef = useRef<HTMLDivElement>(null)
  const naturalScienceRef = useRef<HTMLDivElement>(null)
  const engineeringRef = useRef<HTMLDivElement>(null)
  const artsRef = useRef<HTMLDivElement>(null)
  
  const sectionRefs: { [key: string]: React.RefObject<HTMLDivElement> } = {
    'humanities': humanitiesRef,
    'natural-science': naturalScienceRef,
    'engineering': engineeringRef,
    'arts': artsRef
  }
  
  // URL 파라미터로 특정 섹션으로 스크롤
  useEffect(() => {
    if (topicParam && topicToSectionId[topicParam]) {
      const sectionId = topicToSectionId[topicParam]
      const ref = sectionRefs[sectionId]
      if (ref?.current) {
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [topicParam])
  
  // 주제별 이모티콘 매핑
  const topicEmojis: { [key: string]: string } = {
    '인문·사회': '📚',
    '자연과학': '🧪',
    '공학·기술': '⚙️',
    '예술·문화': '🎨'
  }

  // 주제별 색상 매핑 (연한 버전)
  const getTopicColor = (topicTitle: string) => {
    switch (topicTitle) {
      case '인문·사회':
        return '#93C5FD' // 파란계열 연한 버전
      case '자연과학':
        return '#6EE7B7' // 초록 연한 버전
      case '공학·기술':
        return '#FCD34D' // 노랑~주황 연한 버전
      case '예술·문화':
        return '#F9A8D4' // 분홍 연한 버전
      default:
        return '#E5E7EB'
    }
  }

  // 주제별 논문 데이터
  const topics: TopicSection[] = [
    {
      id: 'humanities',
      title: '인문·사회',
      papers: [
        { 
          id: '1', 
          coverImage: '/covoer/인문사회1.jpg', 
          englishTitle: 'Climate Absurdism', 
          koreanTitle: '기후 부조리주의: 기후위기를 |‘부조리한 세계’로 보는 철학적 시도', 
          url: 'https://onlinelibrary.wiley.com/doi/10.1111/japp.12797' 
        },
        { 
          id: '2', 
          coverImage: '/covoer/인문사회2.png', 
          englishTitle: 'Mainstream Psychological and Behavioural Science Meets Anthropology: A Study of Behavioural Transformation', 
          koreanTitle: '주류 심리·행동과학이 인류학을 만나면: | ‘행동이 진짜로 바뀌는 순간’에 대한 연구', 
          url: 'https://www.nature.com/articles/s41599-025-05327-4' 
        },
        { 
          id: '3', 
          coverImage: '/covoer/인문사회3.png', 
          englishTitle: 'Social Media Use, Loneliness and Emotional Distress Among Young People', 
          koreanTitle: '소셜 미디어 사용과 외로움, 정서적 고통: |유럽 청년 세대 전반을 대상으로 한 |대규모 조사', 
          url: 'https://www.econstor.eu/bitstream/10419/308605/1/GLO-DP-1551.pdf' 
        },
      ]
    },
    {
      id: 'natural-science',
      title: '자연과학',
      papers: [
        { 
          id: '1', 
          coverImage: '/covoer/자연과학1.png', 
          englishTitle: 'Scientists Create First-Ever Visible Time Crystals Using Light', 
          koreanTitle: '세계 최초로 \'눈에 보이는 시간 결정\'을 |빛으로 구현한 연구', 
          url: 'https://www.livescience.com/physics-mathematics/scientists-create-first-ever-visible-time-crystals-using-light-and-they-could-one-day-appear-on-usd100-bills' 
        },
        { 
          id: '2', 
          coverImage: '/covoer/자연과학2.png', 
          englishTitle: 'Scientists Discover Bizarre Material Where Electrons Stand Still', 
          koreanTitle: '전자들이 \'멈춰 서 버린\' 기이한 물질 발견', 
          url: 'https://scitechdaily.com/scientists-discover-bizarre-material-where-electrons-stand-still' 
        },
        { 
          id: '3', 
          coverImage: '/covoer/자연과학3.png', 
          englishTitle: 'The Largest Einstein Cross Ever Discovered Dwells Among a Rare \'Carousel\' of Galaxies', 
          koreanTitle: '우주에서 발견된 가장 거대한| ‘아인슈타인 십자가’: 은하 회전목마 속 |숨겨진 암흑물질 지도', 
          url: 'https://www.space.com/einstein-cross-largest-ever-seen' 
        },
      ]
    },
    {
      id: 'engineering',
      title: '공학·기술',
      papers: [
        { 
          id: '1', 
          coverImage: '/covoer/공학기술1.png', 
          englishTitle: 'AI Is Designing Bizarre New Physics Experiments That Actually Work', 
          koreanTitle: 'AI가 설계한 기괴한 물리 실험들이 |실제로 잘 작동한다', 
          url: 'https://www.wired.com/story/ai-comes-up-with-bizarre-physics-experiments-but-they-work/' 
        },
        { 
          id: '2', 
          coverImage: '/covoer/공학기술2.png', 
          englishTitle: 'Self-Driving Laboratories for Chemistry and Materials Science', 
          koreanTitle: '화학·재료 과학을 위한 | \'셀프 드라이빙 연구실\'', 
          url: 'https://pubs.acs.org/doi/10.1021/acs.chemrev.4c00055' 
        },
        { 
          id: '3', 
          coverImage: '/covoer/공학기술3.jpg', 
          englishTitle: 'AI-Driven Robotic Chemist for Autonomous Synthesis of Organic Molecules', 
          koreanTitle: '유기 분자를 자동 합성하는 | AI 기반 로봇 화학자', 
          url: 'https://www.science.org/doi/10.1126/sciadv.adj0461' 
        },
      ]
    },
    {
      id: 'arts',
      title: '예술·문화',
      papers: [
        { 
          id: '1', 
          coverImage: '/covoer/예술문화1.png', 
          englishTitle: 'Designing for Death: The Bizarre Appeal of Aestheticizing the Afterlife', 
          koreanTitle: '죽음을 디자인하다: 사후 세계를 | 미학적으로 꾸미는 기묘한 매력', 
          url: 'https://www.architecturaldigest.com/story/designing-for-death-the-bizarre-appeal-of-aestheticizing-the-afterlife' 
        },
        { 
          id: '2', 
          coverImage: '/covoer/예술문화2.png', 
          englishTitle: 'Born-Digital Memes as Archival Discourse: A Linked-Data Approach', 
          koreanTitle: '디지털 밈을 ‘역사 기록’으로 다루기: | 링크드 데이터 기반 아카이브 실험', 
          url: 'https://www.mdpi.com/2673-5172/6/1/28' 
        },
        { 
          id: '3', 
          coverImage: '/covoer/예술문화3.png', 
          englishTitle: 'Scented Scenographics and Olfactory Art: Making Sense of Scent in the Museum', 
          koreanTitle: '박물관에서 냄새(향기)를 | 전시 요소로 사용하는 실험적 연구', 
          url: 'https://www.tandfonline.com/doi/full/10.1080/00233609.2020.1775696' 
        },
      ]
    }
  ]
  
  return (
    <div className="min-h-screen px-8 py-8">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-2">링기의 배달</h1>
        <p className="text-gray-400 mb-8">
          링기가 흥미로운 종이들을 배달해주었어요!<br/>
          인문·사회, 자연과학, 공학·기술, 예술·문화의 흥미로운 이야기를 영어로 만나보며, 영어 실력은 물론 교양의 폭까지 함께 넓혀보세요!
        </p>
        
        {/* 주제별 섹션 */}
        <div className="bg-white rounded-lg p-8 text-black space-y-20">
          {topics.map((topic, index) => {
            const ref = sectionRefs[topic.id]
            
            return (
              <section
                key={topic.id}
                ref={ref}
                className="border-b border-gray-200 pb-16 last:border-b-0 last:pb-0"
              >
                {/* 섹션 제목 */}
                <div className="flex items-center justify-center mb-12">
                  <div className="relative inline-block">
                    <h2 className="text-3xl font-bold text-gray-800 relative z-10">
                      <span className="mr-3">{topicEmojis[topic.title] || ''}</span>
                      {topic.title}
                    </h2>
                    {/* 형광펜 효과 */}
                    <div
                      className="absolute bottom-1 left-0 right-0 h-4 opacity-40 -z-0"
                      style={{
                        backgroundColor: getTopicColor(topic.title),
                        transform: 'skewX(-12deg)',
                        width: 'calc(100% + 8px)',
                        left: '-4px'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* 논문 표지 가로 나열 */}
                <div className="flex justify-center gap-8 flex-wrap">
                  {topic.papers.map((paper) => (
                    <a
                      key={paper.id}
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                      {/* 논문 표지 이미지 */}
                      <div className="w-64 h-80 rounded-xl shadow-lg mb-4 overflow-hidden relative group-hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 group-hover:border-purple-300">
                        <Image
                          src={paper.coverImage}
                          alt={paper.englishTitle}
                          width={256}
                          height={320}
                          className="w-full h-full object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                        {/* 장식용 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        {/* 호버 시 반짝이는 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                      </div>
                      
                      {/* 제목 */}
                      <div className="text-center max-w-64 px-2">
                        <p className="text-base font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                          {paper.englishTitle.split('|').map((part, index) => (
                            <span key={index}>
                              {part}
                              {index < paper.englishTitle.split('|').length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {paper.koreanTitle.split('|').map((part, index) => (
                            <span key={index}>
                              {part}
                              {index < paper.koreanTitle.split('|').length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )
          })}
          
          {/* 하단 감사 메시지 */}
          <div className="flex flex-col items-center justify-center pt-2 pb-8">
            <Image
              src="/ghost_5.png"
              alt="링기"
              width={120}
              height={120}
              className="mb-4"
            />
            <p className="text-lg text-gray-700 text-center">
              링기의 배달함을 열어봐 주셔서 감사합니다!
            </p>
          </div>
        </div>
      </div>
      
      {/* ghost_7.png 이미지 */}
      <div className="fixed bottom-8 right-8 z-10">
        <div className="relative group">
          <Image
            src="/ghost_7.png"
            alt="링기"
            width={150}
            height={150}
            className="animate-float-slow"
          />
          {/* 말풍선 표시 */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none">
            <div className="bg-gray-700 text-white text-sm px-4 py-3 rounded-lg relative shadow-lg text-center min-w-[160px]">
              이미지를 클릭하면<br/>
              논문 혹은 기사<br/>
              페이지로 이동합니다!
              {/* 아래쪽 삼각형 (꼬리) */}
              <div className="absolute top-full left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

