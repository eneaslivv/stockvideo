import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Preview mode: skip auth when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isInvalid = !supabaseUrl ||
    ['placeholder', 'your_supabase', 'your-supabase', 'example'].some(v => supabaseUrl.toLowerCase().includes(v)) ||
    !supabaseUrl.includes('supabase');
  if (isInvalid) {
    return NextResponse.next();
  }

  // Production: use Supabase auth
  const { updateSession } = await import('@/lib/supabase/middleware');
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
