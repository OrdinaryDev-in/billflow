import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_APP_PREFIXES = ["/login", "/sign-up", "/forgot-password", "/reset-password"];
const isPublicPrefixed = (pathname: string) =>
  PUBLIC_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Request header carrying the proxy-verified user (JSON-encoded) through to
 * Server Components via `headers()`. `getAuthUser()` trusts this instead of
 * calling `supabase.auth.getUser()` again, saving a second network round
 * trip to Supabase Auth on every render — the proxy below already did that
 * verification for this exact request. Always set explicitly on every
 * response path (present with the user, or deleted) so a client can never
 * forge it: `request.headers` here reflects the raw incoming request, so an
 * attacker-supplied value must never be allowed to pass through unset.
 */
export const VERIFIED_USER_HEADER = "x-billflow-verified-user";

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users away from protected app routes. Public marketing
 * pages, auth pages and the /q and /i public document routes are excluded
 * by the matcher in proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(VERIFIED_USER_HEADER);

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    requestHeaders.set(VERIFIED_USER_HEADER, JSON.stringify(user));
    // Rebuild the response with the header attached, carrying over any
    // session cookies `setAll` already wrote onto the previous response.
    const refreshedCookies = supabaseResponse.cookies.getAll();
    supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
    refreshedCookies.forEach((cookie) => supabaseResponse.cookies.set(cookie));
  }

  const { pathname } = request.nextUrl;
  const isProtectedAppRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/quotations") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/recurring") ||
    pathname.startsWith("/settings");

  if (!user && isProtectedAppRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isPublicPrefixed(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
