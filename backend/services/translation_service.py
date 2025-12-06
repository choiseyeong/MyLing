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
    
    def _is_title_line(self, line: str) -> bool:
        """제목 라인인지 판단 - 매우 엄격한 조건"""
        line = line.strip()
        if not line:
            return False
        
        # 대문자로 시작하지 않으면 제목 아님
        if not line[0].isupper():
            return False
        
        # 문장 부호가 있으면 본문 (제목 아님)
        if any(punct in line for punct in ['.', '?', '!', ':', ';', ',']):
            return False
        
        # 단어 개수 확인 (2~7개)
        words = line.split()
        if not (2 <= len(words) <= 7):
            return False
        
        # Title Case 확인 (각 단어가 대문자로 시작하거나, 매우 짧은 단어는 소문자 허용)
        # 예: "Civilization and Its Discontents" - Title Case
        title_case_count = sum(1 for word in words if word and word[0].isupper())
        if title_case_count >= len(words) * 0.7:  # 70% 이상이 대문자로 시작
            return True
        
        return False
    
    def _is_author_line(self, line: str) -> bool:
        """저자 라인인지 판단"""
        line = line.strip()
        if not line:
            return False
        
        # "By"로 시작하는 라인
        if re.match(r'^By\s+[A-Z]', line, re.IGNORECASE):
            return True
        
        return False
    
    def _is_chapter_line(self, line: str) -> bool:
        """챕터 표시 라인인지 판단"""
        line = line.strip()
        if not line:
            return False
        
        # 숫자 + "CHAPTER" + 숫자 패턴
        if re.match(r'^\d+\s+CHAPTER\s+\d+', line, re.IGNORECASE):
            return True
        
        # "CHAPTER" + 숫자 패턴
        if re.match(r'^CHAPTER\s+\d+', line, re.IGNORECASE):
            return True
        
        return False
    
    def _should_skip_line(self, line: str) -> bool:
        """이 라인을 문단에서 제외해야 하는지 판단"""
        return self._is_title_line(line) or self._is_author_line(line) or self._is_chapter_line(line)
    
    def split_into_paragraphs(self, text: str) -> List[str]:
        """텍스트를 문단 단위로 분리
        
        하이브리드 방식:
        1. OCR 결과 우선: "\n\n"로 구분된 문단 그대로 사용
        2. 직접 입력 텍스트: 빈 줄("\n\n")로 구분
        3. 문장 중간의 문단 번호 패턴 (예: " (2) ", " (3) ") 감지하여 문단 분리
        4. 제목/저자/챕터 라인 제거
        5. 문단 번호 제거
        """
        if not text or not text.strip():
            return [""]
        
        normalized = text.replace('\r\n', '\n').replace('\r', '\n')
        
        # 1) OCR 결과 우선: "\n\n"로 구분된 문단 분리
        raw_paragraphs = re.split(r'\n\s*\n', normalized)
        
        paragraphs = []
        for para in raw_paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # 2) 제목/저자/챕터 라인 제거
            lines = para.split('\n')
            cleaned_lines = []
            for line in lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                
                # 제목/저자/챕터 라인은 제거
                if self._should_skip_line(line):
                    continue
                
                cleaned_lines.append(line)
            
            if not cleaned_lines:
                continue
            
            # 3) 문장 중간의 문단 번호 패턴 감지하여 문단 분리
            # 예: "...efficient. (2) Despite..." -> "...efficient." 와 "Despite..."로 분리
            combined_text = ' '.join(cleaned_lines)
            
            # 문단 번호 패턴 찾기: 공백 + (숫자) + 공백 또는 문장 끝 + (숫자) + 공백
            # 패턴: " (2) ", ". (2) ", "! (2) ", "? (2) " 등
            paragraph_pattern = r'([.!?])\s*\((\d+)\)\s+([A-Z])'
            matches = list(re.finditer(paragraph_pattern, combined_text))
            
            if matches:
                # 문단 번호 패턴으로 분리
                split_points = []
                for match in matches:
                    # 문단 번호 앞의 문장 끝 위치
                    split_points.append(match.start() + 1)  # 문장 끝 마크 다음
                
                # 문단 분리
                current_pos = 0
                para_parts = []
                for split_pos in split_points:
                    part = combined_text[current_pos:split_pos].strip()
                    if part:
                        para_parts.append(part)
                    current_pos = split_pos
                
                # 마지막 부분 추가
                if current_pos < len(combined_text):
                    last_part = combined_text[current_pos:].strip()
                    if last_part:
                        para_parts.append(last_part)
                
                # 각 부분을 문단으로 추가 (문단 번호 제거)
                for part in para_parts:
                    # 문단 번호 패턴 제거: " (2) ", " (3) " 등
                    cleaned_part = re.sub(r'\s*\(\d+\)\s+', ' ', part)
                    # 줄 시작 부분의 문단 번호도 제거
                    cleaned_part = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', cleaned_part)
                    if cleaned_part.strip():
                        paragraphs.append(cleaned_part.strip())
            else:
                # 문단 번호 패턴이 없으면 기존 방식으로 처리
                combined_text = ' '.join(cleaned_lines)
                # 줄 시작 부분의 문단 번호 제거
                cleaned = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', combined_text)
                if cleaned.strip():
                    paragraphs.append(cleaned.strip())
        
        # 최종 보장: 최소한 하나의 문단은 있어야 함
        if not paragraphs:
            # 제목/저자/챕터 제거 후 남은 텍스트
            lines = normalized.split('\n')
            final_lines = []
            for line in lines:
                line_stripped = line.strip()
                if line_stripped and not self._should_skip_line(line):
                    final_lines.append(line_stripped)
            
            if final_lines:
                combined = ' '.join(final_lines)
                # 문장 중간의 문단 번호 패턴으로 분리 시도
                paragraph_pattern = r'([.!?])\s*\((\d+)\)\s+([A-Z])'
                matches = list(re.finditer(paragraph_pattern, combined))
                
                if matches:
                    split_points = [match.start() + 1 for match in matches]
                    current_pos = 0
                    for split_pos in split_points:
                        part = combined[current_pos:split_pos].strip()
                        if part:
                            cleaned = re.sub(r'\s*\(\d+\)\s+', ' ', part)
                            cleaned = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', cleaned)
                            if cleaned.strip():
                                paragraphs.append(cleaned.strip())
                        current_pos = split_pos
                    
                    if current_pos < len(combined):
                        last_part = combined[current_pos:].strip()
                        if last_part:
                            cleaned = re.sub(r'\s*\(\d+\)\s+', ' ', last_part)
                            cleaned = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', cleaned)
                            if cleaned.strip():
                                paragraphs.append(cleaned.strip())
                else:
                    cleaned = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', combined)
                    if cleaned.strip():
                        paragraphs.append(cleaned.strip())
            
            if not paragraphs:
                paragraphs = [normalized.strip()] if normalized.strip() else [""]
        
        # 최종 정리: 각 문단에서 남아있을 수 있는 문단 번호 패턴 제거
        cleaned_paragraphs = []
        for para in paragraphs:
            # 문단 내 문단 번호 패턴 제거
            cleaned = re.sub(r'\s*\(\d+\)\s+', ' ', para)
            cleaned = re.sub(r'^\(?\d+\)?[\.\)\-—\s]+', '', cleaned)
            if cleaned.strip():
                cleaned_paragraphs.append(cleaned.strip())
        
        return cleaned_paragraphs if cleaned_paragraphs else paragraphs
    
    def split_into_sentences(self, text: str) -> List[str]:
        """텍스트를 문장 단위로 분리"""
        # "..."을 문장 구분자로 인식하지 않도록 처리
        # 먼저 "..."을 임시 토큰으로 치환
        ellipsis_token = "___ELLIPSIS___"
        text_with_token = text.replace('...', ellipsis_token)
        
        # 문장 끝 마크로 분리 (. ! ?)
        # 공백이 따라오는 경우에만 분리
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text_with_token)
        
        # 임시 토큰을 다시 "..."으로 복원
        sentences = [s.replace(ellipsis_token, '...') for s in sentences]
        
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

