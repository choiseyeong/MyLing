from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, Text, DateTime, select
from datetime import datetime
import json
import os

Base = declarative_base()

class Study(Base):
    __tablename__ = "studies"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    english_text = Column(Text)
    korean_text = Column(Text)
    paragraphs = Column(Text)  # JSON string
    current_step = Column(Integer, default=1)
    word_count = Column(Integer, default=0)
    last_studied_date = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)

class StorageService:
    def __init__(self):
        db_path = "myling.db"
        # SQLite 잠금 문제 해결을 위한 설정
        self.engine = create_async_engine(
            f"sqlite+aiosqlite:///{db_path}",
            echo=False,
            pool_pre_ping=True,  # 연결 상태 확인
            connect_args={
                "check_same_thread": False,  # SQLite 멀티스레드 허용
                "timeout": 30.0,  # 타임아웃 설정 (30초)
            },
            poolclass=None,  # 기본 풀 사용
        )
        self.async_session = async_sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False,
            autoflush=False,  # 자동 flush 비활성화
            autocommit=False
        )
        self._initialized = False
    
    async def init_db(self):
        """데이터베이스 초기화"""
        if not self._initialized:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            self._initialized = True
    
    async def save_study(self, title: str, english_text: str, korean_text: str, 
                        paragraphs: list, current_step: int, words: list = None):
        """학습 내용 저장"""
        await self.init_db()
        
        # paragraphs를 JSON 문자열로 변환
        paragraphs_json = json.dumps(paragraphs, ensure_ascii=False) if paragraphs else "[]"
        
        # 재시도 로직을 위한 최대 시도 횟수
        max_retries = 3
        retry_delay = 0.1  # 100ms
        
        for attempt in range(max_retries):
            try:
                async with self.async_session() as session:
                    study = Study(
                        title=title,
                        english_text=english_text,
                        korean_text=korean_text,
                        paragraphs=paragraphs_json,
                        current_step=current_step,
                        word_count=len(words) if words else 0,
                        last_studied_date=datetime.now()
                    )
                    session.add(study)
                    await session.commit()
                    await session.refresh(study)
                    return study.id
            except Exception as e:
                error_str = str(e).lower()
                
                # 데이터베이스 잠금 오류인 경우 재시도
                if "database is locked" in error_str or "locked" in error_str:
                    if attempt < max_retries - 1:
                        import asyncio
                        await asyncio.sleep(retry_delay * (attempt + 1))  # 지수 백오프
                        print(f"Database locked, retrying... (attempt {attempt + 1}/{max_retries})")
                        continue
                    else:
                        import traceback
                        error_trace = traceback.format_exc()
                        print(f"Error in save_study after {max_retries} retries: {error_trace}")
                        raise ValueError(f"데이터베이스가 잠겨있습니다. 잠시 후 다시 시도해주세요.")
                
                # 다른 오류인 경우
                import traceback
                error_trace = traceback.format_exc()
                print(f"Error in save_study: {error_trace}")
                
                if "no such table" in error_str:
                    raise ValueError("데이터베이스 테이블이 초기화되지 않았습니다. 서버를 재시작해주세요.")
                elif "UNIQUE constraint" in error_str:
                    raise ValueError("이미 같은 제목의 학습이 존재합니다.")
                else:
                    raise ValueError(f"데이터 저장 중 오류가 발생했습니다: {str(e)}")
    
    async def update_study(self, study_id: int, **kwargs):
        """학습 내용 업데이트"""
        await self.init_db()
        
        max_retries = 3
        retry_delay = 0.1
        
        for attempt in range(max_retries):
            try:
                async with self.async_session() as session:
                    result = await session.execute(select(Study).where(Study.id == study_id))
                    study = result.scalar_one_or_none()
                    if study:
                        for key, value in kwargs.items():
                            if key == "paragraphs":
                                setattr(study, key, json.dumps(value, ensure_ascii=False))
                            else:
                                setattr(study, key, value)
                        study.last_studied_date = datetime.now()
                        await session.commit()
                        return True
                    return False
            except Exception as e:
                error_str = str(e).lower()
                if "database is locked" in error_str or "locked" in error_str:
                    if attempt < max_retries - 1:
                        import asyncio
                        await asyncio.sleep(retry_delay * (attempt + 1))
                        print(f"Database locked in update_study, retrying... (attempt {attempt + 1}/{max_retries})")
                        continue
                    else:
                        print(f"Database locked in update_study after {max_retries} retries")
                        raise ValueError(f"데이터베이스가 잠겨있습니다. 잠시 후 다시 시도해주세요.")
                else:
                    raise
    
    async def get_study(self, study_id: int):
        """특정 학습 내용 조회"""
        await self.init_db()
        
        async with self.async_session() as session:
            result = await session.execute(select(Study).where(Study.id == study_id))
            study = result.scalar_one_or_none()
            if study:
                return {
                    "id": study.id,
                    "title": study.title,
                    "english_text": study.english_text,
                    "korean_text": study.korean_text,
                    "paragraphs": json.loads(study.paragraphs) if study.paragraphs else [],
                    "current_step": study.current_step,
                    "word_count": study.word_count,
                    "last_studied_date": study.last_studied_date.strftime("%Y.%m.%d") if study.last_studied_date else None,
                    "created_at": study.created_at.strftime("%Y-%m-%d %H:%M:%S") if study.created_at else None
                }
            return None
    
    async def get_all_studies(self, vocabulary_service=None):
        """모든 학습 목록 조회"""
        await self.init_db()
        
        async with self.async_session() as session:
            result = await session.execute(select(Study).order_by(Study.last_studied_date.desc()))
            studies = result.scalars().all()
            
            study_list = []
            for study in studies:
                # vocabulary_service가 제공되면 실제 단어장의 단어 개수 가져오기
                if vocabulary_service:
                    words = await vocabulary_service.get_words(study_id=study.id)
                    actual_word_count = len(words)
                    # 디버깅: 단어 개수 로그 출력
                    print(f"Study ID {study.id} ({study.title}): Found {actual_word_count} words")
                else:
                    # vocabulary_service가 없으면 기존 word_count 사용
                    actual_word_count = study.word_count
                
                study_list.append({
                    "id": study.id,
                    "title": study.title,
                    "last_studied_date": study.last_studied_date.strftime("%Y.%m.%d") if study.last_studied_date else None,
                    "word_count": actual_word_count,  # 실제 단어장의 단어 개수
                    "current_step": study.current_step,
                    "created_at": study.created_at.strftime("%Y-%m-%d %H:%M:%S") if study.created_at else None
                })
            
            return study_list
    
    async def delete_study(self, study_id: int):
        """학습 내용 삭제"""
        await self.init_db()
        
        async with self.async_session() as session:
            result = await session.execute(select(Study).where(Study.id == study_id))
            study = result.scalar_one_or_none()
            if study:
                await session.delete(study)
                await session.commit()
                return True
            return False

