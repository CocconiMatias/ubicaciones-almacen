"use client";

import { useState, useTransition } from "react";
import { invitarUsuario } from "@/actions/usuarios";

export default function FormularioInvitarUsuario() {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  function handleSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await invitarUsuario(formData);
      if (resultado.ok) {
        setMensaje({ texto: "Invitación enviada por email.", ok: true });
        (document.getElementById("form-invitar") as HTMLFormElement)?.reset();
      } else {
        setMensaje({ texto: resultado.error, ok: false });
      }
    });
  }

  return (
    <form
      id="form-invitar"
      action={handleSubmit}
      className="mt-6 space-y-4 rounded-lg border border-base-border bg-base-surface p-6"
    >
      <h2 className="font-display text-lg font-semibold text-navy-900">Invitar a alguien nuevo</h2>

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

      {mensaje && (
        <p role="alert" className={`text-sm font-medium ${mensaje.ok ? "text-ocupacion-libre" : "text-ocupacion-llena"}`}>
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Enviando invitación..." : "Enviar invitación"}
      </button>
    </form>
  );
}
