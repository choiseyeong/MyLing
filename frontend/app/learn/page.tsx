'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import ProgressBar from '@/components/ProgressBar'
import FileUpload from '@/components/FileUpload'
import TranslationView from '@/components/TranslationView'
import WordOrganization from '@/components/WordOrganization'
import LoadingScreen from '@/components/LoadingScreen'
import Toast from '@/components/Toast'
import { apiClient } from '@/lib/api'

export default function LearnPage() {
  const searchParams = useSearchParams()
  // 초기 step은 URL 파라미터에서 가져오거나, 없으면 1로 설정 (안전하게 숫자로 변환)
  const stepParamRaw = searchParams?.get('step')
  const stepParam = Number(stepParamRaw)
  const safeInitialStep = [1, 2, 3].includes(stepParam) ? stepParam : 1
  const [step, setStep] = useState(safeInitialStep)

  // 페이지 로드 시 스크롤을 맨 위로 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [searchParams])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState('')
  const [translationData, setTranslationData] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [savedStudyId, setSavedStudyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSavingToast, setShowSavingToast] = useState(false)
  const [showWarningToast, setShowWarningToast] = useState(false)
  const [showTitleWarningToast, setShowTitleWarningToast] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showPdfWarningToast, setShowPdfWarningToast] = useState(false)
  useEffect(() => {
    if (!showTitleWarningToast) return
    const timer = setTimeout(() => setShowTitleWarningToast(false), 2500)
    return () => clearTimeout(timer)
  }, [showTitleWarningToast])

  useEffect(() => {
    if (!showSuccessToast) return
    const timer = setTimeout(() => setShowSuccessToast(false), 2500)
    return () => clearTimeout(timer)
  }, [showSuccessToast])

  useEffect(() => {
    if (!showPdfWarningToast) return
    const timer = setTimeout(() => setShowPdfWarningToast(false), 2500)
    return () => clearTimeout(timer)
  }, [showPdfWarningToast])


  // URL 파라미터에서 studyId를 받아 기존 학습 불러오기
  useEffect(() => {
    const studyId = searchParams?.get('studyId')
    const stepParam = searchParams?.get('step')
    
    if (studyId) {
      // step 파라미터를 loadStudy에 전달 (loadStudy에서 step 설정, 안전하게 숫자로 변환)
      const sanitizedStep = Number(stepParam)
      const stepValue = [1, 2, 3].includes(sanitizedStep) ? sanitizedStep : null
      loadStudy(parseInt(studyId), stepValue)
    } else {
      // studyId가 없으면 step을 1로 초기화 (새로운 학습 시작)
      setStep(1)
      // 다른 상태도 초기화
      setUploadedFiles([])
      setExtractedText('')
      setTranslationData(null)
      setTitle('')
      setSavedStudyId(null)
    }
  }, [searchParams])

  const loadStudy = async (studyId: number, urlStep: number | null = null) => {
    setLoading(true)
    try {
      const study = await apiClient.getStudy(studyId)
      if (study) {
        setTitle(study.title)
        setSavedStudyId(study.id)
        
        // paragraphs를 translationData 형식으로 변환
        let paragraphs = study.paragraphs || []
        
        // paragraphs가 문자열이면 JSON 파싱 시도
        if (typeof paragraphs === 'string') {
          try {
            paragraphs = JSON.parse(paragraphs)
          } catch (e) {
            console.error('Failed to parse paragraphs as JSON:', e)
            paragraphs = []
          }
        }
        
        // paragraphs가 배열이 아니면 빈 배열로 설정
        if (!Array.isArray(paragraphs)) {
          paragraphs = []
        }
        
        // paragraphs가 비어있으면 경고하고 step=1로 설정
        if (paragraphs.length === 0) {
          alert('저장된 번역 데이터가 손상되어 다시 업로드해야 합니다.')
          setStep(1)
          setTranslationData(null)
          setExtractedText('')
          setLoading(false)
          return
        }
        
        // extractedText 설정 (english_text가 있으면 사용, 없으면 paragraphs에서 추출)
        if (study.english_text) {
          setExtractedText(study.english_text)
        } else if (paragraphs.length > 0) {
          // paragraphs에서 영어 텍스트 추출
          const englishText = paragraphs
            .flatMap((p: any) => p.sentences?.map((s: any) => s.english) || [])
            .join(' ')
          if (englishText) {
            setExtractedText(englishText)
          }
        }
        
        // translationData 설정 (paragraphs가 있을 때만 실행됨)
        setTranslationData({
          paragraphs: paragraphs,
          words: []
        })
        
        // === 최종 step 결정 (URL > DB > 기본값 1) ===
        let targetStep: number
        
        // urlStep을 안전하게 숫자로 변환 및 검증
        const sanitizedUrlStep = Number(urlStep)
        const validUrlStep = [1, 2, 3].includes(sanitizedUrlStep) ? sanitizedUrlStep : null
        
        if (validUrlStep !== null) {
          targetStep = validUrlStep
        } else if (study.current_step && [1, 2, 3].includes(study.current_step)) {
          targetStep = study.current_step
        } else {
          targetStep = 1
        }
        
        setStep(targetStep)
      }
    } catch (error) {
      console.error('Failed to load study:', error)
      alert('학습을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files)
    if (files.length > 0) {
      setIsUploading(true)
      try {
        const response = await apiClient.uploadFile(files[0])
        setExtractedText(response.text)
        // step은 그대로 유지 (사용자가 번역 시작하기 버튼을 눌러야 함)
      } catch (error) {
        console.error('File upload failed:', error)
        alert('파일 업로드에 실패했습니다.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleTranslate = async () => {
    if (!extractedText) return

    setIsTranslating(true)
    try {
      const data = await apiClient.translate(extractedText)
      setTranslationData(data)
      setStep(2)
    } catch (error) {
      console.error('Translation failed:', error)
      alert('번역에 실패했습니다.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSaveToMyLearning = async () => {
    if (!title.trim() || !translationData) {
      setShowTitleWarningToast(true)
      return
    }

    setShowSavingToast(true)
    try {
      const englishText = translationData.paragraphs
        .flatMap((p: any) => p.sentences.map((s: any) => s.english))
        .join(' ')
      const koreanText = translationData.paragraphs
        .flatMap((p: any) => p.sentences.map((s: any) => s.korean))
        .join(' ')

      const result = await apiClient.saveStudy({
        title: title.trim(),
        english_text: englishText,
        korean_text: koreanText,
        paragraphs: translationData.paragraphs,
        current_step: 2, // 저장 시점에는 step 2 (번역하기 단계)
        words: [], // 단어는 사용자가 직접 더블클릭하여 추가하도록 빈 배열로 전달
        topic: translationData.topic, // 주제 분류 결과 포함
      })

      setSavedStudyId(result.study_id)
      setShowSavingToast(false)
      setShowSuccessToast(true)
    } catch (error: any) {
      setShowSavingToast(false)
      console.error('Save failed:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || '알 수 없는 오류가 발생했습니다.'
      alert(`저장에 실패했습니다.\n\n오류: ${errorMessage}`)
    }
  }

  const handleGoToWordOrganization = async () => {
    if (!savedStudyId) {
      // 귀여운 경고 토스트 메시지 표시
      setShowWarningToast(true)
      return
    }
    setStep(3)
    // current_step을 3으로 업데이트
    try {
      await apiClient.updateStudy(savedStudyId, { current_step: 3 })
    } catch (error) {
      console.error('Failed to update study step:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    )
  }

  // 번역 중일 때는 Step 2로 간주하여 진행 상태 표시
  const displayStep = isTranslating ? 2 : step

  return (
    <div className="min-h-screen px-8 py-8">
      <ProgressBar currentStep={displayStep} isTransitioning={isTranslating || isUploading} />
      
      {/* Step 2 안내 메시지 (ghost_9) */}
      {step === 2 && !isTranslating && translationData && (
        <div className="max-w-4xl mx-auto mt-6 mb-4 flex items-center justify-center gap-3">
          <div className="flex-shrink-0">
            <img 
              src="/ghost_9.png" 
              alt="안내" 
              className="w-12 h-12 ghost-scale-animation"
            />
          </div>
          <p className="text-white text-sm">
            만약 문단이 올바르게 분리되지 않았다면, <strong className="font-semibold">'문단 편집'</strong> 기능을 사용해 보세요!
          </p>
        </div>
      )}
      
      {/* 번역 중 전체 화면 로딩 */}
      {isTranslating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <LoadingScreen
              message="번역 중입니다..."
              subMessage="AI가 한 줄씩 분석하고 있어요."
            />
          </div>
        </div>
      )}

      {/* 파일 업로드 중 전체 화면 로딩 */}
      {step === 1 && isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <LoadingScreen
              message="파일을 업로드하고 있습니다..."
              subMessage="텍스트를 추출하고 있어요."
            />
          </div>
        </div>
      )}

      {/* 저장 중 토스트 메시지 */}
      <Toast
        message="저장 중입니다..."
        isVisible={showSavingToast}
        onClose={() => setShowSavingToast(false)}
        duration={5000}
      />
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showSuccessToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-primary text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold">
          내 학습에 저장되었습니다!
        </div>
      </div>
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showTitleWarningToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm">
          제목을 입력해 주세요.
        </div>
      </div>
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showPdfWarningToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm">
          먼저 내 학습에 저장해 주세요
        </div>
      </div>
      
      {/* 경고 토스트 메시지 (화면 가운데) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          showWarningToast ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowWarningToast(false)}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
            showWarningToast ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="text-center flex flex-col items-center">
            <Image src="/ghost_5.png" alt="귀여운 링기" width={120} height={120} className="mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              먼저 내 학습에 저장을 완료해 주세요!
            </h3>
            <p className="text-gray-600 mb-6">
              단어 정리하기를 사용하려면 먼저 학습 내용을 저장해야 해요.
            </p>
            <button
              onClick={() => setShowWarningToast(false)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              알겠어요!
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl w-full mx-auto mt-8 bg-white rounded-lg p-8 text-black">
        {step === 1 && !isUploading && (
          <FileUpload
            files={uploadedFiles}
            onFileUpload={handleFileUpload}
            onTranslate={handleTranslate}
          />
        )}

        {step === 2 && !isTranslating && (
          <TranslationView
            title={title}
            onTitleChange={setTitle}
            translationData={translationData}
            isTranslating={isTranslating}
            extractedText={extractedText}
            onTranslate={handleTranslate}
            onSave={handleSaveToMyLearning}
            onGoToWordOrganization={handleGoToWordOrganization}
            saved={!!savedStudyId}
            onShowPdfWarning={() => setShowPdfWarningToast(true)}
            uploadedFiles={uploadedFiles}
          />
        )}

        {step === 3 && translationData && (
          <WordOrganization
            title={title}
            translationData={translationData}
            studyId={savedStudyId}
            saved={!!savedStudyId}
            onShowPdfWarning={() => setShowPdfWarningToast(true)}
          />
        )}
      </div>

      {/* step1에서만 ghost_9와 말풍선 표시 */}
      {step === 1 && !isUploading && (
        <div className="fixed bottom-8 right-8 z-10">
          <div className="relative group">
            <Image
              src="/ghost_9.png"
              alt="링기"
              width={150}
              height={150}
              className="animate-float-slow"
            />
            {/* 말풍선 표시 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none">
              <div className="bg-gray-700 text-white text-sm px-4 py-3 rounded-lg relative shadow-lg text-center min-w-[180px]">
                번역하고자 하는 지문을<br/>업로드해 주세요!
                {/* 아래쪽 삼각형 (꼬리) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

