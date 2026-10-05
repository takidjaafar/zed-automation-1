import { handleDashboardRoutes, getAuthenticatedUser } from '@/features/dashboard/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only run dashboard auth checks on dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Get authenticated user for dashboard access control
  const { user, redirectToInit } = await getAuthenticatedUser(request);
  
  // Let dashboard handler manage its routes
  const dashboardResponse = await handleDashboardRoutes(request, user, redirectToInit);
  if (dashboardResponse) return dashboardResponse;
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.svg (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.svg).*)',
  ],
};