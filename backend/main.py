# -*- coding: utf-8 -*-
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Optional
import uvicorn

from services.ocr_service import OCRService
from services.translation_service import TranslationService
from services.storage_service import StorageService
from services.vocabulary_service import VocabularyService
from services.dictionary_service import DictionaryService
from models.schemas import (
    TranslationRequest,
    TranslationResponse,
    SaveStudyRequest,
    StudyResponse,
    WordResponse
)

# 현재 파일의 디렉토리 기준으로 api.env 파일 경로 설정
env_path = Path(__file__).parent / "api.env"
print(f"Looking for env file at: {env_path}")
print(f"File exists: {env_path.exists()}")

if env_path.exists():
    # api.env 파일을 직접 읽어서 환경 변수 설정
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"File content (first 50 chars): {repr(content[:50])}")
            print(f"File content length: {len(content)}")
            
            if not content:
                print("WARNING: File is empty!")
                # 파일을 다시 읽어보기 (바이너리 모드)
                with open(env_path, 'rb') as fb:
                    binary_content = fb.read()
                    print(f"Binary content: {binary_content[:50]}")
                    content = binary_content.decode('utf-8')
                    print(f"Decoded content: {repr(content[:50])}")
            
            # 여러 줄바꿈 문자 처리
            lines = content.replace('\r\n', '\n').replace('\r', '\n').split('\n')
            print(f"Number of lines: {len(lines)}")
            
            for i, line in enumerate(lines):
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    parts = line.split('=', 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                        os.environ[key] = value
                        print(f"Set environment variable: {key} = {value[:20]}...")
                        # 즉시 확인
                        test_key = os.getenv(key)
                        print(f"  Verification: os.getenv('{key}') = {test_key is not None}")
                        if test_key:
                            print(f"  Value: {test_key[:20]}...")
    except Exception as e:
        print(f"Error reading env file: {e}")
        import traceback
        traceback.print_exc()
else:
    # api.env가 없으면 기본 .env 파일 로드 시도
    print("api.env not found, trying load_dotenv()")
    load_dotenv()

# 확인
api_key = os.getenv('DEEPL_API_KEY')
print(f"DEEPL_API_KEY after loading: {api_key is not None}")
if api_key:
    print(f"DEEPL_API_KEY value: {api_key[:20]}...")
else:
    print("ERROR: DEEPL_API_KEY is still None!")
    print(f"All env vars with DEEPL: {[k for k in os.environ.keys() if 'DEEPL' in k]}")

app = FastAPI(title="MyLing API", version="1.0.0")

# CORS 설정 (개발 환경: 모든 localhost 포트 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 초기화
ocr_service = OCRService()
translation_service = TranslationService()
storage_service = StorageService()
vocabulary_service = VocabularyService()
dictionary_service = DictionaryService(translation_service=translation_service)

@app.get("/")
async def root():
    return {"message": "MyLing API is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file and extract text using OCR"""
    try:
        print(f"Received file upload: {file.filename}, content_type: {file.content_type}")
        
        # 파일 저장
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 파일명 안전하게 처리
        safe_filename = file.filename.replace("..", "").replace("/", "").replace("\\", "")
        file_path = os.path.join(upload_dir, safe_filename)
        
        print(f"Saving file to: {file_path}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"File saved, size: {len(content)} bytes")
        
        # OCR로 텍스트 추출
        print(f"Extracting text from: {file_path}")
        extracted_text = await ocr_service.extract_text(file_path, file.content_type)
        print(f"Extracted text length: {len(extracted_text)}")
        
        # 임시 파일 삭제 (선택사항)
        # os.remove(file_path)
        
        return JSONResponse({
            "success": True,
            "text": extracted_text,
            "filename": file.filename
        })
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error uploading file: {error_detail}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.post("/api/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """Translate English text to Korean"""
    try:
        # 텍스트를 문장 단위로 분리
        sentences = translation_service.split_into_sentences(request.text)
        
        # 각 문장을 번역
        translated_pairs = []
        for sentence in sentences:
            if sentence.strip():
                korean = await translation_service.translate(sentence)
                translated_pairs.append({
                    "english": sentence.strip(),
                    "korean": korean
                })
        
        # 단어 추출
        words = vocabulary_service.extract_words(request.text)
        
        return TranslationResponse(
            paragraphs=[{
                "sentences": translated_pairs
            }],
            words=words
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/study/save")
async def save_study(request: SaveStudyRequest):
    """Save study content"""
    try:
        # 입력 검증
        if not request.title or not request.title.strip():
            raise ValueError("제목을 입력해주세요.")
        if not request.paragraphs or len(request.paragraphs) == 0:
            raise ValueError("번역된 내용이 없습니다.")
        
        print(f"Received save request: title={request.title}, step={request.current_step}")
        print(f"Paragraphs count: {len(request.paragraphs) if request.paragraphs else 0}")
        print(f"Words count: {len(request.words) if request.words else 0}")
        
        # paragraphs를 dict 리스트로 변환
        paragraphs_dict = []
        for para in request.paragraphs:
            sentences_dict = []
            for sent in para.sentences:
                sentences_dict.append({
                    "english": sent.english,
                    "korean": sent.korean
                })
            paragraphs_dict.append({"sentences": sentences_dict})
        
        study_id = await storage_service.save_study(
            title=request.title,
            english_text=request.english_text,
            korean_text=request.korean_text,
            paragraphs=paragraphs_dict,
            current_step=request.current_step,
            words=request.words
        )
        
        print(f"Study saved with ID: {study_id}")
        
        # 단어 저장
        if request.words:
            print(f"Saving {len(request.words)} words...")
            await vocabulary_service.save_words(request.words, study_id, dictionary_service)
            print("Words saved successfully")
        
        return {"success": True, "study_id": study_id}
    except ValueError as e:
        # 검증 오류
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error saving study: {error_detail}")
        # 에러 메시지를 JSON으로 반환
        raise HTTPException(
            status_code=500,
            detail=f"Error saving study: {str(e)}"
        )

@app.get("/api/study/list", response_model=List[StudyResponse])
async def get_study_list():
    """Get list of saved studies"""
    try:
        # vocabulary_service를 전달하여 실제 단어 개수 가져오기
        studies = await storage_service.get_all_studies(vocabulary_service=vocabulary_service)
        return studies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/study/{study_id}", response_model=StudyResponse)
async def get_study(study_id: int):
    """Get specific study content"""
    try:
        study = await storage_service.get_study(study_id)
        if not study:
            raise HTTPException(status_code=404, detail="Study not found")
        return study
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/study/{study_id}")
async def update_study(study_id: int, data: dict):
    """Update study content (current_step, etc.)"""
    try:
        await storage_service.update_study(study_id, **data)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/study/{study_id}")
async def delete_study(study_id: int):
    """Delete study content (including related words)"""
    try:
        # 먼저 해당 지문의 모든 단어 삭제
        deleted_count = await vocabulary_service.delete_words_by_study_id(study_id)
        print(f"Deleted {deleted_count} words for study_id {study_id}")
        
        # 그 다음 지문 삭제
        await storage_service.delete_study(study_id)
        return {"success": True, "deleted_words_count": deleted_count}
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error deleting study: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vocabulary", response_model=List[WordResponse])
async def get_vocabulary(study_id: Optional[int] = None):
    """Get vocabulary list (all words or words for a specific study)"""
    try:
        words = await vocabulary_service.get_words(study_id)
        return words
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vocabulary/add")
async def add_word(word: str, meaning: str = "", study_id: Optional[int] = None):
    """Add word (meaning is not automatically fetched - user can fetch it later using 'Get meaning' button)"""
    try:
        # 뜻 없이 즉시 저장 (빠른 저장)
        # 뜻은 사용자가 "뜻 가져오기" 버튼을 클릭할 때만 가져옴
        await vocabulary_service.save_words(
            [{"word": word.lower(), "meaning": meaning}],
            study_id,
            None  # dictionary_service를 전달하지 않아 자동으로 뜻을 가져오지 않음
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vocabulary/fetch-meaning")
async def fetch_word_meaning(word: str):
    """Fetch word meaning from DictionaryAPI.dev"""
    try:
        meaning = await dictionary_service.get_word_meaning(word)
        if meaning:
            return {"success": True, "meaning": meaning}
        else:
            return {"success": False, "message": "단어의 뜻을 찾을 수 없습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vocabulary/update-meaning")
async def update_word_meaning(word_id: int, meaning: str):
    """Update word meaning"""
    try:
        await vocabulary_service.update_word_meaning(word_id, meaning)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vocabulary/mark")
async def mark_word(word_id: int, known: bool):
    """Mark word as known or unknown"""
    try:
        await vocabulary_service.mark_word(word_id, known)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/vocabulary/{word_id}")
async def delete_word(word_id: int):
    """Delete word"""
    try:
        await vocabulary_service.delete_word(word_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

