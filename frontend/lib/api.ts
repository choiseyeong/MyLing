import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface TranslationResponse {
  paragraphs: Array<{
    sentences: Array<{
      english: string
      korean: string
    }>
  }>
  words: Array<{
    word: string
    meaning: string
  }>
  topic?: string
}

export interface Study {
  id: number
  title: string
  last_studied_date: string
  word_count: number
  current_step: number
  created_at: string
  topic?: string
}

export interface Word {
  id: number
  word: string
  meaning: string
  study_id?: number
  study_title?: string
  known: boolean
}

export const apiClient = {
  // 파일 업로드 및 OCR
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 번역
  translate: async (text: string): Promise<TranslationResponse> => {
    const response = await api.post('/api/translate', { text })
    return response.data
  },

  // 문단 재구성
  reorganizeParagraphs: async (data: {
    paragraphs: Array<{
      sentences: Array<{
        english: string
        korean: string
      }>
    }>
    paragraph_boundaries: number[]
  }): Promise<TranslationResponse> => {
    const response = await api.post('/api/paragraphs/reorganize', data)
    return response.data
  },

  // 학습 저장
  saveStudy: async (data: {
    title: string
    english_text: string
    korean_text: string
    paragraphs: Array<{
      sentences: Array<{
        english: string
        korean: string
      }>
    }>
    current_step: number
    words?: Array<{ word: string; meaning: string }>
    topic?: string
  }) => {
    try {
      const response = await api.post('/api/study/save', data)
      return response.data
    } catch (error: any) {
      console.error('Save study error:', error.response?.data || error.message)
      throw error
    }
  },

  // 학습 목록 조회
  getStudyList: async (): Promise<Study[]> => {
    const response = await api.get('/api/study/list')
    return response.data
  },

  // 학습 상세 조회
  getStudy: async (studyId: number) => {
    const response = await api.get(`/api/study/${studyId}`)
    return response.data
  },

  // 학습 업데이트
  updateStudy: async (studyId: number, data: { current_step?: number }) => {
    const response = await api.put(`/api/study/${studyId}`, data)
    return response.data
  },

  // 학습 삭제
  deleteStudy: async (studyId: number) => {
    const response = await api.delete(`/api/study/${studyId}`)
    return response.data
  },

  // 단어장 조회
  getVocabulary: async (studyId?: number): Promise<Word[]> => {
    const params = studyId ? { study_id: studyId } : {}
    const response = await api.get('/api/vocabulary', { params })
    return response.data
  },

  // 단어 추가
  addWord: async (word: string, meaning: string, studyId?: number) => {
    const response = await api.post('/api/vocabulary/add', null, {
      params: { word, meaning, study_id: studyId },
    })
    return response.data
  },

  // 단어 뜻 가져오기
  fetchWordMeaning: async (word: string) => {
    const response = await api.post('/api/vocabulary/fetch-meaning', null, {
      params: { word },
    })
    return response.data
  },

  // 단어 뜻 업데이트
  updateWordMeaning: async (wordId: number, meaning: string) => {
    const response = await api.post('/api/vocabulary/update-meaning', null, {
      params: { word_id: wordId, meaning },
    })
    return response.data
  },

  // 단어 표시 (알고 있음/모름)
  markWord: async (wordId: number, known: boolean) => {
    const response = await api.post('/api/vocabulary/mark', null, {
      params: { word_id: wordId, known },
    })
    return response.data
  },

  // 단어 삭제
  deleteWord: async (wordId: number) => {
    const response = await api.delete(`/api/vocabulary/${wordId}`)
    return response.data
  },
}

