'use client'

import { useState, useEffect } from 'react'
import { apiClient, Word } from '@/lib/api'

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([])
  const [allWords, setAllWords] = useState<Word[]>([]) // 원본 데이터 저장
  const [filter, setFilter] = useState<'all' | 'by-passage'>('all')
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null)
  const [showUnknownOnly, setShowUnknownOnly] = useState(false)

  useEffect(() => {
    loadWords()
  }, [filter, selectedStudyId])

  // showUnknownOnly 변경 시에는 로딩 없이 클라이언트 측에서만 필터링
  useEffect(() => {
    if (allWords.length > 0) {
      if (showUnknownOnly) {
        setWords(allWords.filter((word) => !word.known))
      } else {
        setWords(allWords)
      }
    }
  }, [showUnknownOnly, allWords])

  const loadWords = async () => {
    try {
      const data = await apiClient.getVocabulary(
        filter === 'by-passage' ? selectedStudyId || undefined : undefined
      )

      // 원본 데이터 저장
      setAllWords(data)

      // 필터 적용
      if (showUnknownOnly) {
        setWords(data.filter((word) => !word.known))
      } else {
        setWords(data)
      }
    } catch (error) {
      console.error('Failed to load words:', error)
    }
  }

  const handleDeleteWord = async (wordId: number) => {
    // 옵티미스틱 업데이트: 먼저 UI에서 단어 제거
    const deletedWord = words.find(w => w.id === wordId)
    setWords(prevWords => prevWords.filter(word => word.id !== wordId))
    setAllWords(prevAllWords => prevAllWords.filter(word => word.id !== wordId))
    
    try {
      await apiClient.deleteWord(wordId)
      // 성공 시 이미 UI가 업데이트되었으므로 추가 작업 불필요
    } catch (error) {
      console.error('Failed to delete word:', error)
      // 실패 시 원래 상태로 복구
      if (deletedWord) {
        setWords(prevWords => [...prevWords, deletedWord].sort((a, b) => a.id - b.id))
        setAllWords(prevAllWords => [...prevAllWords, deletedWord].sort((a, b) => a.id - b.id))
      }
      alert('단어 삭제에 실패했습니다.')
    }
  }

  const handleToggleKnown = async (wordId: number, currentKnown: boolean) => {
    // 옵티미스틱 업데이트: UI 및 원본 데이터 동기화
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === wordId ? { ...word, known: !currentKnown } : word
      )
    )
    setAllWords((prevWords) =>
      prevWords.map((word) =>
        word.id === wordId ? { ...word, known: !currentKnown } : word
      )
    )

    try {
      await apiClient.markWord(wordId, !currentKnown)
      const data = await apiClient.getVocabulary(
        filter === 'by-passage' ? selectedStudyId || undefined : undefined
      )
      setAllWords(data)
      setWords(showUnknownOnly ? data.filter((word) => !word.known) : data)
    } catch (error) {
      console.error('Failed to mark word:', error)
      // 실패 시 원래 상태로 복구
      setWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, known: currentKnown } : word
        )
      )
      setAllWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, known: currentKnown } : word
        )
      )
    }
  }

  const uniqueStudies = Array.from(
    new Map(
      words
        .filter((w) => w.study_id)
        .map((w) => [w.study_id, w.study_title])
    ).entries()
  )

  return (
    <div className="min-h-screen px-8 py-8">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-4xl font-bold mb-2">단어장 Vocabulary</h1>
        <p className="text-gray-400 mb-8">
          내가 저장한 단어들을 확인하고 복습할 수 있습니다
        </p>

        <div className="bg-white rounded-lg p-6 text-black">
          {/* 필터 탭 */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 ${
                filter === 'all'
                  ? 'border-b-2 border-primary text-primary font-semibold'
                  : 'text-gray-600'
              }`}
            >
              전체 단어
            </button>
            <button
              onClick={() => setFilter('by-passage')}
              className={`px-4 py-2 ${
                filter === 'by-passage'
                  ? 'border-b-2 border-primary text-primary font-semibold'
                  : 'text-gray-600'
              }`}
            >
              지문별 단어
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* 왼쪽: 지문 목록 (지문별 필터일 때만) */}
            {filter === 'by-passage' && (
              <div className="col-span-1">
                <h3 className="font-semibold mb-4">지문 제목</h3>
                <div className="space-y-2">
                  {uniqueStudies.map(([studyId, studyTitle]) => (
                    <button
                      key={studyId}
                      onClick={() =>
                        setSelectedStudyId(
                          selectedStudyId === studyId ? null : (studyId as number)
                        )
                      }
                      className={`w-full text-left p-3 rounded ${
                        selectedStudyId === studyId
                          ? 'bg-gray-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">📄</span>
                      {studyTitle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 오른쪽: 단어 목록 */}
            <div className={filter === 'by-passage' ? 'col-span-3' : 'col-span-4'}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">단어 목록</h3>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUnknownOnly}
                      onChange={(e) => setShowUnknownOnly(e.target.checked)}
                      className="w-5 h-5 text-gray-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 cursor-pointer transition-all duration-200 ease-in-out appearance-none checked:bg-gray-600 checked:border-gray-600 checked:relative"
                      style={{
                        backgroundImage: showUnknownOnly 
                          ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E\")"
                          : 'none',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <span className="text-sm text-gray-600">모르는 단어만 보기</span>
                  </label>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">단어</th>
                    <th className="text-left py-2">뜻</th>
                    {filter === 'all' && (
                      <th className="text-left py-2">출처(지문 제목)</th>
                    )}
                    <th className="text-right py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {words.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        저장된 단어가 없습니다. <br/> 모든 단어를 학습하셨군요!
                      </td>
                    </tr>
                  ) : (
                    words.map((word) => (
                      <tr key={word.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <button
                            onClick={() =>
                              handleToggleKnown(word.id, word.known)
                            }
                            className={`w-4 h-4 rounded-full mr-2 ${
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
                          {word.word}
                        </td>
                        <td className="py-3">
                          {word.meaning ? (
                            word.meaning
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">-</span>
                              <button
                                onClick={async () => {
                                  try {
                                    const result = await apiClient.fetchWordMeaning(word.word)
                                    if (result.success) {
                                      await apiClient.updateWordMeaning(word.id, result.meaning)
                                      await loadWords()
                                    } else {
                                      alert('단어의 뜻을 찾을 수 없습니다.')
                                    }
                                  } catch (error) {
                                    console.error('Failed to fetch meaning:', error)
                                    alert('뜻을 가져오는데 실패했습니다.')
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                              >
                                뜻 가져오기
                              </button>
                            </div>
                          )}
                        </td>
                        {filter === 'all' && (
                          <td className="py-3 text-gray-600">
                            {word.study_title || '-'}
                          </td>
                        )}
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteWord(word.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


