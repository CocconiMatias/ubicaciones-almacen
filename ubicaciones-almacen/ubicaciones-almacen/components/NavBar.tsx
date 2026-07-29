"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/dashboard", label: "Mapa" },
  { href: "/registro", label: "Registrar" },
  { href: "/buscador", label: "Buscar" },
  { href: "/relevamientos", label: "Relevamientos" },
];

export default function NavBar({ nombre, rol }: { nombre: string; rol: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Nav superior — desktop / tablet */}
      <header className="hidden border-b border-base-border bg-navy-900 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <span className="font-display text-lg font-semibold text-white">
              Ubicaciones
            </span>
            <nav className="flex gap-1">
              {ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    pathname.startsWith(item.href)
                      ? "bg-navy-700 text-white"
                      : "text-white/70 hover:bg-navy-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span>
              {nombre} <span className="text-white/50">· {rol}</span>
            </span>
            <button
              onClick={cerrarSesion}
              className="rounded-md px-3 py-1.5 font-medium text-white/80 hover:bg-navy-700 hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar inferior — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-base-border bg-base-surface sm:hidden">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              pathname.startsWith(item.href) ? "text-accent" : "text-navy-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Header simple mobile con nombre/salir */}
      <header className="flex items-center justify-between border-b border-base-border bg-base-surface px-4 py-3 sm:hidden">
        <span className="font-display font-semibold text-navy-900">Ubicaciones</span>
        <button onClick={cerrarSesion} className="text-sm font-medium text-navy-700">
          Salir
        </button>
      </header>
    </>
  );
}
