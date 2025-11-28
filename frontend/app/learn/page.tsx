'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
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
  // studyId가 있으면 loadStudy에서 step을 설정하므로 초기값은 null
  // studyId가 없으면 새 학습이므로 step 1
  const studyId = searchParams?.get('studyId')
  const [step, setStep] = useState(studyId ? null : 1)
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
        // 백엔드에서 이미 파싱된 배열을 반환하므로, 추가 파싱은 최소화
        let paragraphs = study.paragraphs || []
        
        // paragraphs가 문자열이면 JSON 파싱 시도 (혹시 모를 경우 대비)
        if (typeof paragraphs === 'string') {
          try {
            const parsed = JSON.parse(paragraphs)
            paragraphs = parsed
          } catch (e) {
            console.error('Failed to parse paragraphs as JSON:', e, paragraphs)
            paragraphs = []
          }
        }
        
        // paragraphs가 배열이 아니면 처리
        if (!Array.isArray(paragraphs)) {
          console.warn('Paragraphs is not an array:', paragraphs, typeof paragraphs)
          // 만약 객체이고 paragraphs 속성이 있으면 그것을 사용
          if (paragraphs && typeof paragraphs === 'object') {
            if ('paragraphs' in paragraphs && Array.isArray(paragraphs.paragraphs)) {
              paragraphs = paragraphs.paragraphs
            } else if (Array.isArray(paragraphs)) {
              // 이미 배열인데 타입 체크가 잘못된 경우
              paragraphs = paragraphs
            } else {
              console.error('Paragraphs is not in expected format:', paragraphs)
              paragraphs = []
            }
          } else {
            paragraphs = []
          }
        }
        
        // 최종 검증: paragraphs가 유효한 구조인지 확인
        if (Array.isArray(paragraphs) && paragraphs.length > 0) {
          // 각 paragraph가 sentences 속성을 가져야 함
          const validParagraphs = paragraphs.filter((p: any) => {
            return p && typeof p === 'object' && Array.isArray(p.sentences) && p.sentences.length > 0
          })
          if (validParagraphs.length !== paragraphs.length) {
            console.warn(`Filtered ${paragraphs.length - validParagraphs.length} invalid paragraphs`)
          }
          paragraphs = validParagraphs
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
        } else if (study.english_text && study.korean_text) {
          // paragraphs가 없지만 english_text와 korean_text가 있으면 재구성 시도
          console.warn('⚠️ No paragraphs but has english/korean text. Attempting to reconstruct...')
          try {
            // 간단한 재구성: 전체 텍스트를 하나의 paragraph로 만들기
            // 문장 단위로 분리 시도
            const englishSentences = study.english_text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0)
            const koreanSentences = study.korean_text.split(/[.!?。！？]+\s+/).filter(s => s.trim().length > 0)
            
            // 최소한의 길이로 맞추기
            const minLength = Math.min(englishSentences.length, koreanSentences.length)
            const reconstructedParagraphs = [{
              sentences: Array.from({ length: minLength }, (_, i) => ({
                english: englishSentences[i]?.trim() || '',
                korean: koreanSentences[i]?.trim() || ''
              })).filter(s => s.english && s.korean)
            }]
            
            if (reconstructedParagraphs[0].sentences.length > 0) {
              setTranslationData({
                paragraphs: reconstructedParagraphs,
                words: []
              })
              console.log('✅ TranslationData reconstructed from english/korean text with', reconstructedParagraphs[0].sentences.length, 'sentences')
            } else {
              setTranslationData(null)
              console.error('❌ Failed to reconstruct paragraphs from text')
            }
          } catch (e) {
            console.error('❌ Error reconstructing paragraphs:', e)
            setTranslationData(null)
          }
        } else {
          // paragraphs가 없으면 null로 설정
          setTranslationData(null)
          console.error('❌ No paragraphs found!', {
            study_id: study.id,
            current_step: study.current_step,
            has_english_text: !!study.english_text,
            has_korean_text: !!study.korean_text,
            raw_paragraphs: study.paragraphs,
            paragraphs_type: typeof study.paragraphs,
            paragraphs_length: Array.isArray(study.paragraphs) ? study.paragraphs.length : 'N/A'
          })
        }
        
        // step 설정: URL 파라미터의 step을 우선 사용, 없으면 current_step 사용
        // step1에서 중단하는 경우는 없으므로, step2나 step3에서만 중단 가능
        let targetStep: number
        
        // URL에 step 파라미터가 있고 유효하면 우선 사용 (2, 3만 허용, step1은 새 학습이므로)
        if (urlStep && (urlStep === 2 || urlStep === 3)) {
          targetStep = urlStep
          console.log('✅ Using URL step parameter:', urlStep)
        } else {
          // URL step이 없으면 current_step 사용
          // current_step이 2 또는 3이면 그대로 사용
          if (study.current_step === 2 || study.current_step === 3) {
            targetStep = study.current_step
            console.log('✅ Using DB current_step:', study.current_step)
          } else if (paragraphs.length > 0) {
            // paragraphs가 있으면 번역이 완료된 상태이므로 step 2로 설정
            targetStep = 2
            console.log('✅ Paragraphs exist, defaulting to step 2')
          } else {
            // paragraphs가 없고 current_step도 유효하지 않으면 step 1 (새 학습)
            targetStep = 1
            console.log('⚠️ No paragraphs and invalid current_step, defaulting to step 1')
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

  if (loading || step === null) {
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
          />
        )}

        {step === 3 && (
          translationData ? (
            <WordOrganization
              title={title}
              translationData={translationData}
              studyId={savedStudyId}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">
                번역 데이터를 불러올 수 없습니다.
              </p>
              <button
                onClick={() => {
                  if (savedStudyId) {
                    router.push(`/learn?studyId=${savedStudyId}&step=2`)
                  } else {
                    router.push('/learn')
                  }
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                번역하기로 돌아가기
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

