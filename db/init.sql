-- ============================================================
-- Tulip+ Database Initialization Script
-- PostgreSQL 16+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS tulip;
SET search_path TO tulip, public;

-- ============================================================
-- Table: users (인증 정보)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    username     VARCHAR(100) NOT NULL UNIQUE,
    role         VARCHAR(20)  NOT NULL DEFAULT 'USER',
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role   CHECK (role IN ('USER','ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE','INACTIVE','LOCKED','DELETED'))
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_status   ON users (status);

-- ============================================================
-- Table: user_profiles (프로필 정보)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL UNIQUE,
    full_name    VARCHAR(150),
    phone        VARCHAR(30),
    bio          TEXT,
    avatar_url   VARCHAR(500),
    updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles (user_id);

-- ============================================================
-- Table: refresh_tokens (Refresh Token 저장)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    token        VARCHAR(500) NOT NULL UNIQUE,
    expires_at   TIMESTAMP    NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rt_user_id  ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_rt_token    ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS idx_rt_expires  ON refresh_tokens (expires_at);

-- ============================================================
-- Trigger: updated_at 자동 갱신
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed Data
-- 비밀번호는 BCrypt 해시: "password123"
-- $2a$10$s3.ecLOlwELGK13R5dJ7JeUg539.QMTTixdliHZw70P/q4JJdtXyi
-- ============================================================
INSERT INTO users (email, password, username, role, status)
VALUES
    ('admin@tulip.com', '$2a$10$s3.ecLOlwELGK13R5dJ7JeUg539.QMTTixdliHZw70P/q4JJdtXyi', 'admin', 'ADMIN', 'ACTIVE'),
    ('user@tulip.com',  '$2a$10$s3.ecLOlwELGK13R5dJ7JeUg539.QMTTixdliHZw70P/q4JJdtXyi', 'testuser', 'USER',  'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (user_id, full_name, phone, bio, avatar_url)
SELECT id, 'Administrator', '010-0000-0000', '시스템 관리자 계정', NULL FROM users WHERE email = 'admin@tulip.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_profiles (user_id, full_name, phone, bio, avatar_url)
SELECT id, 'Test User', '010-1234-5678', '테스트 사용자 계정', NULL FROM users WHERE email = 'user@tulip.com'
ON CONFLICT (user_id) DO NOTHING;
