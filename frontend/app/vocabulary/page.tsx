'use client'

import { useState, useEffect, useMemo } from 'react'
import { apiClient, Word } from '@/lib/api'

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([])
  const [allWords, setAllWords] = useState<Word[]>([]) // 원본 데이터 저장
  const [filter, setFilter] = useState<'all' | 'by-passage'>('all')
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null)
  const [showUnknownOnly, setShowUnknownOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc') // 내림차순이 기본 (최근 학습한 지문이 위)
  const [fadingOutWords, setFadingOutWords] = useState<Set<number>>(new Set()) // 페이드아웃 중인 단어들
  const [undoQueue, setUndoQueue] = useState<Map<number, NodeJS.Timeout>>(new Map()) // 복구 가능한 단어들의 타이머

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    setWords(applyFilters(allWords))
  }, [allWords, filter, selectedStudyId, showUnknownOnly, sortOrder])

  const loadWords = async () => {
    try {
      const data = await apiClient.getVocabulary()

      // 원본 데이터 저장
      setAllWords(data)

      setWords(applyFilters(data))
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
    const word = words.find(w => w.id === wordId)
    if (!word) return

    // 페이드아웃 중인 단어를 다시 클릭한 경우 (복구)
    if (fadingOutWords.has(wordId)) {
      const timeoutId = undoQueue.get(wordId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        setUndoQueue(prev => {
          const newMap = new Map(prev)
          newMap.delete(wordId)
          return newMap
        })
        setFadingOutWords(prev => {
          const newSet = new Set(prev)
          newSet.delete(wordId)
          return newSet
        })
      }
      return
    }

    // 모르는 단어 보기가 켜져 있고, 단어를 "알고 있음"으로 변경하는 경우
    if (showUnknownOnly && !currentKnown) {
      // 페이드아웃 시작
      setFadingOutWords(prev => new Set(prev).add(wordId))
      
      // 4초 후 실제로 제거
      const timeoutId = setTimeout(() => {
        setFadingOutWords(prev => {
          const newSet = new Set(prev)
          newSet.delete(wordId)
          return newSet
        })
        
        // 실제 상태 업데이트
        setWords((prevWords) =>
          prevWords.map((w) =>
            w.id === wordId ? { ...w, known: true } : w
          )
        )
        setAllWords((prevWords) =>
          prevWords.map((w) =>
            w.id === wordId ? { ...w, known: true } : w
          )
        )
        
        // API 호출
        apiClient.markWord(wordId, true).catch(console.error)
        
        // 복구 큐에서 제거
        setUndoQueue(prev => {
          const newMap = new Map(prev)
          newMap.delete(wordId)
          return newMap
        })
      }, 4000)
      
      // 복구 큐에 추가
      setUndoQueue(prev => new Map(prev).set(wordId, timeoutId))
      
      return
    }

    // 일반적인 경우 (즉시 업데이트)
    setWords((prevWords) =>
      prevWords.map((w) =>
        w.id === wordId ? { ...w, known: !currentKnown } : w
      )
    )
    setAllWords((prevWords) =>
      prevWords.map((w) =>
        w.id === wordId ? { ...w, known: !currentKnown } : w
      )
    )

    try {
      await apiClient.markWord(wordId, !currentKnown)
      const data = await apiClient.getVocabulary()
      setAllWords(data)
      setWords(applyFilters(data))
    } catch (error) {
      console.error('Failed to mark word:', error)
      // 실패 시 원래 상태로 복구
      setWords((prevWords) =>
        prevWords.map((w) =>
          w.id === wordId ? { ...w, known: currentKnown } : w
        )
      )
      setAllWords((prevWords) =>
        prevWords.map((w) =>
          w.id === wordId ? { ...w, known: currentKnown } : w
        )
      )
    }
  }

  const uniqueStudies = useMemo(
    () =>
      Array.from(
        new Map(
          allWords
            .filter((w) => w.study_id)
            .map((w) => [w.study_id, w.study_title])
        ).entries()
      ),
    [allWords]
  )

  function applyFilters(source: Word[]) {
    let filtered = source
    if (filter === 'by-passage') {
      filtered = selectedStudyId
        ? filtered.filter((word) => word.study_id === selectedStudyId)
        : filtered
    }
    if (showUnknownOnly) {
      filtered = filtered.filter((word) => !word.known)
    }
    
    // 정렬: 최근 학습한 지문의 단어가 위에 오도록 (기본: 내림차순)
    filtered = [...filtered].sort((a, b) => {
      // study_last_studied_date가 있으면 그것을 사용, 없으면 study_id 사용
      const dateA = a.study_last_studied_date || (a.study_id ? String(a.study_id) : '0')
      const dateB = b.study_last_studied_date || (b.study_id ? String(b.study_id) : '0')
      
      if (sortOrder === 'desc') {
        // 내림차순: 최근 학습한 것이 위
        return dateB.localeCompare(dateA)
      } else {
        // 오름차순: 오래된 것이 위
        return dateA.localeCompare(dateB)
      }
    })
    
    return filtered
  }

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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">정렬:</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400"
                      style={{
                        backgroundColor: '#F3F0FF',
                      }}
                    >
                      <option value="desc">최근 학습순 (내림차순)</option>
                      <option value="asc">오래된 학습순 (오름차순)</option>
                    </select>
                  </div>
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

              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 w-1/8">단어</th>
                    <th className="text-left py-2" style={{ width: '45%' }}>뜻</th>
                    {filter === 'all' && (
                      <th className="text-left py-2" style={{ width: '30%' }}>출처(지문 제목)</th>
                    )}
                    <th className="text-right py-2 w-1/12"></th>
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
                    words.map((word) => {
                      const isFadingOut = fadingOutWords.has(word.id)
                      
                      return (
                      <tr 
                        key={word.id} 
                        className={`border-b hover:bg-gray-50 transition-opacity ${
                          isFadingOut ? 'opacity-0' : 'opacity-100'
                        }`}
                        style={isFadingOut ? { transitionDuration: '4000ms' } : {}}
                      >
                        <td className="py-3">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleKnown(word.id, word.known)
                              }
                              className={`w-4 h-4 rounded-full mr-2 relative group ${
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
                              title={word.known ? '' : '이제 아는 단어에요!'}
                            >
                              {!word.known && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  이제 아는 단어에요!
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                                </span>
                              )}
                            </button>
                            {word.word}
                          </div>
                        </td>
                        <td className="py-3">
                          {word.meaning ? (
                            <div className="break-words">
                              {word.meaning}
                            </div>
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
                          <td className="py-3 text-gray-600 whitespace-nowrap">
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
                      )
                    })
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


