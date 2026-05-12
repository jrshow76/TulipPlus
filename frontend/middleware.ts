import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes need authentication; we rely on client-side gating via
// tokens in localStorage. This middleware only handles a public-route
// redirect so that authenticated users hitting /login or /register are kept
// away from auth pages — but since tokens live in localStorage, the actual
// gating happens in (protected)/layout.tsx on the client.
//
// We keep this file present for future expansion (e.g. cookie-based JWT).
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
