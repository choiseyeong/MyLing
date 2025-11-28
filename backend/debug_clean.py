from services.ocr_service import OCRService
import pdfplumber

ocr = OCRService()
print("Loaded OCRService")

with pdfplumber.open('backend/uploads/test_long_2.pdf') as pdf:
    raw_text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
    cleaned = ocr._clean_text(raw_text)
    print("RAW REPR:", repr(raw_text))
    print("CLEANED REPR:", repr(cleaned))

