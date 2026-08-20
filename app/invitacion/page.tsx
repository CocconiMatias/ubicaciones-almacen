"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function InvitacionPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [verificando, setVerificando] = useState(true);
  const [sesionValida, setSesionValida] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // El link de invitación trae un token en el fragmento de la URL (#...).
    // El cliente de Supabase lo procesa solo apenas se crea, y dispara este
    // evento cuando la sesión temporal queda lista.
    const { data: listener } = supabase.auth.onAuthStateChange((evento, session) => {
      if (session) {
        setSesionValida(true);
        setVerificando(false);
      }
    });

    // Por si el evento ya disparó antes de que este componente se montara.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSesionValida(true);
      setVerificando(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setGuardando(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-base-border bg-base-surface p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Activar tu cuenta
        </h1>

        {verificando && (
          <p className="mt-4 text-sm text-navy-700">Verificando la invitación...</p>
        )}

        {!verificando && !sesionValida && (
          <p className="mt-4 text-sm text-ocupacion-llena">
            Este link de invitación no es válido o ya venció. Pedile a un Administrador que te
            mande uno nuevo desde la sección Usuarios.
          </p>
        )}

        {!verificando && sesionValida && (
          <>
            <p className="mt-1 text-sm text-navy-700">Elegí tu contraseña para poder entrar.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900">
                  Repetir contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-ocupacion-llena">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Activar cuenta"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
