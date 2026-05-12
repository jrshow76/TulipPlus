'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await authApi.register({
        email: form.email,
        password: form.password,
        username: form.username,
        fullName: form.fullName || undefined,
        phone: form.phone || undefined,
      });
      setAuth(tokens);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900">회원가입</h2>
      <p className="mt-1 text-sm text-gray-500">새 계정을 만들어 보세요.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">이메일 *</label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">사용자명 *</label>
          <input
            type="text"
            className="input"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            required
            minLength={2}
            maxLength={100}
            autoComplete="username"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">비밀번호 *</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">비밀번호 확인 *</label>
            <input
              type="password"
              className="input"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label className="label">이름</label>
          <input
            type="text"
            className="input"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            maxLength={150}
          />
        </div>

        <div>
          <label className="label">전화번호</label>
          <input
            type="tel"
            className="input"
            placeholder="010-0000-0000"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            maxLength={30}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '가입 중…' : '회원가입'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          로그인
        </Link>
      </p>
    </>
  );
}
