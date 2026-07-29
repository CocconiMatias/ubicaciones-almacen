"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);

    if (error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-base-border bg-base-surface p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Ubicaciones de Almacén
        </h1>
        <p className="mt-1 text-sm text-navy-700">
          Ingresá con tu usuario para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-900">
              Usuario
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-900">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-ocupacion-llena">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
