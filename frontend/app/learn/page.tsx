'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import FileUpload from '@/components/FileUpload'
import TranslationView from '@/components/TranslationView'
import WordOrganization from '@/components/WordOrganization'
import LoadingScreen from '@/components/LoadingScreen'
import Toast from '@/components/Toast'
import { apiClient } from '@/lib/api'

export default function LearnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // 초기 step은 URL 파라미터에서 가져오거나, 없으면 1로 설정
  const initialStep = searchParams?.get('step') ? parseInt(searchParams.get('step')!) : null
  const [step, setStep] = useState(initialStep || 1)
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

  // URL 파라미터에서 studyId를 받아 기존 학습 불러오기
  useEffect(() => {
    const studyId = searchParams?.get('studyId')
    const stepParam = searchParams?.get('step')
    
    if (studyId) {
      // step 파라미터를 loadStudy에 전달 (loadStudy에서 step 설정)
      const stepValue = stepParam ? parseInt(stepParam) : null
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
          console.warn('Paragraphs is not an array:', paragraphs)
          paragraphs = []
        }
        
        console.log('Loading study data:', {
          paragraphs_type: typeof paragraphs,
          paragraphs_is_array: Array.isArray(paragraphs),
          paragraphs_length: paragraphs.length,
          paragraphs_sample: paragraphs.length > 0 ? paragraphs[0] : null,
          english_text_exists: !!study.english_text,
          english_text_length: study.english_text ? study.english_text.length : 0,
          full_study: study,
          url_step: urlStep,
          current_step: study.current_step
        })
        
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
        
        // translationData 설정
        // paragraphs가 있으면 반드시 translationData 설정
        if (paragraphs.length > 0) {
          setTranslationData({
            paragraphs: paragraphs,
            words: []
          })
          console.log('✅ TranslationData set successfully with', paragraphs.length, 'paragraphs')
        } else {
          // paragraphs가 없으면 null로 설정
          setTranslationData(null)
          console.warn('⚠️ No paragraphs found, translationData set to null')
        }
        
        // step 설정: URL 파라미터의 step을 우선 사용, 없으면 current_step 사용
        // paragraphs가 없으면 step 1로, 있으면 current_step 사용
        let targetStep: number
        
        if (paragraphs.length === 0) {
          // paragraphs가 없으면 step 1로 강제 설정
          targetStep = 1
        } else {
          // URL에 step 파라미터가 있고 유효하면 우선 사용 (2 또는 3만 허용)
          if (urlStep && (urlStep === 2 || urlStep === 3)) {
            targetStep = urlStep
            console.log('✅ Using URL step parameter:', urlStep)
          } else {
            // paragraphs가 있으면 current_step 사용
            // current_step이 2 또는 3이면 그대로 사용
            // current_step이 1이거나 없으면 2로 설정 (번역이 완료된 상태)
            if (study.current_step === 2 || study.current_step === 3) {
              targetStep = study.current_step
              console.log('✅ Using DB current_step:', study.current_step)
            } else {
              // current_step이 1이거나 없거나 다른 값이면 2로 설정
              targetStep = 2
              console.log('⚠️ Using default step 2 (current_step is invalid)')
            }
          }
        }
        
        // step 설정 (URL 파라미터가 있으면 우선 사용, 없으면 DB의 current_step 사용)
        console.log('🎯 Final target step:', targetStep)
        setStep(targetStep)
        
        console.log('Loaded study:', {
          title: study.title,
          current_step: study.current_step,
          target_step: targetStep,
          paragraphs_count: paragraphs.length,
          has_translation_data: paragraphs.length > 0,
          has_english_text: !!study.english_text,
          extracted_text_length: study.english_text ? study.english_text.length : 0
        })
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
      alert('제목을 입력해주세요.')
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
      })

      setSavedStudyId(result.study_id)
      // 토스트 메시지를 잠시 표시한 후 닫기
      setTimeout(() => {
        setShowSavingToast(false)
        alert('내 학습에 저장되었습니다!')
      }, 500)
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
          <div className="text-center">
            <div className="text-6xl mb-4">😊</div>
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
      
      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-lg p-8 text-black">
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
          />
        )}

        {step === 3 && translationData && (
          <WordOrganization
            title={title}
            translationData={translationData}
            studyId={savedStudyId}
          />
        )}
      </div>
    </div>
  )
}

