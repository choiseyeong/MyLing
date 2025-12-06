from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class TranslationRequest(BaseModel):
    text: str

class SentencePair(BaseModel):
    english: str
    korean: str

class Paragraph(BaseModel):
    sentences: List[SentencePair]

class TranslationResponse(BaseModel):
    paragraphs: List[Paragraph]
    words: List[Dict[str, str]]
    topic: Optional[str] = None

class SaveStudyRequest(BaseModel):
    title: str
    english_text: str
    korean_text: str
    paragraphs: List[Paragraph]
    current_step: int  # 1: 업로드, 2: 번역하기, 3: 단어 정리
    words: Optional[List[Dict[str, str]]] = None
    topic: Optional[str] = None

class StudyResponse(BaseModel):
    id: int
    title: str
    english_text: Optional[str] = None
    korean_text: Optional[str] = None
    paragraphs: Optional[List[Paragraph]] = None
    last_studied_date: str
    word_count: int
    current_step: int
    created_at: str
    topic: Optional[str] = None

class WordResponse(BaseModel):
    id: int
    word: str
    meaning: str
    study_id: Optional[int] = None
    study_title: Optional[str] = None
    known: bool = False

class ReorganizeParagraphsRequest(BaseModel):
    """문단 재구성 요청 - 문장 인덱스 범위로 문단 분리"""
    paragraphs: List[Paragraph]  # 현재 문단 구조
    paragraph_boundaries: List[int]  # 각 문단이 시작하는 문장 인덱스 (0부터 시작)
    # 예: [0, 5, 10] → 첫 문단: 문장 0-4, 두 번째 문단: 문장 5-9, 세 번째 문단: 문장 10+

class ReorganizeParagraphsRequest(BaseModel):
    """문단 재구성 요청"""
    paragraphs: List[Paragraph]  # 현재 문단 구조
    paragraph_boundaries: List[int]  # 각 문단이 시작하는 문장 인덱스 (0부터 시작)
    # 예: [0, 5, 10] → 첫 문단: 문장 0-4, 두 번째 문단: 문장 5-9, 세 번째 문단: 문장 10+



