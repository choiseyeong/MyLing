'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, Word } from '@/lib/api'
import { generatePDFStep3 } from '@/lib/pdfGenerator'

interface WordOrganizationProps {
  title: string
  translationData: any
  studyId: number | null
  saved?: boolean
  onShowPdfWarning?: () => void
}

export default function WordOrganization({
  title,
  translationData,
  studyId,
  saved = true,
  onShowPdfWarning,
}: WordOrganizationProps) {
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
      // 모든 단어 (알고 있는 단어와 모르는 단어 모두) 포함
      await generatePDFStep3(title, translationData.paragraphs, words)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF 생성에 실패했습니다.')
    }
  }
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [loadingMeanings, setLoadingMeanings] = useState<Set<number>>(new Set())
  
  
  const handleToggleKnown = async (wordId: number, currentKnown: boolean) => {
    // 옵티미스틱 업데이트: 먼저 UI를 업데이트
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === wordId ? { ...word, known: !currentKnown } : word
      )
    )
    
    try {
      await apiClient.markWord(wordId, !currentKnown)
      // 성공 시 전체 목록 다시 불러오기 (로딩 없이)
      const wordList = await apiClient.getVocabulary(studyId || undefined)
      setWords(wordList)
    } catch (error) {
      console.error('Failed to mark word:', error)
      // 실패 시 원래 상태로 복구
      setWords(prevWords => 
        prevWords.map(word => 
          word.id === wordId ? { ...word, known: currentKnown } : word
        )
      )
    }
  }

  useEffect(() => {
    if (studyId) {
      loadWords()
    }
  }, [studyId])

  const loadWords = async () => {
    try {
      const wordList = await apiClient.getVocabulary(studyId || undefined)
      setWords(wordList)
    } catch (error) {
      console.error('Failed to load words:', error)
    }
  }

  const handleWordDoubleClick = async (word: string) => {
    const cleanWord = word.trim().toLowerCase()
    if (!cleanWord || cleanWord.length < 3) return

    // 이미 저장된 단어인지 확인
    const existingWord = words.find((w) => w.word === cleanWord)
    if (existingWord) {
      alert('이미 단어장에 추가된 단어입니다.')
      return
    }

    try {
      // 단어 추가
      await apiClient.addWord(cleanWord, '', studyId || undefined)
      const wordList = await apiClient.getVocabulary(studyId || undefined)
      setWords(wordList)
      
      // 추가된 단어 찾기
      const addedWord = wordList.find((w) => w.word === cleanWord)
      if (addedWord) {
        // 로딩 상태 추가
        setLoadingMeanings((prev) => new Set(prev).add(addedWord.id))
        
        try {
          // 자동으로 뜻 가져오기
          const result = await apiClient.fetchWordMeaning(cleanWord)
          if (result.success) {
            await apiClient.updateWordMeaning(addedWord.id, result.meaning)
            await loadWords()
          } else {
            // 뜻을 찾을 수 없는 경우
            await loadWords()
          }
        } catch (error) {
          console.error('Failed to fetch meaning:', error)
          await loadWords()
        } finally {
          // 로딩 상태 제거
          setLoadingMeanings((prev) => {
            const newSet = new Set(prev)
            newSet.delete(addedWord.id)
            return newSet
          })
        }
      }
      
      setSelectedWord(cleanWord)
    } catch (error) {
      console.error('Failed to add word:', error)
      alert('단어 추가에 실패했습니다.')
    }
  }

  const handleDeleteWord = async (wordId: number) => {
    try {
      await apiClient.deleteWord(wordId)
      await loadWords()
    } catch (error) {
      console.error('Failed to delete word:', error)
    }
  }

  const handleResetAll = () => {
    if (confirm('모든 단어를 초기화하시겠습니까?')) {
      words.forEach((word) => {
        apiClient.deleteWord(word.id).catch(console.error)
      })
      setWords([])
    }
  }

  // 텍스트에서 단어 하이라이트
  const highlightWords = (text: string) => {
    if (!words.length) return text

    let highlightedText = text
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-purple-200">$&</mark>`
      )
    })
    return highlightedText
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* 왼쪽: 본문 */}
        <div className="col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            value={title}
            readOnly
            className="text-2xl font-bold border-b-2 border-gray-300 flex-1"
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

        <div className="space-y-6">
          {translationData.paragraphs.map((paragraph: any, pIndex: number) => (
            <div key={pIndex}>
              <h3 className="text-lg font-semibold mb-4">
                | Paragraph {pIndex + 1}
              </h3>
              <div className="space-y-4">
                {paragraph.sentences.map((sentence: any, sIndex: number) => (
                  <div key={sIndex} className="space-y-2">
                    <div
                      className="p-3 bg-gray-50 rounded"
                      dangerouslySetInnerHTML={{
                        __html: highlightWords(sentence.english),
                      }}
                      onDoubleClick={(e) => {
                        const selection = window.getSelection()
                        if (selection && selection.toString()) {
                          handleWordDoubleClick(selection.toString().trim())
                        }
                      }}
                    />
                    <div className="p-3 bg-gray-50 rounded text-gray-600">
                      {sentence.korean}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* 오른쪽: 단어장 */}
        <div className="col-span-1">
        <div className="sticky top-8">
        <div className="flex gap-3 mb-4 flex-wrap justify-between">
          <button
            onClick={handleResetAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            단어 전체 초기화
          </button>
          <button
            onClick={handlePdfSave}
            disabled={!saved}
            className={`px-4 py-2 rounded-lg font-semibold ${
              saved
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            PDF 저장하기 &gt;
          </button>
          <button
            onClick={() => {
              router.push('/')
              if (typeof window !== 'undefined') {
                window.scrollTo(0, 0)
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold"
          >
            홈으로
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">나의 단어장</h3>
          {words.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">+</div>
              <p className="text-sm text-gray-600">
                본문에서 단어를 더블클릭하여 '저장하기'를 눌러 나의 단어장에
                추가해 주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-start justify-between p-3 bg-white rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="relative inline-block group">
                      <button
                        onClick={() => handleToggleKnown(word.id, word.known)}
                        className={`w-4 h-4 rounded-full mr-2 inline-block ${
                          word.known ? '' : 'bg-gray-400'
                        }`}
                        style={
                          word.known
                            ? {
                                backgroundImage:
                                  'linear-gradient(180deg, #C6B3FF 0%, #7556FF 100%)',
                              }
                            : undefined
                        }
                      />
                      {/* 호버 툴팁 */}
                      <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap relative">
                          {word.known ? '아는 단어에요' : '이제 아는 단어에요'}
                          <div className="absolute top-full left-2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold">{word.word}</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {loadingMeanings.has(word.id) ? (
                        <span className="flex items-center gap-2 text-gray-500">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></span>
                          뜻을 불러오는 중입니다...
                        </span>
                      ) : word.meaning ? (
                        word.meaning
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  )
}

