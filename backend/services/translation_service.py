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
        """텍스트를 문단 단위로 분리"""
        normalized = text.replace('\r\n', '\n').replace('\r', '\n')
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

