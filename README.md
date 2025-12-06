
# 1. 실행하기 (Run)

### 🚀 프로덕션 (↓ 클릭!)

[https://my-ling.vercel.app](https://my-ling.vercel.app/)

### 🛠️ 로컬에서 실행하기

```smalltalk
1. 백엔드
`backend/requirements.txt` 설치 후 `python main.py`
	
2. 프론트엔드
`frontend/`에서 `npm install && npm run dev`

※ 환경 변수 설정 필요
`DEEPL_API_KEY`, `NEXT_PUBLIC_API_URL`
```


---

# 2. 프로젝트 소개 (Overview)

> **MyLing(마일링): 내가 찾던 나만의 영어 지문 학습 장소 👻**
> 

**MyLing**은 사용자가 직접 가져온 영어 지문을 편하게 학습할 수 있도록 설계된 웹 서비스입니다. PDF나 이미지 파일을 업로드하면 텍스트를 자동으로 추출하고, 문장 단위로 자연스러운 번역을 제공합니다. 또한 학습 중에 발견한 단어를 단어장에 저장해 관리할 수 있어, 지문 독해와 어휘 학습을 한 번에 진행할 수 있는 환경을 제공합니다. 추가로 번역본을 PDF로 저장할 수 있는 기능을 구현하여, 태블릿을 많이 이용하는 요즘의 공부 방식에서도 유용하게 사용될 수 있습니다.

이 프로젝트의 아이디어는 고등학생 시절에 쌓였던 불편함에서 시작되었습니다. 지금처럼 AI 도구가 활발하지 않던 그때에는, 수능특강이나 모의고사 지문을 직접 타이핑한 뒤 번역기에 넣고, 모르는 단어는 따로 찾아 정리하는 식으로 공부해야 했는데, 시간이 많이 들고 반복적인 과정이었습니다. “문장마다 번역과 단어 정보를 한 번에 보여주는 도구가 있으면 얼마나 좋을까?”라는 생각이 자연스럽게 들다가 다시 잊혀지던 때 이번 학기에 영어독해 연습이라는 과목을 들으며 비슷한 불폄함을 다시 겪게 되었습니다.

마침 이번 학기 오픈소스소프트웨어 텀프로젝트에서 자유 주제로 프로젝트를 만들 수 있는 기회가 생겼고, 동시에 영어독해연습 수업을 듣고 있었기 때문에 실제 학습 상황에 바로 적용하며 구현과 실험을 해보기 좋은 환경이 마련되었다고 느꼈습니다. MyLing은 영어 지문을 자주 접하는 학생들뿐만 아니라, 영어 독해와 단어 학습을 효율적으로 병행하고 싶은 모든 학습자를 위한 **나만의 영어 지문 학습 공간**을 목표로 개발되었습니다.

---

# 3. 제작 과정 (Making Process)

### 9월
- 아이디어 및 주요 기능 구상

### 11월
- Figma 페이지 디자인 & UI/UX 설계
    (캐릭터를 활용해 서비스의 느낌과 전반적인 디자인 스타일을 정리했습니다.)
- 초기 구현 시작

### 12월
- 홈, About 페이지 디자인 구현
- pdf 저장, 단어장, 문단 구분 기능 등 구현
- 배포 및 최종 테스트

---

# 4. 데모 (Demo)

---

# 5. 주요 기능 (Features)

### **1. 텍스트 자동 추출 (OCR 기술)**

- pytesseract (0.3.10) - Tesseract OCR Python 래퍼
- pdfplumber (0.10.3) - PDF 텍스트 추출
- Pillow (>=10.2.0) - 이미지 처리

PDF와 이미지에서 텍스트를 추출합니다. PDF는 pdfplumber로 텍스트를 추출하고, 이미지는 pytesseract로 OCR을 수행합니다.<br/>
PDF는 단어 단위 추출 후 문장/문단으로 재구성하고, 이미지는 Tesseract OCR로 텍스트를 인식합니다.

### **2. DeepL API를 활용한 한국어 번역 기능**

- deepl (1.15.0) - DeepL API Python SDK
- DeepL API (유료 서비스)

DeepL API로 영어를 한국어로 번역합니다. (단, 실제 번역 API는 유료 서비스이며, 무로 할당량을 사용하였습니다.)<br/>
문단 단위로 분리한 뒤 문장 단위로 번역하고, 제목 라인은 번역에서 제외합니다. 번역 결과는 영어-한국어 쌍으로 저장됩니다.

### **3. 문단 편집/재구성 기능**

- React 상태 관리
- frontend/components/TranslationView.tsx

자동 구분된 문단을 수동으로 편집할 수 있습니다. 문장 단위로 문단 경계를 설정/해제해 분리/병합이 가능합니다.<br/>
변경 사항은 백엔드 API로 전송되어 문단 구조가 재구성됩니다.

### **4. Transformer 기반 주제 자동 분류**

- transformers (>=4.30.0) - Hugging Face Transformers
- torch (>=2.0.0) - PyTorch
- Zero-shot Classification 모델: typeform/distilbert-base-uncased-mnli
- 키워드 기반 분류 (하이브리드)

키워드 기반과 Zero-shot Classification을 결합해 주제를 분류합니다.<br/>
키워드 매칭(가중치 0.7)과 Transformer 모델 점수(가중치 0.3)를 결합해 인문, 자연과학, 공학·기술, 예술·문화 중 하나로 분류합니다.<br/>
모델 로드 실패 시 키워드 기반만 사용하도록 하였습니다.

### **5. 스마트 단어장 관리**

- sqlalchemy (2.0.23) - ORM
- aiosqlite (0.19.0) - 비동기 SQLite
- Free Dictionary API - 단어 뜻 검색

학습한 단어를 자동 저장하고 관리합니다. 텍스트에서 영어 단어를 추출해 단어장에 저장하고, Free Dictionary API로 뜻을 검색해 DeepL로 번역합니다.<br/>
단어별로 "알고 있음/모름" 상태를 표시하고, 지문별 또는 전체 단어를 조회할 수 있습니다.

### **6. PDF 생성 기능 (지문+번역+단어)**

- jspdf (2.5.1) - PDF 생성 라이브러리
- 한글 폰트 지원 (Malgun Gothic)

번역된 지문과 단어를 포함한 PDF를 생성합니다. 영어 원문과 한국어 번역을 문단별로 정리하고, 단어는 해당 문단 옆에 배치합니다.<br/>
한글 폰트(Malgun Gothic)를 포함해 한글 표시를 지원합니다. Step 2에서는 지문+번역, Step 3에서는 지문+번역+단어가 포함됩니다.

### **7. 학습 기록 관리**

- sqlalchemy (2.0.23) - ORM
- aiosqlite (0.19.0) - 비동기 SQLite

학습한 지문을 저장하고 관리합니다. 제목, 영어/한국어 텍스트, 번역된 문단, 학습 단계, 주제, 단어 목록을 저장합니다.<br/>
마이페이지에서 목록 조회, 제목/최신순 정렬, 주제별 필터링, 삭제가 가능합니다. 저장된 지문은 다시 학습하거나 PDF로 저장할 수 있습니다.

### **8. 주제별 논문 추천 (링기의 배달)**

- React Router (URL 파라미터)
- 하드코딩된 논문 데이터

학습한 지문의 주제에 맞춘 논문/기사를 추천합니다. 인문, 자연과학, 공학·기술, 예술·문화 주제별로 논문 목록을 제공하고,<br/>
마이페이지에서 주제 클릭 시 해당 섹션으로 이동합니다. 각 논문은 영어/한국어 제목, 커버 이미지, 링크를 포함합니다.

---

# 6. 기술 스택 (Tech Stack)

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Axios, jsPDF
- **Backend:** FastAPI, Python 3.11, Uvicorn, SQLAlchemy, SQLite, aiosqlite
- **AI/ML:** Transformers (PyTorch), Tesseract OCR, pdfplumber
- **Design**: Figma
- **Services:** DeepL API, Free Dictionary API
- **Infrastructure:** Vercel (Frontend), Railway (Backend), Docker

---

# 7. 프로젝트 구조 (Project Structure)

```smalltalk
MyLing/
├── backend/ # 백엔드 (FastAPI)
│ ├── services/
│ │ ├── ocr_service.py # OCR 텍스트 추출
│ │ ├── translation_service.py # DeepL 번역
│ │ ├── vocabulary_service.py # 단어장 관리
│ │ ├── dictionary_service.py # 단어 뜻 검색
│ │ ├── storage_service.py # 데이터베이스 관리
│ │ └── topic_classification_service.py # 주제 분류
│ ├── models/ # 데이터 모델
│ │ └── schemas.py
│ ├── uploads/ # 업로드된 파일 저장
│ ├── main.py # FastAPI 애플리케이션
│ ├── requirements.txt
│ └── api.env # 환경 변수 (DEEPL_API_KEY)
│
├── frontend/ # 프론트엔드 (Next.js)
│ ├── app/ # Next.js App Router
│ │ ├── page.tsx # 홈페이지
│ │ ├── learn/ # 학습하기 페이지
│ │ ├── vocabulary/ # 단어장 페이지
│ │ ├── mypage/ # 마이페이지
│ │ ├── delivery/ # 논문 배달 페이지
│ │ └── about/ # About 페이지
│ ├── components/ # React 컴포넌트
│ │ ├── FileUpload.tsx # 파일 업로드
│ │ ├── TranslationView.tsx # 번역 결과 표시
│ │ ├── WordOrganization.tsx # 단어 정리
│ │ └── ...
│ ├── lib/ # 유틸리티
│ │ ├── api.ts # API 클라이언트
│ │ ├── pdfGenerator.ts # PDF 생성
│ │ └── fontLoader.ts # 한글 폰트 로더
│ ├── public/
│ │ ├── fonts/ # 한글 폰트
│ │ └── screens/ # 홈화면의 스크린샷
│ └── package.json
│
├── main.py # 루트 실행 파일 (Railway 배포용)
├── Dockerfile # Docker 설정
├── railway.json # Railway 배포 설정
├── requirements.txt # 루트 requirements (Railway용)
└── README.md # 리드미
```

---

# 8. 설계·구현 과정 및 문제 해결 (Design & Implementation Notes)

### **1. 기술 선택 이유 (Technology Choices)**

- **PDF와 이미지 처리 방식 분리**
    
    PDF는 `pdfplumber`로 텍스트 레이어를 추출하고, 이미지는 `Tesseract OCR`을 사용해 문자를 인식하도록 구성했습니다.<br/>
    파일 유형에 맞는 방식을 적용하여 정확도를 높였습니다.
    
- **DeepL API 선택**
    
    여러 번역 API를 비교한 결과, 문맥 보존력이 우수한 DeepL API를 사용했습니다.<br/>
    학습용 지문 번역에 가장 적합하다고 판단했습니다. (단, 이 프로젝트의 API는 무료 할당량 사용 중입니다.)
    
- **주제 분류의 하이브리드 방식 적용**
    
    키워드 기반 분류와 Transformer 기반 Zero-shot Classification을 함께 사용했습니다.<br/>
    빠른 처리 속도와 맥락 이해를 모두 반영하기 위한 결정이었습니다.
    

---

### **2. 문제 해결 (Troubleshooting)**

- **PDF 텍스트 줄바꿈/공백 오류**
    
    추출된 텍스트의 구조가 흐트러지는 문제를 정규화 과정과 줄 단위 재구성 로직으로 해결했습니다.
    
- **CORS 오류**
    
    Vercel 프리뷰 도메인이 변동되는 문제를 정규식 기반 허용 도메인 설정으로 해결했습니다.
    

---

### **3. 성능 및 품질 개선 (Performance Improvements)**

- **OCR 텍스트 정리 품질 향상**
    
    단어의 위치(Y좌표)를 기준으로 줄 단위로 묶고, 불필요한 공백을 제거해 자연스러운 텍스트 구조를 확보했습니다.
    
- **문단 자동 분리 로직 개선**
    
    제목·저자·챕터 라인을 자동 감지하고, 문단 번호 패턴을 활용해 문단을 더 정확하게 분리하도록 개선했습니다.
    
- **모델 크기 최적화**
    
    경량 모델을 사용해 빌드 시간과 배포 이미지 크기를 줄였으며, 응답 속도도 개선했습니다.
    
- **단어 뜻 조회 안정성 강화**
    
    Free Dictionary API 실패 시 DeepL로 자동 대체하도록 구성해 조회 실패율을 낮췄습니다.
    

---

### **4. 사용자 경험(UX) 개선 (UX Enhancements)**

- **문장 단위 번역 제공**
    
    문단 전체가 아닌 문장 단위로 번역을 제공해 학습자가 대응 관계를 더 쉽게 파악할 수 있도록 했습니다.
    
- **문단·문장 편집 기능 제공**
    
    자동 분리된 문단을 사용자가 직접 수정할 수 있도록 하여 편의성을 높였습니다.
    
- **로딩 상태 시각화**
    
    업로드, 번역, PDF 생성 과정에서 진행률 표시와 로딩 화면을 제공해 사용자에게 명확한 피드백을 전달했습니다.
    
- **Toast 알림 시스템 도입**
    
    성공/실패 메시지를 간단한 Toast로 제공하여 화면 흐름을 방해하지 않도록 구성했습니다.
    
- **PDF 한글 폰트 적용**
    
    jsPDF에 한글 폰트를 등록해 PDF 내보내기 시 한글 깨짐 문제를 해결했습니다.
    

---

# 9. 참고 자료 (References)

- 영어 문장과 번역본을 PDF로 저장할 때 발생한 한글 깨짐 문제 해결 과정에서 다음 자료를 참고했습니다:<br/>
    [https://eonhwa-theme.tistory.com/183#google_vignette](https://eonhwa-theme.tistory.com/183#google_vignette)
- 주제별 추천 논문·기사 목록은 ChatGPT의 도움을 받아 수집한 자료를 기반으로 정리했습니다.
- 코드 구현과 설계 과정에서 ChatGPT와 Cursor의 조언을 참고했습니다.

---

### 공식 문서 (Documentation)

- FastAPI Documentation: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- Hugging Face Transformers Guide: [https://huggingface.co/docs/transformers](https://huggingface.co/docs/transformers)
- Tesseract OCR Docs: [https://tesseract-ocr.github.io/docs/](https://tesseract-ocr.github.io/docs/)
- pdfplumber Documentation: [https://github.com/jsvine/pdfplumber](https://github.com/jsvine/pdfplumber)

---

# 10. 라이선스 (License)

본 프로젝트는 **MIT License**로 공개합니다.
자세한 내용은 아래의 LICENSE 전문을 참고해 주세요.

```vbnet
MIT License

Copyright (c) 2025 [Choi Se-yeong]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

```

---

### 사용한 오픈소스 라이브러리 및 라이선스

아래는 본 프로젝트에서 사용한 주요 오픈소스 라이브러리와 해당 라이선스입니다.<br/>
모든 라이브러리는 원저작권 및 라이선스 조건을 준수하여 사용되었습니다.

### **MIT License**
- **Frontend:** Next.js, React, React DOM, Axios, jsPDF, Tailwind CSS, PostCSS, Autoprefixer
- **Backend:** FastAPI, SQLAlchemy, Pydantic, python-dotenv, deepl, pdfplumber, aiosqlite
### **Apache-2.0 License**
- TypeScript, Transformers, pytesseract, python-multipart
### **BSD License**
- Uvicorn, PyTorch, httpx
### **PIL License (HPND)**
- Pillow

---

# 11. 개발자 정보 (Author)

**Developer:** Choi Se-yeong ([going-well6681@seoultech.ac.kr](mailto:going-well6681@seoultech.ac.kr))

> 필요해서 만들었고, 만들다 보니 더 애정이 생긴 프로젝트입니다.
> MyLing이 여러분의 공부에도 작은 도움이 되면 좋겠습니다. 🐣💛
