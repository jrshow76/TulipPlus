'use client';

import { useEffect, useState } from 'react';
import { Users, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const stats = [
  { label: '총 사용자',   value: '1,284', delta: '+12%', icon: Users,       color: 'text-blue-600  bg-blue-50'   },
  { label: '활성 세션',   value: '342',   delta: '+4%',  icon: Activity,    color: 'text-green-600 bg-green-50'  },
  { label: '보안 이벤트', value: '7',     delta: '-30%', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50'  },
  { label: '월 성장률',   value: '8.2%',  delta: '+1.4%',icon: TrendingUp,  color: 'text-brand-600 bg-brand-50'  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loadProfile = useAuthStore((s) => s.loadProfile);
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    loadProfile();
    setNow(new Date().toLocaleString('ko-KR'));
  }, [loadProfile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          안녕하세요 {profile?.fullName || user?.username || ''}님, 오늘도 좋은 하루 보내세요.
          {now && <span className="ml-2 text-gray-400">({now})</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-green-600">{s.delta}</span> 지난 주 대비
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">활동 차트</h2>
          <div className="mt-4 flex h-64 items-end gap-2 rounded-md bg-gradient-to-b from-gray-50 to-white p-4">
            {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85, 50, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-brand-500/80 transition hover:bg-brand-600"
                style={{ height: `${h}%` }}
                title={`${h}%`}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-12 text-center text-xs text-gray-400">
            {['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900">내 계정</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">사용자명</dt>
              <dd className="font-medium text-gray-900">{user?.username || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">이메일</dt>
              <dd className="font-medium text-gray-900">{user?.email || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">권한</dt>
              <dd className="font-medium text-gray-900">{user?.role || '-'}</dd>
            </div>
            {profile?.phone && (
              <div className="flex justify-between">
                <dt className="text-gray-500">전화</dt>
                <dd className="font-medium text-gray-900">{profile.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
