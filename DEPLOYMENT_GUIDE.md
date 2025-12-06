# MyLing 배포 가이드

## 🚀 Railway 백엔드 배포 완료 후 단계

### 1️⃣ Railway에서 백엔드 URL 확인

1. Railway 대시보드에서 프로젝트 선택
2. **Settings** → **Domains** 또는 **Deployments** 탭에서 URL 확인
   - 예: `https://your-app-name.railway.app`
   - 또는 Railway가 제공하는 커스텀 도메인

### 2️⃣ Railway 환경 변수 설정 (CORS)

1. Railway 프로젝트 → **Variables** 탭
2. 다음 환경 변수 추가:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
   ```
   - 프론트엔드 도메인을 쉼표로 구분하여 추가
   - 여러 도메인이 있으면 모두 추가

### 3️⃣ 프론트엔드 배포

#### 옵션 A: Vercel 배포 (권장 - Next.js 최적화)

1. **Vercel 가입 및 프로젝트 연결**
   - [vercel.com](https://vercel.com) 접속
   - GitHub/GitLab/Bitbucket 저장소 연결
   - `frontend` 폴더를 루트로 설정

2. **환경 변수 설정**
   - Vercel 프로젝트 → **Settings** → **Environment Variables**
   - 다음 변수 추가:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     ```
   - **주의**: `NEXT_PUBLIC_` 접두사 필수!

3. **배포**
   - 저장소에 푸시하면 자동 배포
   - 또는 Vercel 대시보드에서 수동 배포

4. **배포 후 확인**
   - Vercel이 제공하는 URL 확인 (예: `https://your-app.vercel.app`)
   - 이 URL을 Railway의 `CORS_ALLOWED_ORIGINS`에 추가

#### 옵션 B: Railway에 프론트엔드도 배포

1. **새로운 Railway 서비스 생성**
   - 기존 프로젝트에 **New Service** 추가
   - GitHub 저장소 연결

2. **설정**
   - **Root Directory**: `frontend` 설정
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **환경 변수 설정**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   PORT=3000
   NODE_ENV=production
   ```

4. **도메인 설정**
   - Railway가 제공하는 URL 확인
   - 이 URL을 백엔드의 `CORS_ALLOWED_ORIGINS`에 추가

### 4️⃣ 최종 확인 및 테스트

1. **백엔드 확인**
   ```bash
   curl https://your-backend.railway.app/
   # 응답: {"message":"MyLing API is running"}
   ```

2. **프론트엔드 확인**
   - 브라우저에서 프론트엔드 URL 접속
   - 개발자 도구(F12) → Network 탭에서 API 요청 확인
   - CORS 오류가 없어야 함

3. **기능 테스트**
   - 파일 업로드
   - 번역 기능
   - 학습 저장/조회

## 🔧 문제 해결

### CORS 오류 발생 시

1. **백엔드 CORS 설정 확인**
   - Railway 환경 변수 `CORS_ALLOWED_ORIGINS` 확인
   - 프론트엔드 URL이 정확히 포함되어 있는지 확인
   - 프로토콜(`https://`) 포함 여부 확인

2. **프론트엔드 환경 변수 확인**
   - `NEXT_PUBLIC_API_URL`이 올바른 백엔드 URL인지 확인
   - 빌드 후 재배포 필요할 수 있음

### API 연결 실패 시

1. **백엔드 로그 확인**
   - Railway → **Deployments** → 로그 확인

2. **네트워크 확인**
   - 브라우저 개발자 도구 → Network 탭
   - 요청 URL과 상태 코드 확인

## 📝 체크리스트

- [ ] Railway 백엔드 URL 확인
- [ ] Railway에 `CORS_ALLOWED_ORIGINS` 환경 변수 설정
- [ ] 프론트엔드 배포 (Vercel 또는 Railway)
- [ ] 프론트엔드에 `NEXT_PUBLIC_API_URL` 환경 변수 설정
- [ ] 프론트엔드 URL을 백엔드 `CORS_ALLOWED_ORIGINS`에 추가
- [ ] 백엔드 API 테스트 (`/` 엔드포인트)
- [ ] 프론트엔드에서 API 호출 테스트
- [ ] 전체 기능 테스트

## 💡 팁

- **환경 변수 변경 후**: Railway는 자동으로 재배포하지만, Vercel은 수동 재배포가 필요할 수 있습니다.
- **도메인 변경 시**: 항상 백엔드와 프론트엔드 모두 업데이트해야 합니다.
- **로컬 개발**: `.env.local` 파일에 `NEXT_PUBLIC_API_URL=http://localhost:8000` 설정

