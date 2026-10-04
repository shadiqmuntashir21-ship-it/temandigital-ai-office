import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const OWNER_SESSION_COOKIE = "td_owner_session";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const path = request.nextUrl.pathname;
  const ownerCookiePresent = Boolean(request.cookies.get(OWNER_SESSION_COOKIE)?.value);
  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path === "/api/health" ||
    path === "/api/ai/smoke";

  if (!claims && !ownerCookiePresent && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (claims && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/kantor";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
