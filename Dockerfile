# Python 3.11 베이스 이미지 사용
FROM python:3.11-slim

# 시스템 패키지 설치 (Tesseract OCR 등)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
# CPU 전용 torch 먼저 설치 (크기 절약)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch>=2.0.0
# 나머지 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행 (Railway PORT 환경 변수 사용, 없으면 8000)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

