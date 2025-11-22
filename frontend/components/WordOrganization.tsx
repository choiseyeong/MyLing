'use client'

import { useState, useEffect } from 'react'
import { apiClient, Word } from '@/lib/api'

interface WordOrganizationProps {
  title: string
  translationData: any
  studyId: number | null
}

export default function WordOrganization({
  title,
  translationData,
  studyId,
}: WordOrganizationProps) {
  const [words, setWords] = useState<Word[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  
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
      // 단어 추가 (의미는 나중에 수정 가능)
      await apiClient.addWord(cleanWord, '', studyId || undefined)
      await loadWords()
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
    <div className="grid grid-cols-3 gap-6">
      {/* 왼쪽: 본문 */}
      <div className="col-span-2">
        <input
          type="text"
          value={title}
          readOnly
          className="text-2xl font-bold border-b-2 border-gray-300 mb-6 w-full"
        />

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
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleResetAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            단어 전체 초기화
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            PDF 저장하기 &gt;
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
            <div className="space-y-2">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-start justify-between p-3 bg-white rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <button
                      onClick={() => handleToggleKnown(word.id, word.known)}
                      className={`w-4 h-4 rounded-full mr-2 inline-block ${
                        word.known ? 'bg-primary' : 'bg-gray-400'
                      }`}
                    />
                    <span className="font-semibold">{word.word}</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {word.meaning || (
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
  )
}

