'use client'

import { useState, useEffect } from 'react'
import { generatePDFStep2 } from '@/lib/pdfGenerator'
import Toast from './Toast'

interface TranslationViewProps {
  title: string
  onTitleChange: (title: string) => void
  translationData: any
  isTranslating: boolean
  extractedText?: string
  onTranslate?: () => void
  onSave: () => void
  onGoToWordOrganization: () => void
  saved: boolean
}

export default function TranslationView({
  title,
  onTitleChange,
  translationData,
  isTranslating,
  extractedText,
  onTranslate,
  onSave,
  onGoToWordOrganization,
  saved,
}: TranslationViewProps) {
  const [showPdfWarningToast, setShowPdfWarningToast] = useState(false)

  // 토스트 자동 닫기
  useEffect(() => {
    if (showPdfWarningToast) {
      const timer = setTimeout(() => setShowPdfWarningToast(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [showPdfWarningToast])
  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-xl mb-2">번역 중입니다...</p>
        <p className="text-gray-600">AI가 한 줄씩 분석하고 있어요.</p>
      </div>
    )
  }

  // translationData가 없을 때 처리
  if (!translationData && !isTranslating) {
    // extractedText가 있으면 번역 시작 버튼 표시
    if (extractedText) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">번역을 시작하시겠습니까?</p>
          {onTranslate && (
            <button
              onClick={onTranslate}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold"
            >
              번역 시작하기 &gt;
            </button>
          )}
        </div>
      )
    }
    // extractedText도 없으면 에러 메시지
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">번역할 텍스트가 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">
          파일을 업로드하고 번역을 시작해주세요.
        </p>
      </div>
    )
  }
  
  // translationData가 없으면 null 반환 (로딩 중일 수 있음)
  if (!translationData) {
    return null
  }

  return (
    <div>
      {/* 제목 및 액션 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="제목을 입력해 주세요."
            className="text-2xl font-bold border-b-2 border-gray-300 focus:border-primary outline-none w-full"
          />
        </div>
        <div className="flex gap-3 ml-4">
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded-lg ${
              saved
                ? 'bg-gray-200 text-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={saved}
          >
            {saved ? '내 학습에 저장됨' : '내 학습에 저장'}
          </button>
          <button
            onClick={async () => {
              if (!translationData) {
                setShowPdfWarningToast(true)
                return
              }
              if (!saved) {
                setShowPdfWarningToast(true)
                return
              }
              try {
                await generatePDFStep2(title || '제목 없음', translationData)
              } catch (error) {
                console.error('PDF 생성 실패:', error)
                setShowPdfWarningToast(true)
              }
            }}
            className={`px-4 py-2 rounded-lg ${
              saved
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!saved}
          >
            PDF 저장하기
          </button>
          <button
            onClick={onGoToWordOrganization}
            className={`px-4 py-2 rounded-lg transition-colors ${
              saved
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            단어 정리하기 &gt;
          </button>
        </div>
      </div>

      {/* 번역 결과 */}
      <div className="space-y-8">
        {translationData.paragraphs.map((paragraph: any, pIndex: number) => (
          <div key={pIndex}>
            <h3 className="text-lg font-semibold mb-4">
              | Paragraph {pIndex + 1}
            </h3>
            <div className="space-y-4">
              {paragraph.sentences.map((sentence: any, sIndex: number) => (
                <div
                  key={sIndex}
                  className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded"
                >
                  <div className="text-gray-800">{sentence.english}</div>
                  <div className="text-gray-600">{sentence.korean}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PDF 저장 경고 토스트 */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showPdfWarningToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm">
          먼저 내 학습에 저장을 완료해 주세요.
        </div>
      </div>
    </div>
  )
}

