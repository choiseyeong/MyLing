'use client'

import { generatePDFStep2 } from '@/lib/pdfGenerator'

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
  onShowPdfWarning?: () => void
  uploadedFiles?: File[]
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
  onShowPdfWarning,
  uploadedFiles = [],
}: TranslationViewProps) {
  // 주제 색상 가져오기
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

  // 파일명 추출 (확장자 제거)
  const getFileNamePlaceholder = () => {
    if (uploadedFiles.length === 0) {
      return '제목을 입력해 주세요.'
    }
    
    if (uploadedFiles.length === 1) {
      const fileName = uploadedFiles[0].name
      // 확장자 제거
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      return nameWithoutExt || fileName
    }
    
    // 여러 파일인 경우 첫 번째 파일명 사용
    const firstFileName = uploadedFiles[0].name
    const nameWithoutExt = firstFileName.replace(/\.[^/.]+$/, '')
    return `${nameWithoutExt || firstFileName} 외 ${uploadedFiles.length - 1}개`
  }
  const handlePdfSave = async () => {
    if (!saved) {
      if (onShowPdfWarning) {
        onShowPdfWarning()
      }
      return
    }

    if (!title || !translationData) {
      alert('제목과 번역 데이터가 필요합니다.')
      return
    }

    try {
      await generatePDFStep2(title, translationData.paragraphs)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF 생성에 실패했습니다.')
    }
  }
  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* 동적 로딩 애니메이션 */}
        <div className="relative mb-6">
          {/* 외부 회전 링 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          {/* 내부 펄스 링 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary rounded-full animate-pulse"></div>
          </div>
          {/* 중앙 점들 */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
            </div>
          </div>
        </div>
        
        {/* 텍스트 애니메이션 */}
        <div className="text-center">
          <p className="text-xl mb-2 font-semibold">
            번역 중입니다
            <span className="inline-block ml-1">
              <span className="animate-pulse" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            </span>
          </p>
          <p className="text-gray-600 animate-pulse">AI가 한 줄씩 분석하고 있어요</p>
        </div>
        
        {/* 진행 바 애니메이션 */}
        <div className="w-64 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-400 via-primary to-purple-400 rounded-full animate-progress"></div>
        </div>
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
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={getFileNamePlaceholder()}
              className="text-2xl font-bold border-b-2 border-gray-300 focus:border-primary outline-none flex-1"
            />
            {translationData?.topic && (() => {
              const topicColor = getTopicColor(translationData.topic)
              const displayTopic = normalizeTopic(translationData.topic)
              return (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    typeof topicColor.bg === 'string' && topicColor.bg.startsWith('#')
                      ? `${topicColor.text} ${topicColor.hover}`
                      : `${topicColor.bg} ${topicColor.text} ${topicColor.hover}`
                  }`}
                  style={
                    typeof topicColor.bg === 'string' && topicColor.bg.startsWith('#')
                      ? { backgroundColor: topicColor.bg }
                      : undefined
                  }
                >
                  {displayTopic}
                </span>
              )
            })()}
          </div>
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
            onClick={handlePdfSave}
            disabled={!saved}
            className={`px-4 py-2 rounded-lg ${
              saved
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
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
    </div>
  )
}

