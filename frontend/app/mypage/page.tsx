'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, Study } from '@/lib/api'
import Link from 'next/link'

export default function MyPage() {
  const router = useRouter()
  const [studies, setStudies] = useState<Study[]>([])
  const [sortBy, setSortBy] = useState<'title' | 'recent'>('title')

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

  const handleDelete = async (studyId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await apiClient.deleteStudy(studyId)
        await loadStudies()
      } catch (error) {
        console.error('Failed to delete study:', error)
        alert('삭제에 실패했습니다.')
      }
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
              onClick={() => router.push(`/learn?studyId=${study.id}&step=${study.current_step}`)}
            >
              <button
                onClick={(e) => handleDelete(study.id, e)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                🗑️
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{study.title}</h3>
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
                  // current_step 정보를 URL에 포함하여 전달
                  router.push(`/learn?studyId=${study.id}&step=${study.current_step}`)
                }}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark float-right"
              >
                바로가기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


