'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, ApiError } from '@/lib/api';

export default function ProfileEditPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [okMsg, setOkMsg]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await userApi.me();
        setForm({
          username:  p.username  || '',
          fullName:  p.fullName  || '',
          phone:     p.phone     || '',
          bio:       p.bio       || '',
          avatarUrl: p.avatarUrl || '',
        });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : '프로필을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);
    try {
      await userApi.updateMe(form);
      setOkMsg('프로필이 저장되었습니다.');
      setTimeout(() => router.push('/profile'), 800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-gray-500">불러오는 중…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">프로필 수정</h1>
        <p className="mt-1 text-sm text-gray-500">계정 정보를 업데이트하세요.</p>
      </div>

      <form onSubmit={onSubmit} className="card max-w-2xl space-y-5 p-6">
        <div>
          <label className="label">사용자명</label>
          <input
            type="text"
            className="input"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            minLength={2}
            maxLength={100}
          />
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

        <div>
          <label className="label">아바타 URL</label>
          <input
            type="url"
            className="input"
            placeholder="https://…"
            value={form.avatarUrl}
            onChange={(e) => update('avatarUrl', e.target.value)}
            maxLength={500}
          />
        </div>

        <div>
          <label className="label">소개</label>
          <textarea
            className="input min-h-[120px]"
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            maxLength={2000}
          />
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {okMsg && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{okMsg}</div>}

        <div className="flex items-center justify-end gap-2">
          <Link href="/profile" className="btn-secondary">취소</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
