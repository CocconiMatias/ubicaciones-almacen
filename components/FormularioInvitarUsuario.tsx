"use client";

import { useState, useTransition } from "react";
import { crearUsuario } from "@/actions/usuarios";

function generarPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let resultado = "";
  for (let i = 0; i < 10; i++) {
    resultado += chars[Math.floor(Math.random() * chars.length)];
  }
  return resultado;
}

export default function FormularioInvitarUsuario() {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await crearUsuario(formData);
      if (resultado.ok) {
        setCreado({ email: String(formData.get("email")), password: String(formData.get("password")) });
        (document.getElementById("form-crear-usuario") as HTMLFormElement)?.reset();
        setPassword("");
      } else {
        setMensaje({ texto: resultado.error, ok: false });
      }
    });
  }

  return (
    <form
      id="form-crear-usuario"
      action={handleSubmit}
      className="mt-6 space-y-4 rounded-lg border border-base-border bg-base-surface p-6"
    >
      <h2 className="font-display text-lg font-semibold text-navy-900">Crear usuario nuevo</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-navy-900">Nombre y apellido</label>
          <input
            name="nombre"
            required
            className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-900">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-navy-900">Rol</label>
          <select
            name="rol"
            required
            defaultValue="operario"
            className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
          >
            <option value="operario">Operario</option>
            <option value="auditor">Auditor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-900">Contraseña</label>
          <div className="mt-1 flex gap-2">
            <input
              name="password"
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm focus-visible:border-accent"
            />
            <button
              type="button"
              onClick={() => setPassword(generarPassword())}
              className="shrink-0 rounded-md border border-navy-900 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-navy-900/5"
            >
              Generar
            </button>
          </div>
        </div>
      </div>

      {mensaje && (
        <p role="alert" className={`text-sm font-medium ${mensaje.ok ? "text-ocupacion-libre" : "text-ocupacion-llena"}`}>
          {mensaje.texto}
        </p>
      )}

      {creado && (
        <div className="rounded-md border border-ocupacion-libre bg-ocupacion-libre/10 p-3 text-sm">
          <p className="font-medium text-navy-900">Usuario creado. Pasale estos datos:</p>
          <p className="mt-1 font-mono">
            Email: {creado.email}
            <br />
            Contraseña: {creado.password}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
