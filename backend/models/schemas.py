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

class SaveStudyRequest(BaseModel):
    title: str
    english_text: str
    korean_text: str
    paragraphs: List[Paragraph]
    current_step: int  # 1: 업로드, 2: 번역하기, 3: 단어 정리
    words: Optional[List[Dict[str, str]]] = None

class StudyResponse(BaseModel):
    id: int
    title: str
    last_studied_date: str
    word_count: int
    current_step: int
    created_at: str

class WordResponse(BaseModel):
    id: int
    word: str
    meaning: str
    study_id: Optional[int] = None
    study_title: Optional[str] = None
    known: bool = False



