# Tulip+

> Next.js + Spring Boot MSA + PostgreSQL 기반의 인증/프로필 플랫폼

## 기술 스택

- **Frontend**: Next.js 14 (App Router, TypeScript), Tailwind CSS, Zustand
- **Backend**: Spring Boot 3.2.x (Java 17), MyBatis (XML), Spring Security
- **DB**: PostgreSQL 16
- **Auth**: JWT (Access + Refresh, 회전 방식)
- **인프라**: Docker / Docker Compose

## 디렉토리 구조

```
Tulip+/
├── frontend/                    # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/             # 비인증 영역 (login, register)
│   │   ├── (protected)/        # 인증 영역 (dashboard, profile)
│   │   └── layout.tsx
│   ├── components/             # Sidebar, Header
│   ├── lib/                    # api.ts, store.ts, utils.ts
│   ├── Dockerfile
│   └── package.json
├── services/
│   ├── auth-service/           # 인증 (8081)
│   │   ├── src/main/java/com/tulipplus/auth/
│   │   │   ├── controller/     # AuthController
│   │   │   ├── service/        # AuthService
│   │   │   ├── mapper/         # UserMapper, RefreshTokenMapper
│   │   │   ├── domain/         # User, RefreshToken
│   │   │   ├── dto/            # Login/Register/Token DTO
│   │   │   ├── security/       # JwtUtil, JwtAuthenticationFilter, SecurityConfig
│   │   │   └── common/         # ApiResponse, BusinessException, GlobalExceptionHandler
│   │   ├── src/main/resources/mappers/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   └── user-service/           # 사용자 프로필 (8082)
│       └── (유사 구조)
├── db/
│   └── init.sql                # 스키마 + Seed 데이터
├── docker-compose.yml
└── .env.example
```

## 빠른 시작 (Docker Compose 권장)

```bash
# 1. 환경 변수 준비
cp .env.example .env

# 2. 전체 스택 빌드 + 실행
docker compose up -d --build

# 3. 상태 확인
docker compose ps
docker compose logs -f auth-service user-service
```

서비스 접근:

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Auth Service | http://localhost:8081 |
| User Service | http://localhost:8082 |
| PostgreSQL | localhost:5432 (db: `tulipdb`, user: `tulip`, pw: `tulip1234`) |

## 개별 실행 (개발 모드)

**PostgreSQL** (Docker로 단독 실행)

```bash
docker compose up -d postgres
```

**Auth Service**

```bash
cd services/auth-service
./mvnw spring-boot:run    # 또는: mvn spring-boot:run
```

**User Service**

```bash
cd services/user-service
mvn spring-boot:run
```

**Frontend**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## API 엔드포인트

### Auth Service (`http://localhost:8081`)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/auth/register` | No  | 회원가입 (JWT 즉시 발급) |
| POST | `/api/auth/login`    | No  | 로그인 |
| POST | `/api/auth/refresh`  | No  | 토큰 갱신 (refresh 회전) |
| POST | `/api/auth/logout`   | Yes | 로그아웃 (refresh 무효화) |

### User Service (`http://localhost:8082`)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/users/me`          | Yes | 내 프로필 조회 |
| PUT | `/api/users/me`          | Yes | 프로필 수정 |
| PUT | `/api/users/me/password` | Yes | 비밀번호 변경 |

모든 인증 API는 `Authorization: Bearer <accessToken>` 헤더 필요.

## 테스트 계정 (init.sql Seed)

| 이메일 | 비밀번호 | 권한 |
|--------|----------|------|
| `admin@tulip.com` | `password123` | ADMIN |
| `user@tulip.com`  | `password123` | USER  |

## API 호출 예시

```bash
# 로그인
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tulip.com","password":"password123"}'

# 프로필 조회 (위에서 받은 accessToken 사용)
TOKEN="<accessToken>"
curl http://localhost:8082/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 프로필 수정
curl -X PUT http://localhost:8082/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"홍길동","phone":"010-1111-2222","bio":"안녕하세요"}'
```

## 데이터베이스 스키마

- `tulip.users` — 인증 (id, email, password, username, role, status)
- `tulip.user_profiles` — 프로필 (full_name, phone, bio, avatar_url)
- `tulip.refresh_tokens` — Refresh Token 저장소

## 주요 보안

- 비밀번호: BCrypt 해시
- JWT: HS256, Access 30분 / Refresh 14일
- Refresh Rotation: 갱신 시 기존 토큰 폐기 후 새 토큰 발급
- CORS: 환경변수 `CORS_ORIGINS`로 제어
- Spring Security: STATELESS 세션, 모든 요청에 JWT 필터 적용

## 운영 명령어

```bash
docker compose ps                    # 컨테이너 상태
docker compose logs -f <service>     # 로그 추적
docker compose restart <service>     # 재시작
docker compose down                  # 종료
docker compose down -v               # 종료 + 볼륨 삭제 (DB 초기화)

# DB 접속
docker compose exec postgres psql -U tulip -d tulipdb
```
