import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const url = new URL(req.url);
  if (process.env.NODE_ENV === 'production' && url.pathname.startsWith('/_internal')) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/(_internal/:path*)'],
};