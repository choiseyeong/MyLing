'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, Study } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

export default function MyPage() {
  const router = useRouter()
  const [studies, setStudies] = useState<Study[]>([])
  const [sortBy, setSortBy] = useState<'title' | 'recent'>('recent')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    loadStudies()
  }, [])

  const loadStudies = async () => {
    try {
      const data = await apiClient.getStudyList()
      setStudies(data)
    } catch (error) {
      console.error('Failed to load studies:', error)
    }
  }

  const [deleteModal, setDeleteModal] = useState<{ studyId: number; title: string } | null>(null)

  const handleDelete = async (studyId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const study = studies.find(s => s.id === studyId)
    if (study) {
      setDeleteModal({ studyId, title: study.title })
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    try {
      await apiClient.deleteStudy(deleteModal.studyId)
      await loadStudies()
      setDeleteModal(null)
    } catch (error) {
      console.error('Failed to delete study:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleTopicClick = (topic: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation()
    if (topic && topic !== '기타') {
      setSelectedTopic(topic)
    }
  }

  // 주제 텍스트 통일
  const normalizeTopic = (topic: string | undefined): string => {
    if (!topic) return ''
    switch (topic) {
      case '인문':
        return '인문·사회'
      case '자연과학':
        return '자연과학'
      case '공학·기술':
        return '공학·기술'
      case '예술·문화':
        return '예술·문화'
      default:
        return topic
    }
  }

  const getTopicColor = (topic: string | undefined) => {
    if (!topic) return { bg: 'bg-gray-100', text: 'text-gray-600', hover: 'hover:bg-gray-200' }
    
    switch (topic) {
      case '인문':
      case '인문·사회':
        return { bg: '#3B82F6', text: 'text-white', hover: 'hover:opacity-90' } // 파란계열
      case '자연과학':
        return { bg: '#10B981', text: 'text-white', hover: 'hover:opacity-90' } // 초록
      case '공학·기술':
        return { bg: '#F59E0B', text: 'text-white', hover: 'hover:opacity-90' } // 노랑~주황
      case '예술·문화':
        return { bg: '#EC4899', text: 'text-white', hover: 'hover:opacity-90' } // 분홍
      case '기타':
        return { bg: 'bg-gray-100', text: 'text-gray-600', hover: 'hover:bg-gray-200' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', hover: 'hover:bg-gray-200' }
    }
  }

  const getStepLabel = (step: number) => {
    const steps = ['업로드', '번역하기', '단어 정리']
    if (step >= 1 && step <= 3) {
      return `Step ${step}. ${steps[step - 1]}`
    }
    return `Step ${step}`
  }

  const sortedStudies = [...studies].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    } else {
      return (
        new Date(b.last_studied_date).getTime() -
        new Date(a.last_studied_date).getTime()
      )
    }
  })

  if (studies.length === 0) {
    return (
      <div className="min-h-screen px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-gray-400 mb-8">
            내가 저장한 지문과 학습 기록을 확인하세요.
          </p>

          <div className="bg-white rounded-lg p-16 text-center text-black">
            <p className="text-xl mb-4">아직 학습 기록이 없습니다!</p>
            <Link
              href="/learn"
              className="text-primary hover:underline text-lg"
            >
              지금 바로 학습 시작하기 &gt;
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-8 py-8">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-2">나의 학습</h1>
        <p className="text-gray-400 mb-8">
          내가 저장한 지문과 학습 기록을 확인하세요.
        </p>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-lg">
              지금까지{' '}
              <span className="text-primary font-bold">{studies.length}개</span>
              의 지문을 학습했어요!
            </p>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'title' | 'recent')
              }
              className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              <option value="title">제목순</option>
              <option value="recent">최근 학습한 순</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {sortedStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-lg p-6 text-black relative hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                router.push(`/learn?studyId=${study.id}&step=${study.current_step}`)
                if (typeof window !== 'undefined') {
                  setTimeout(() => window.scrollTo(0, 0), 100)
                }
              }}
            >
              <button
                onClick={(e) => handleDelete(study.id, e)}
                className="absolute top-6 right-4 text-gray-400 hover:text-red-500 z-10"
              >
                🗑️
              </button>

              <div className="flex items-start gap-3 mb-2 pr-1">
                <div className="text-2xl flex-shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 pr-5">
                    <h3 
                      className="text-xl font-bold truncate flex-1 min-w-0"
                      style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                        lineHeight: '1.5'
                      }}
                    >
                      {study.title}
                    </h3>
                    {study.topic && (
                      <div className={`relative flex-shrink-0 ${study.topic !== '기타' ? 'group' : ''}`}>
                        <button
                          onClick={(e) => handleTopicClick(study.topic, e)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                            (() => {
                              const topicColor = getTopicColor(study.topic)
                              return typeof topicColor.bg === 'string' && topicColor.bg.startsWith('#')
                                ? `${topicColor.text} ${topicColor.hover}`
                                : `${topicColor.bg} ${topicColor.text} ${topicColor.hover}`
                            })()
                          }`}
                          style={
                            (() => {
                              const topicColor = getTopicColor(study.topic)
                              return typeof topicColor.bg === 'string' && topicColor.bg.startsWith('#')
                                ? { backgroundColor: topicColor.bg }
                                : undefined
                            })()
                          }
                        >
                          {normalizeTopic(study.topic)}
                        </button>
                        {study.topic !== '기타' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap relative">
                              클릭!
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    마지막 학습일: {study.last_studied_date}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    단어 수: {study.word_count}개
                  </p>
                  <p className="text-sm text-gray-600">
                    &gt; {getStepLabel(study.current_step)}에서 학습을
                    중단했어요.
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/learn?studyId=${study.id}&step=${study.current_step}`)
                  if (typeof window !== 'undefined') {
                    setTimeout(() => window.scrollTo(0, 0), 100)
                  }
                }}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark float-right"
              >
                바로가기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 주제 클릭 모달 */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                띵동!
              </h3>
              <div className="flex justify-center mb-4">
                <Image
                  src="/ghost_8.png"
                  alt="링기"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <p className="text-base text-gray-800 mb-4">
                이 주제와 관련된 흥미로운<br/>
                논문을 링기가 들고왔어요!
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    router.push(`/delivery?topic=${selectedTopic}`, { scroll: false })
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  이동하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                정말 삭제하시겠습니까?
              </h3>
              <p className="text-gray-600 mb-6">
                "{deleteModal.title}" 학습 기록이 삭제됩니다.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


