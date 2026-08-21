import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (static assets)
     * - favicon.ico
     * - public files (images, fonts, etc.)
     * - public document routes /q and /i (token-gated, handled per-page)
     * - api routes (auth handled per-route/webhook)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|q/|i/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
