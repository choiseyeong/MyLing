from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, select, delete
from datetime import datetime
import re
from typing import List, Optional, Dict

from services.storage_service import StorageService, Base

class Word(Base):
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, nullable=False, index=True)
    meaning = Column(String)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=True)
    known = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

class VocabularyService:
    def __init__(self):
        self.storage_service = StorageService()
        self._initialized = False
    
    async def init_db(self):
        """데이터베이스 초기화"""
        if not self._initialized:
            # storage_service의 데이터베이스를 먼저 초기화 (studies 테이블 생성)
            await self.storage_service.init_db()
            # 그 다음 words 테이블 생성 (studies 테이블이 이미 존재해야 함)
            # 같은 Base를 사용하므로 모든 테이블을 한 번에 생성
            async with self.storage_service.engine.begin() as conn:
                # Base.metadata에 Word 테이블이 등록되어 있는지 확인
                from services.storage_service import Base as StorageBase
                # Word 모델을 StorageBase의 메타데이터에 등록
                if 'words' not in StorageBase.metadata.tables:
                    Word.__table__.tometadata(StorageBase.metadata)
                await conn.run_sync(StorageBase.metadata.create_all, checkfirst=True)
            self._initialized = True
    
    def extract_words(self, text: str) -> List[Dict[str, str]]:
        """텍스트에서 영어 단어 추출"""
        # 영어 단어만 추출 (알파벳만)
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        # 중복 제거 및 정렬
        unique_words = sorted(set(words))
        # 너무 짧은 단어 제거 (2글자 이하)
        unique_words = [w for w in unique_words if len(w) > 2]
        return [{"word": word, "meaning": ""} for word in unique_words]
    
    async def save_words(self, words: List[Dict[str, str]], study_id: Optional[int] = None, dictionary_service=None):
        """단어 저장"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            for word_data in words:
                word_text = word_data.get("word", "").lower()
                meaning = word_data.get("meaning", "")
                
                # 뜻이 없고 dictionary_service가 제공되면 자동으로 가져오기
                if (not meaning or meaning.strip() == "") and dictionary_service:
                    try:
                        fetched_meaning = await dictionary_service.get_word_meaning(word_text)
                        if fetched_meaning:
                            meaning = fetched_meaning
                    except Exception as e:
                        print(f"Failed to fetch meaning for {word_text}: {e}")
                
                # 이미 존재하는지 확인
                result = await session.execute(
                    select(Word).where(
                        Word.word == word_text,
                        Word.study_id == study_id if study_id else Word.study_id.is_(None)
                    )
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    word = Word(
                        word=word_text,
                        meaning=meaning,
                        study_id=study_id,
                        known=False  # 새로 추가된 단어는 항상 '모르는 단어' 상태로 시작
                    )
                    session.add(word)
                elif existing and (not existing.meaning or existing.meaning.strip() == "") and meaning:
                    # 기존 단어에 뜻이 없으면 업데이트
                    existing.meaning = meaning
            
            await session.commit()
            
            # 단어 저장 후 study의 word_count 업데이트 (실제 단어 개수로)
            if study_id:
                words = await self.get_words(study_id=study_id)
                actual_count = len(words)
                await self.storage_service.update_study(study_id, word_count=actual_count)
    
    async def get_words(self, study_id: Optional[int] = None, known_only: Optional[bool] = None):
        """단어 조회"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            query = select(Word)
            
            if study_id:
                # study_id가 제공되면 해당 study가 존재하는지 먼저 확인
                study = await self.storage_service.get_study(study_id)
                if not study:
                    # study가 존재하지 않으면 빈 리스트 반환
                    return []
                query = query.where(Word.study_id == study_id)
            
            if known_only is not None:
                query = query.where(Word.known == known_only)
            
            query = query.order_by(Word.word)
            result = await session.execute(query)
            words = result.scalars().all()
            
            # Study 정보도 함께 가져오기
            # study_id가 제공되지 않은 경우에만 삭제된 지문의 단어 제외
            word_list = []
            study_title_cache = {}  # study_title 캐시
            
            for word in words:
                study_title = None
                
                if word.study_id:
                    # study_id가 제공된 경우 이미 확인했으므로 캐시 사용
                    if study_id and word.study_id == study_id:
                        study_title = study.get("title")
                    else:
                        # study_id가 제공되지 않은 경우에만 확인
                        if word.study_id not in study_title_cache:
                            study = await self.storage_service.get_study(word.study_id)
                            if study:
                                study_title_cache[word.study_id] = study.get("title")
                            else:
                                # 지문이 삭제된 경우, 이 단어는 제외
                                print(f"Skipping orphan word {word.id} (study_id {word.study_id} not found)")
                                continue
                        study_title = study_title_cache.get(word.study_id)
                
                word_list.append({
                    "id": word.id,
                    "word": word.word,
                    "meaning": word.meaning,
                    "study_id": word.study_id,
                    "study_title": study_title,
                    "known": word.known
                })
            
            return word_list
    
    async def mark_word(self, word_id: int, known: bool):
        """단어를 '알고 있음' 또는 '모름'으로 표시"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            result = await session.execute(select(Word).where(Word.id == word_id))
            word = result.scalar_one_or_none()
            if word:
                word.known = known
                await session.commit()
                return True
            return False
    
    async def update_word_meaning(self, word_id: int, meaning: str):
        """단어의 뜻 업데이트"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            result = await session.execute(select(Word).where(Word.id == word_id))
            word = result.scalar_one_or_none()
            if word:
                word.meaning = meaning
                await session.commit()
                return True
            return False
    
    async def delete_word(self, word_id: int):
        """단어 삭제"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            result = await session.execute(select(Word).where(Word.id == word_id))
            word = result.scalar_one_or_none()
            if word:
                study_id = word.study_id
                await session.delete(word)
                await session.commit()
                
                # 단어 삭제 후 study의 word_count 업데이트 (실제 단어 개수로)
                if study_id:
                    words = await self.get_words(study_id=study_id)
                    actual_count = len(words)
                    await self.storage_service.update_study(study_id, word_count=actual_count)
                
                return True
            return False
    
    async def delete_words_by_study_id(self, study_id: int):
        """특정 지문의 모든 단어 삭제"""
        await self.init_db()
        
        async with self.storage_service.async_session() as session:
            # 먼저 삭제할 단어 개수 확인
            count_result = await session.execute(
                select(Word).where(Word.study_id == study_id)
            )
            words_to_delete = count_result.scalars().all()
            word_count = len(words_to_delete)
            
            if word_count > 0:
                # delete 문을 사용하여 한 번에 삭제 (더 효율적)
                delete_stmt = delete(Word).where(Word.study_id == study_id)
                await session.execute(delete_stmt)
                await session.commit()
                print(f"Successfully deleted {word_count} words for study_id {study_id}")
            else:
                print(f"No words found for study_id {study_id}")
            
            return word_count


