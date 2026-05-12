'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, ApiError } from '@/lib/api';

export default function PasswordChangePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [error, setError]   = useState<string | null>(null);
  const [okMsg, setOkMsg]   = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (form.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    try {
      await userApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setOkMsg('비밀번호가 변경되었습니다.');
      setForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
      setTimeout(() => router.push('/profile'), 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
        <p className="mt-1 text-sm text-gray-500">계정 보안을 위해 주기적으로 변경하세요.</p>
      </div>

      <form onSubmit={onSubmit} className="card max-w-md space-y-5 p-6">
        <div>
          <label className="label">현재 비밀번호</label>
          <input
            type="password"
            className="input"
            value={form.currentPassword}
            onChange={(e) => update('currentPassword', e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="label">새 비밀번호</label>
          <input
            type="password"
            className="input"
            value={form.newPassword}
            onChange={(e) => update('newPassword', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">새 비밀번호 확인</label>
          <input
            type="password"
            className="input"
            value={form.newPasswordConfirm}
            onChange={(e) => update('newPasswordConfirm', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {okMsg && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{okMsg}</div>}

        <div className="flex items-center justify-end gap-2">
          <Link href="/profile" className="btn-secondary">취소</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '변경 중…' : '변경'}
          </button>
        </div>
      </form>
    </div>
  );
}
