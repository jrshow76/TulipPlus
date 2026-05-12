'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userApi, UserProfile, ApiError } from '@/lib/api';
import { Mail, Phone, ShieldCheck, User, FileText, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await userApi.me();
        setProfile(p);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : '프로필을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-500">불러오는 중…</div>;
  if (error)   return <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>;
  if (!profile) return null;

  const rows: { label: string; value: string | null; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: '사용자명',  value: profile.username,                  icon: User },
    { label: '이메일',    value: profile.email,                     icon: Mail },
    { label: '이름',      value: profile.fullName,                  icon: User },
    { label: '전화번호',  value: profile.phone,                     icon: Phone },
    { label: '권한',      value: profile.role,                      icon: ShieldCheck },
    { label: '소개',      value: profile.bio,                       icon: FileText },
    { label: '가입일',    value: new Date(profile.createdAt).toLocaleDateString('ko-KR'), icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
          <p className="mt-1 text-sm text-gray-500">계정 정보를 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile/edit"     className="btn-primary">프로필 수정</Link>
          <Link href="/profile/password" className="btn-secondary">비밀번호 변경</Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xl font-bold">
            {(profile.fullName || profile.username || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {profile.fullName || profile.username}
            </p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {profile.role}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-500">{r.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 break-all">
                    {r.value || <span className="text-gray-400">미입력</span>}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
