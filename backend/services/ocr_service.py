import pytesseract
import pdfplumber
from PIL import Image
import os
import re

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
        """PDF에서 텍스트 추출"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                print(f"PDF has {len(pdf.pages)} pages")
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    else:
                        print(f"Page {i+1} has no extractable text")
        except Exception as e:
            # PDF 추출 실패
            print(f"PDF text extraction failed: {e}")
            raise Exception(f"PDF에서 텍스트를 추출할 수 없습니다: {str(e)}")
        
        if not text.strip():
            raise Exception("PDF에서 텍스트를 추출할 수 없습니다. PDF가 텍스트 레이어를 포함하고 있는지 확인해주세요.")
        
        return self._clean_text(text)
    
    async def _extract_from_image(self, file_path: str) -> str:
        """이미지에서 OCR로 텍스트 추출"""
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
            text = pytesseract.image_to_string(image, lang='eng')
            if not text.strip():
                raise Exception("이미지에서 텍스트를 추출할 수 없습니다. 이미지에 텍스트가 있는지 확인해주세요.")
            return self._clean_text(text)
        except Exception as e:
            raise Exception(f"Image OCR failed: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """추출된 텍스트 정리"""
        # 불필요한 공백 제거
        text = re.sub(r'\s+', ' ', text)
        # 줄바꿈 정리
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()


