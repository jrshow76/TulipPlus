# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tulip+

> 생성일: 2026-05-12
> 템플릿: AI Dev Team (Claude Code 멀티 에이전트)

## 프로젝트 개요

사용자 인증/프로필 관리 + 대시보드를 갖춘 MSA 기반 웹 애플리케이션.

**Phase 1 기능**: 회원가입, 로그인, 프로필 상세/수정, 패스워드 변경, 대시보드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Java 17, Spring Boot 3.2, Spring Security, MyBatis |
| DB | PostgreSQL 16 |
| 인증 | JWT (Access 30분 / Refresh 14일, Rotation) |
| 인프라 | Docker, Docker Compose |

## 주요 명령어

```bash
# 전체 스택 실행 (권장)
cp .env.example .env
docker compose up -d --build

# 프론트엔드 개발 모드
cd frontend && npm install && npm run dev

# 백엔드 개별 실행 (DB는 컨테이너로)
docker compose up -d postgres
cd services/auth-service && mvn spring-boot:run
cd services/user-service && mvn spring-boot:run
```

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js :3000)                        │
│  /login  /register  /dashboard  /profile         │
└────────────┬────────────────┬────────────────────┘
             │                │
    ┌────────▼──────┐  ┌──────▼──────────┐
    │ auth-service  │  │  user-service   │
    │   :8081       │  │    :8082        │
    │ register      │  │ GET  /users/me  │
    │ login         │  │ PUT  /users/me  │
    │ refresh       │  │ PUT  /password  │
    │ logout        │  │                 │
    └────────┬──────┘  └──────┬──────────┘
             └────────┬───────┘
                 ┌────▼────────┐
                 │ PostgreSQL  │
                 │   :5432     │
                 │ users       │
                 │ user_profiles│
                 │ refresh_tokens│
                 └─────────────┘
```

## 테스트 계정

| 이메일 | 비밀번호 | 권한 |
|--------|----------|------|
| admin@tulip.com | password123 | ADMIN |
| user@tulip.com | password123 | USER |

---

## AI Dev Team 구성

| 에이전트 | 역할 | 모델 |
|---------|------|------|
| **pm** | 프로젝트 총괄 / 팀 조율 / 오케스트레이터 | Opus 4.7 |
| **architect** | 시스템 설계 / 기술 아키텍처 / ADR | Opus 4.7 |
| **researcher** | 기술 조사 / 벤치마킹 / PoC 검토 | Sonnet 4.6 |
| **designer** | UI/UX 설계 / 디자인 시스템 / 접근성 | Sonnet 4.6 |
| **frontend** | 프론트엔드 개발 / 컴포넌트 / 성능 최적화 | Sonnet 4.6 |
| **backend** | API 개발 / 비즈니스 로직 / 인증 | Sonnet 4.6 |
| **dba** | DB 설계 / 쿼리 최적화 / 마이그레이션 | Sonnet 4.6 |
| **devops** | CI/CD / 컨테이너 / IaC / 모니터링 | Sonnet 4.6 |
| **qa** | 테스트 전략 / 자동화 / 품질 관리 | Sonnet 4.6 |
| **doc** | 기술 문서 / 프로세스 정의 / 지식 관리 | Sonnet 4.6 |

### 에이전트 사용법

```bash
# 특정 에이전트와 직접 대화
/agents   # 에이전트 목록에서 선택

# pm에게 복잡한 작업 위임 → 팀 자동 구성 및 병렬 실행
```

### 워크플로우

- **신규 기능**: researcher → designer → frontend + backend → dba → qa
- **버그 수정**: backend/frontend → qa
- **성능 이슈**: dba → backend → devops
- **배포 준비**: qa → devops → doc

## 원칙
- 모든 대화는 한글로
- 병렬 처리 가능한 작업은 동시 실행
- pm이 오케스트레이터 — 복잡한 작업은 pm에게, 단일 전문 작업은 해당 에이전트에게 직접
