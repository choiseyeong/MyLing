import pytesseract  # type: ignore
import pdfplumber  # type: ignore
from PIL import Image  # type: ignore
import os
import re
from statistics import median
from typing import Dict, List, Tuple
from pytesseract import Output  # type: ignore

class OCRService:
    def __init__(self):
        # Windows에서 tesseract 경로 설정 (필요시)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        pass
    
    async def extract_text(self, file_path: str, content_type: str) -> str:
        """파일에서 텍스트 추출"""
        try:
            if content_type == "application/pdf" or file_path.endswith(".pdf"):
                return await self._extract_from_pdf(file_path)
            elif content_type.startswith("image/") or any(file_path.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp"]):
                return await self._extract_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file type: {content_type}")
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    async def _extract_from_pdf(self, file_path: str) -> str:
        """PDF에서 텍스트 추출 (pdfplumber 방식)"""
        return await self._extract_from_pdf_fallback(file_path)
    
    async def _extract_from_pdf_fallback(self, file_path: str) -> str:
        """PDF에서 텍스트 추출 (기존 pdfplumber 방식 - Fallback)"""
        paragraphs: List[str] = []
        try:
            with pdfplumber.open(file_path) as pdf:
                print(f"PDF has {len(pdf.pages)} pages")
                for i, page in enumerate(pdf.pages):
                    words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
                    if not words:
                        print(f"Page {i+1} has no extractable text")
                        continue
                    lines = self._group_words_into_lines(words)
                    page_paragraphs = self._lines_to_paragraphs(lines)
                    paragraphs.extend(page_paragraphs)
        except Exception as e:
            print(f"PDF text extraction failed: {e}")
            raise Exception(f"PDF에서 텍스트를 추출할 수 없습니다: {str(e)}")
        
        if not paragraphs:
            raise Exception("PDF에서 텍스트를 추출할 수 없습니다. PDF가 텍스트 레이어를 포함하고 있는지 확인해주세요.")
        
        return "\n\n".join(paragraphs).strip()
    
    async def _extract_from_image(self, file_path: str) -> str:
        """이미지에서 OCR로 텍스트 추출 (Tesseract 방식)"""
        return await self._extract_from_image_fallback(file_path)
    
    async def _extract_from_image_fallback(self, file_path: str) -> str:
        """이미지에서 OCR로 텍스트 추출 (기존 Tesseract 방식 - Fallback)"""
        try:
            # Tesseract가 설치되어 있는지 확인
            try:
                pytesseract.get_tesseract_version()
            except Exception:
                # Windows에서 기본 경로 시도
                import platform
                if platform.system() == 'Windows':
                    common_paths = [
                        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                    ]
                    for path in common_paths:
                        if os.path.exists(path):
                            pytesseract.pytesseract.tesseract_cmd = path
                            break
                    else:
                        raise Exception("Tesseract OCR이 설치되지 않았습니다. https://github.com/UB-Mannheim/tesseract/wiki 에서 설치해주세요.")
                else:
                    raise Exception("Tesseract OCR이 설치되지 않았습니다.")
            
            image = Image.open(file_path)
            data = pytesseract.image_to_data(image, lang='eng', output_type=Output.DICT)
            lines = self._group_ocr_boxes_into_lines(data)
            paragraphs = self._lines_to_paragraphs(lines)
            if not paragraphs:
                # fallback
                text = pytesseract.image_to_string(image, lang='eng')
                if not text.strip():
                    raise Exception("이미지에서 텍스트를 추출할 수 없습니다. 이미지에 텍스트가 있는지 확인해주세요.")
                return self._clean_text(text)
            return "\n\n".join(paragraphs).strip()
        except Exception as e:
            raise Exception(f"Image OCR failed: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """추출된 텍스트 정리 및 문단 유지"""
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        
        raw_paragraphs = re.split(r'\n\s*\n', text)
        cleaned_paragraphs = []
        for paragraph in raw_paragraphs:
            # 문단 내 줄을 공백 하나로 정리
            lines = [line.strip() for line in paragraph.strip().split('\n') if line.strip()]
            if not lines:
                continue
            cleaned_paragraphs.append(' '.join(lines))
        return '\n\n'.join(cleaned_paragraphs).strip()
    
    def _group_words_into_lines(self, words: List[Dict]) -> List[Dict[str, float]]:
        """pdfplumber 단어 목록을 줄 단위로 묶기"""
        if not words:
            return []
        sorted_words = sorted(words, key=lambda w: (round(w["top"], 1), w["x0"]))
        lines: List[List[Dict]] = []
        current_line: List[Dict] = []
        current_top = None
        line_threshold = 3
        
        for word in sorted_words:
            if current_top is None:
                current_line = [word]
                current_top = word["top"]
                continue
            if abs(word["top"] - current_top) <= line_threshold:
                current_line.append(word)
            else:
                lines.append(current_line)
                current_line = [word]
                current_top = word["top"]
        if current_line:
            lines.append(current_line)
        
        formatted_lines: List[Dict[str, float]] = []
        for line in lines:
            text = " ".join(w["text"] for w in line if w.get("text"))
            if not text.strip():
                continue
            formatted_lines.append({
                "text": text.strip(),
                "top": min(w["top"] for w in line),
                "bottom": max(w["bottom"] for w in line),
                "x0": min(w["x0"] for w in line),
            })
        return formatted_lines
    
    def _group_ocr_boxes_into_lines(self, data: Dict[str, List]) -> List[Dict[str, float]]:
        """Tesseract OCR data를 줄 단위로 묶기"""
        if "text" not in data:
            return []
        n_boxes = len(data["text"])
        lines_map: Dict[Tuple[int, int, int], List[int]] = {}
        for i in range(n_boxes):
            text = data["text"][i].strip()
            if not text:
                continue
            key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
            lines_map.setdefault(key, []).append(i)
        
        lines: List[Dict[str, float]] = []
        for indices in lines_map.values():
            indices.sort(key=lambda idx: data["left"][idx])
            text = " ".join(data["text"][idx].strip() for idx in indices if data["text"][idx].strip())
            if not text:
                continue
            tops = [data["top"][idx] for idx in indices]
            heights = [data["height"][idx] for idx in indices]
            lefts = [data["left"][idx] for idx in indices]
            line_top = min(tops)
            line_bottom = max(top + height for top, height in zip(tops, heights))
            lines.append({
                "text": text,
                "top": line_top,
                "bottom": line_bottom,
                "x0": min(lefts),
            })
        
        lines.sort(key=lambda l: (l["top"], l["x0"]))
        return lines
    
    def _lines_to_paragraphs(self, lines: List[Dict[str, float]]) -> List[str]:
        """줄 정보를 문단으로 묶기"""
        if not lines:
            return []
        
        heights = [(line["bottom"] - line["top"]) for line in lines]
        base_height = median(heights) if heights else 12
        
        gaps = [
            max(0.0, lines[i + 1]["top"] - lines[i]["bottom"])
            for i in range(len(lines) - 1)
        ]
        median_gap = median(gaps) if gaps else base_height * 0.4
        gap_threshold = max(median_gap * 2.2, base_height * 1.3)
        indent_threshold = max(12.0, base_height * 1.5)
        negative_indent_threshold = indent_threshold * 1.5
        
        paragraphs: List[str] = []
        current_lines: List[str] = [lines[0]["text"]]
        prev_line = lines[0]
        
        for line in lines[1:]:
            y_gap = line["top"] - prev_line["bottom"]
            indent_delta = line["x0"] - prev_line["x0"]
            new_paragraph = False
            
            if y_gap > gap_threshold:
                new_paragraph = True
            elif indent_delta >= indent_threshold:
                new_paragraph = True
            elif indent_delta <= -negative_indent_threshold:
                new_paragraph = True
            else:
                prev_text = prev_line["text"].strip()
                curr_text = line["text"].strip()
                if prev_text:
                    ends_sentence = prev_text[-1] in ".?!"
                else:
                    ends_sentence = False
                starts_with_cap = bool(curr_text) and curr_text[0].isupper()
                if ends_sentence and starts_with_cap and y_gap > median_gap * 1.2:
                    new_paragraph = True
            
            if new_paragraph:
                paragraphs.append(" ".join(current_lines).strip())
                current_lines = [line["text"]]
            else:
                current_lines.append(line["text"])
            prev_line = line
        
        if current_lines:
            paragraphs.append(" ".join(current_lines).strip())
        return [p for p in paragraphs if p]


