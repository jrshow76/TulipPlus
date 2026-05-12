'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStore } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const access = tokenStore.getAccess();
    router.replace(access ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-500">Loading…</div>
    </div>
  );
}
