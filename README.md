<img width="1297" height="234" alt="Image" src="https://github.com/user-attachments/assets/07896e94-fcec-426d-ab4a-b1bc1b8e3bf2" />

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
<img width="1893" height="858" alt="Image" src="https://github.com/user-attachments/assets/b71f949f-2460-4804-bee8-ac8ca437aab1" />


**MyLing**은 사용자가 직접 가져온 영어 지문을 편하게 학습할 수 있도록 설계된 웹 서비스입니다. PDF나 이미지 파일을 업로드하면 텍스트를 자동으로 추출하고, 문장 단위로 자연스러운 번역을 제공합니다. 또한 학습 중에 발견한 단어를 단어장에 저장해 관리할 수 있어, 지문 독해와 어휘 학습을 한 번에 진행할 수 있는 환경을 제공합니다. 추가로 번역본을 PDF로 저장할 수 있는 기능을 구현하여, 태블릿을 많이 이용하는 요즘의 공부 방식에서도 유용하게 사용될 수 있습니다.

이 프로젝트의 아이디어는 고등학생 시절에 쌓였던 불편함에서 시작되었습니다. 지금처럼 AI 도구가 활발하지 않던 그때에는, 수능특강이나 모의고사 지문을 직접 타이핑한 뒤 번역기에 넣고 한줄 한줄 문서 작업을 해야 했습니다. 또 모르는 단어는 따로 찾아 정리하는 식으로 공부해야 했는데, 시간이 많이 들고 반복적인 과정이었습니다. “문장마다 번역과 단어 정보를 한 번에 보여주는 도구가 있으면 얼마나 좋을까?”라는 생각이 자연스럽게 들다가 다시 잊어가던 때 이번 학기에 영어독해 연습이라는 과목을 들으며 비슷한 불폄함을 다시 겪게 되었습니다.

마침 이번 학기 오픈소스소프트웨어 텀프로젝트에서 자유 주제로 프로젝트를 만들 수 있는 기회가 생겼고, 동시에 영어독해연습 수업을 듣고 있었기 때문에 실제 학습 상황에 바로 적용하며 구현과 실험을 해보기 좋은 환경이 마련되었다고 느꼈습니다. MyLing은 영어 지문을 자주 접하는 학생들뿐만 아니라, 영어 독해와 단어 학습을 효율적으로 병행하고 싶은 모든 학습자를 위한 **나만의 영어 지문 학습 공간**을 목표로 개발되었습니다.

---

# 3. 제작 과정 (Making Process)

### 🗓 9월
- 아이디어 및 주요 기능 구상

### 🗓 11월
- Figma 설계 (스토리와 테마를 설정하고 캐릭터 직접 디자인)  
<img width="800" height="951" alt="Image" src="https://github.com/user-attachments/assets/59fa2c5a-2caf-4d7c-985f-502fe079e40a" /><br/>
- 초기 구현 시작

### 🗓 12월
- 홈, About 페이지 디자인 구현
- pdf 저장, 단어장, 문단 구분 기능 등 구현
- 배포 및 최종 테스트

---

# 4. 데모 (Demo)
## 🟣 홈

### 홈화면 ▼<br/>
아래로 스크롤하며 전체 사용 흐름을 차례대로 확인할 수 있습니다.

