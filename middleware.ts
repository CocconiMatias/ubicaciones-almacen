import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren rol Administrador (ajustes, alta de usuarios, etc.)
const RUTAS_SOLO_ADMIN = ["/admin"];

export async function middleware(request: NextRequest) {
  // Cookies pendientes de escribir (ej. refresh de sesión). Se acumulan
  // acá y se aplican al final sobre CUALQUIER respuesta que se devuelva,
  // incluidos los redirects — si no, un refresh de token se pierde
  // justo en los casos en que además redirigimos.
  const cookiesParaEscribir: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesParaEscribir.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesParaEscribir.push({ name, value: "", options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // /invitacion tiene que ser pública: cuando alguien abre el link de
  // invitación todavía no tiene sesión "oficial" (cookie) — la sesión
  // temporal se arma en el navegador a partir del token en el fragmento
  // de la URL, así que el middleware no puede exigir login acá.
  const esRutaPublica = pathname.startsWith("/login") || pathname.startsWith("/invitacion");

  function conCookies(response: NextResponse) {
    for (const { name, value, options } of cookiesParaEscribir) {
      response.cookies.set({ name, value, ...options });
    }
    return response;
  }

  if (!user && !esRutaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return conCookies(NextResponse.redirect(url));
  }

  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return conCookies(NextResponse.redirect(url));
  }

  if (user && RUTAS_SOLO_ADMIN.some((r) => pathname.startsWith(r))) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (perfil?.rol !== "administrador") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return conCookies(NextResponse.redirect(url));
    }
  }

  return conCookies(NextResponse.next({ request: { headers: request.headers } }));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
