'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Lock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard',        label: '대시보드', icon: LayoutDashboard },
  { href: '/profile',          label: '내 프로필', icon: User },
  { href: '/profile/edit',     label: '프로필 수정', icon: Settings },
  { href: '/profile/password', label: '비밀번호 변경', icon: Lock },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="text-xl font-bold text-brand-700">
          Tulip+
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
