import deepl
import os
import re
from typing import List

class TranslationService:
    def __init__(self):
        # 환경 변수 다시 확인
        api_key = os.getenv("DEEPL_API_KEY")
        if not api_key:
            # api.env 파일을 직접 읽어보기
            from pathlib import Path
            env_path = Path(__file__).parent.parent / "api.env"
            if env_path.exists():
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("DEEPL_API_KEY="):
                            api_key = line.split("=", 1)[1].strip()
                            os.environ["DEEPL_API_KEY"] = api_key
                            break
        
        if not api_key:
            raise ValueError("DEEPL_API_KEY environment variable is not set")
        
        self.translator = deepl.Translator(api_key)
    
    def split_into_paragraphs(self, text: str) -> List[str]:
        """텍스트를 문단 단위로 분리
        
        문단 구분 방법:
        1. 빈 줄로 구분된 문단
        2. (1), (2), (3) 같은 번호 패턴으로 시작하는 문단
        """
        normalized = text.replace('\r\n', '\n').replace('\r', '\n')
        
        # (1), (2), (3) 같은 번호 패턴으로 문단 구분
        # 패턴: 줄 시작 또는 텍스트 시작에 (숫자) 형식이 오면 문단 구분자로 인식
        numbered_paragraph_pattern = r'(?:^|\n)\s*\([0-9]+\)\s+'
        
        # 번호 패턴이 있으면 해당 패턴으로 먼저 분리
        if re.search(numbered_paragraph_pattern, normalized):
            # 번호 패턴으로 분리 (첫 번째 문단도 포함)
            parts = re.split(numbered_paragraph_pattern, normalized)
            paragraphs = []
            for part in parts:
                part = part.strip()
                if part:
                    # 번호 패턴 제거 (혹시 남아있을 수 있음)
                    part = re.sub(r'^\([0-9]+\)\s+', '', part)
                    paragraphs.append(part)
            if paragraphs:
                return paragraphs
        
        # 번호 패턴이 없으면 기존 방식 (빈 줄로 구분)
        paragraphs = re.split(r'\n\s*\n', normalized)
        return [p.strip() for p in paragraphs if p.strip()]
    
    def split_into_sentences(self, text: str) -> List[str]:
        """텍스트를 문장 단위로 분리"""
        # 문장 끝 마크로 분리 (. ! ?)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        # 빈 문장 제거
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    async def translate(self, text: str, target_lang: str = "KO") -> str:
        """텍스트를 한국어로 번역"""
        try:
            result = self.translator.translate_text(text, target_lang=target_lang)
            return result.text
        except Exception as e:
            raise Exception(f"Translation failed: {str(e)}")