![Image](https://github.com/user-attachments/assets/2dc3083a-2061-4aa1-89ea-121639fed60a)


## 🟣 학습하기

### 1. 파일 업로드 ▼<br/>
최대 5개의 파일을 업로드할 수 있으며, DeepL API로 번역이 되는 동안의 로딩화면입니다.

<img width="800" height="860" alt="Image" src="https://github.com/user-attachments/assets/783f08f6-1308-43ae-893e-67e16067cc7a" />
<img width="800" height="857" alt="Image" src="https://github.com/user-attachments/assets/11c98a18-7d41-4858-b5db-1bf231fee227" />
<br/>

### 2. 내 학습에 저장 & 문단 분리 ▼<br/>
내 학습에 저장을 눌러야만 마이페이지에서 지문을 다시볼 수 있습니다.<br/>
문단은 자동으로 구분되지만, 수동으로 문단을 다시 나눌 수 있습니다.<br/>
![Image](https://github.com/user-attachments/assets/9c2eee12-36b5-4f29-83ce-f8c985b4976c)
<br/>

### 3. 단어 저장 ▼<br/>
모르는 단어를 더블클릭하여 단어장에 저장합니다.  
![Image](https://github.com/user-attachments/assets/d647cefc-069f-4a76-b8a9-23bc1fffe40f)
<br/>

### 4. PDF 저장하기 ▼<br/>
단어 저장 후 PDF로 저장을 하면, 영어원문+한글+단어가 PDF에 저장됩니다.<br/>
만약 단어 저장 전 PDF로 저장을 하면, 영어원문+한글이 PDF에 저장됩니다.

![Image](https://github.com/user-attachments/assets/901e9ad0-9ac6-406a-9ac1-ac87e61aa5c3)
<br/>


## 🟣 단어장

### 1. 모르는 단어 → 아는 단어 ▼<br/>
단어 옆 동그라미를 체크해 보라색으로 만들면 이제 아는 단어를 표시할 수 있습니다.<br/>
체크시 전체 단어 중 아는 단어의 퍼센트가 올라가 학습률 확인이 가능합니다.<br/>
'모르는 단어만 보기' 체크박스로 학습이 필요한 단어만 볼 수 있습니다.

![Image](https://github.com/user-attachments/assets/556bfb7f-4db0-4f80-91c1-fadfe2beccf9)
<br/>

### 2. 지문별 단어
지문별로 저장한 단어를 볼 수 있습니다.

![Image](https://github.com/user-attachments/assets/2cd31fc0-ca3b-4e44-9d7a-39c04fd75ff2)
<br/>

## 🟣 마이페이지 & 링기의 배달

### 1. 학습한 지문 저장 ▼<br/>
내 학습에 저장하기를 지문들은 마이페이지에 저장됩니다.<br/>
바로가기를 누르면 최근에 학습을 멈췄던 Step으로 돌아갈 수 있습니다.

<img width="800" height="857" alt="Image" src="https://github.com/user-attachments/assets/d98c18a1-21c0-4796-a866-bb642372ec4a" />
<br/>

### 2. 주제 관련 자료 추천 ▼<br/>
마이페이지의 주제 버튼을 누르면 링기의 배달 페이지로 이동합니다.<br/>
지문의 주제와 관련된 논문/기사 등을 읽어볼 수 있습니다.

![Image](https://github.com/user-attachments/assets/0bb34bdf-cfa8-4a62-8005-5c7aed04a5eb)
<br/>
---

# 5. 주요 기능 (Features)

## 1. 텍스트 자동 추출 (OCR)  
**사용 기술:** pytesseract, pdfplumber, Pillow

PDF와 이미지에서 텍스트를 자동으로 추출합니다.
- PDF: pdfplumber로 단어 단위 텍스트와 위치 정보를 추출한 뒤, Y좌표 기준으로 줄을 묶고 간격·들여쓰기를 분석해 문단 구조로 재구성  
- 이미지: pytesseract로 OCR 수행 후, 블록/줄 정보를 활용해 문단을 분리  
- Pillow로 이미지 전처리(대비 개선, 노이즈 제거)를 수행해 인식률을 높임
- 제목·저자·챕터처럼 문단이 아닌 라인을 자동으로 걸러내고,  
문단 번호나 패턴을 기반으로 문단을 더 정확하게 나누는 방식으로 개선



## 2. 문단 자동 분리 기능 (OCR → 번역 단계)
**사용 기술:** `pdfplumber`, `pytesseract`, `Pillow`, `regex`

문단 분리는 두 단계를 걸쳐 이뤄집니다.  

### 1) OCR 단계: 레이아웃 기반 1차 분리
PDF·이미지의 위치 정보를 사용해 기본 문단을 구성합니다.
- `pdfplumber`로 단어 위치 추출 → Y좌표 기준 줄 단위 묶기  
- 줄 간 간격·들여쓰기·문장 끝 + 대문자 시작 여부로 문단 구분  
- 이미지의 경우 `pytesseract`의 블록/줄 정보를 활용해 문단 분리  
➡ **PDF/이미지의 실제 배치를 반영한 기본 문단 구조 생성.**

### 2) 번역 단계: 텍스트 패턴 기반 2차 정리
OCR 결과를 텍스트 규칙으로 다시 정리합니다.
- 빈 줄(`\n\n`) 기반 재분리  
- 제목/저자/챕터 라인 자동 제거  
- 문단 번호 패턴 `(2), (3)` 감지 및 분리  
- 불필요한 번호·공백 정리  
➡ **제목 제거·번호 처리 등 OCR에서 잡지 못한 부분 보완.**



## 3. 문단 재구성 기능
**사용 기술:** React (`useState`, `useEffect`)

잘못된 분리 오류를 보완하기 위해 추가했습니다  
- 문장 사이 클릭으로 문단 분리·병합하여 재구성  
- 변경된 구조는 백엔드 API로 전달  

## 4. Transformer 기반 주제 자동 분류
**사용 기술:** `transformers`, `torch`  
**모델:** `typeform/distilbert-base-uncased-mnli`

키워드 기반 점수와 Zero-shot Classification을 결합한 하이브리드 방식입니다.
- TopicClassificationService에서 zero-shot-classification을 호출할 때 transformers가 torch를 백엔드로 사용.
- 가벼운 모델(`distilbert-base-uncased-mnli`)을 사용해 응답 속도와 배포 효율을 개선.
- 분류 대상: **인문 / 자연과학 / 공학·기술 / 예술·문화**  
- 키워드 기반(가중치 0.7) + 모델 기반(가중치 0.3) 결합  
- 모델 로드 실패 시 키워드 기반으로 폴백  
- 분류 실패 시 ‘기타’ 카테고리 반환



## 5. 단어장 관리
**사용 기술:** `SQLAlchemy`, `aiosqlite`, Free Dictionary API, DeepL API

지문 학습 중 단어를 더블클릭하면 뜻을 추출하고 단어장 형태로 관리합니다.  
- 영어 단어 자동 추출(중복 제거, 불용어 제거)  
- 단어 상태 관리(알고 있음 / 모름)  
- 단어 수정·삭제 및 지문별/전체 단어 조회  
- 비동기(SQLite + SQLAlchemy + aiosqlite) 기반으로 동시 요청 처리  
  
### API 연동 방식
- **Free Dictionary API:** 먼저 영어 정의를 조회하고 추출  
- **DeepL API:** 앞에서 추출한 영어 정의를 한국어로 번역해 사전식으로 포맷팅  
- Free Dictionary API 실패 시 단어 자체를 DeepL로 번역하도록 폴백 처리를 하였습니다.
- 두 개의 외부 API를 호출하기 때문에 뜻을 불러오기까지 약간의 로딩시간이 있습니다.




## 6. PDF 생성 기능 (지문 + 번역 + 단어)
**사용 기술:** `jsPDF`, 한글 폰트(Malgun Gothic)

학습 내용을 PDF로 저장할 수 있습니다.
- Step 2: 지문+번역 / Step 3: 지문+번역+단어  
- 긴 내용은 자동 페이지 분할 처리



## 7. 학습 기록 저장 및 관리
**사용 기술:** `SQLAlchemy`, `aiosqlite`

학습한 지문을 저장해 이후에도 다시 학습할 수 있습니다.
- 제목, 원문/번역문, 문단 구조, 단어 목록, 주제 모두 저장  
- 제목/최신순 정렬 및 주제별 필터링  
- 저장된 지문 재학습 및 PDF 다시 저장 가능  



## 8. 주제별 논문 추천 (링기의 배달)
**사용 기술:** React Router  
**데이터:** 논문 url(하드코딩)

학습한 지문의 주제에 따라 관련 논문·기사를 추천합니다.
- 인문, 자연과학, 공학·기술, 예술·문화별 추천 목록 제공  
- 영어·한국어 제목, 커버 이미지, 외부 링크 포함  
- 마이페이지에서 주제 클릭 시 해당 섹션으로 이동  
- 카드 기반 UI로 가독성 강화  
🫶 논문·기사 목록은 ChatGPT의 도움을 받아 수집한 자료를 기반으로 정리했습니다!


---

# 6. 기술 스택 (Tech Stack)
<img width="700" height="698" alt="Image" src="https://github.com/user-attachments/assets/507ed12c-34df-46c9-aa72-6d56ac8a6786" /><br/>
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

## 8. 문제 해결 및 UX 개선 (Troubleshooting & System Improvements)

### 🐞 문제 해결 (Troubleshooting)

**PDF 텍스트 줄바꿈/공백 오류 해결**  
PDF에서 추출한 텍스트가 흐트러지는 문제가 있어, 단어의 Y좌표를 기준으로 줄 단위로 다시 묶고 불필요한 공백을<br/>
정리하는 방식으로 구조를 바로잡았습니다. 이를 통해 자연스러운 문단 형태를 유지할 수 있었습니다.

**마이페이지 바로가기 눌렀을 때 컨테이너 비어보임 문제 해결**  
마이페이지에서 저장된 학습을 불러올 때 컨테이너가 비어 보이는 문제가 있었습니다.<br/>
원인은 `paragraphs`가 JSON 문자열로 저장되면서 파싱 오류가 발생하거나, 빈 배열로 처리되어<br/>
`translationData`가 정상적으로 설정되지 않는 것이었습니다.  <br/>
그래서 JSON 파싱을 안전하게 처리하도록 했고, 배열 검증을 강화해 잘못된 형식일 경우 기본값을 적용했습니다.<br/>
또한 로딩 중에는 로딩 화면을 표시하도록 수정하여, 저장된 학습이 정상적으로 불러와지도록 했습니다.

**jsPDF 한글 깨짐 문제 해결**
PDF 생성 시 한글이 깨져 표시되는 문제가 있었습니다.  
원인은 jsPDF가 기본적으로 한글 폰트를 지원하지 않아 한글 문자가 제대로 렌더링되지 않았기 때문입니다.  
맑은 고딕 폰트 파일(MALGUN.TTF)을 프로젝트의 public/fonts 디렉토리에 포함하고,  
PDF 생성 시 폰트를 Base64로 로드해 jsPDF의 VFS(Virtual File System)에 등록하도록 수정했습니다.  
또한 한글 텍스트 렌더링 시 MalgunGothic 폰트를 명시적으로 사용하도록 변경하여 PDF 내 한글이 정상적으로 표시되도록 했습니다.

**환경 변수 로딩 문제 해결**  
Railway 배포 환경에서 환경 변수가 불러와지지 않는 문제가 있었습니다.<br/>
우선 환경 변수에서 값을 찾고, 없을 경우 `.env` 파일을 읽도록 폴백 로직을 추가했습니다.



### 🎨 사용자 경험(UX) 개선 (UX Enhancements)

**로딩 상태 시각화**  
파일 업로드, 번역, PDF 생성 과정에 로딩 화면과 진행률 표시를 추가해 사용자가 현재 상태를 명확히 파악할 수 있도록 했습니다.

**Toast 알림 시스템 적용**  
성공/실패 메시지를 Toast 형태로 표시해 화면 흐름을 방해하지 않도록 했습니다.<br/>
특히 실패 시에 모달보다 더 부드러운 느낌을 주는 것 같아 Toast 형태를 선택하였습니다.


**반응형 디자인 적용**  
모바일, 태블릿, PC 등 다양한 화면에서도 자연스럽게 보이도록 Tailwind CSS의 반응형 유틸리티를 활용해 레이아웃을 조정했습니다.  
😂 다만 모바일 버전에서는 글씨가 세로로 매우 길게 나열되어 시각적 편안은 보장하지 못합니다.


---

# 9. 참고 자료 (References)

- 영어 문장과 번역본을 PDF로 저장할 때 발생한 한글 깨짐 문제 해결 과정에서 다음 자료를 참고했습니다:  
    [https://eonhwa-theme.tistory.com/183#google_vignette](https://eonhwa-theme.tistory.com/183#google_vignette)  
- 전체적인 코드 구현과 설계 과정에서 ChatGPT와 Cursor의 조언을 참고했습니다.

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
