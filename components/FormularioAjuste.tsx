"use client";

import { useState, useTransition } from "react";
import { registrarAjuste } from "@/actions/movimientos";

export default function FormularioAjuste() {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  function handleSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await registrarAjuste(formData);
      if (resultado.ok) {
        setMensaje({ texto: "Ajuste registrado correctamente.", ok: true });
        (document.getElementById("form-ajuste") as HTMLFormElement)?.reset();
      } else {
        setMensaje({ texto: resultado.error, ok: false });
      }
    });
  }

  return (
    <form
      id="form-ajuste"
      action={handleSubmit}
      className="mt-6 space-y-4 rounded-lg border border-base-border bg-base-surface p-6"
    >
      <div>
        <label className="block text-sm font-medium text-navy-900">Tipo de ajuste</label>
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="sentido" value="alta" defaultChecked required />
            Alta (sumar cajas que faltaban)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="sentido" value="baja" required />
            Baja (restar cajas que no están)
          </label>
        </div>
      </div>

      <Campo label="Código">
        <input
          name="codigo"
          required
          placeholder="IFR0075000-A00000"
          className="w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
        />
      </Campo>

      <fieldset className="space-y-2 rounded-md border border-base-border p-3">
        <legend className="px-1 text-sm font-medium text-navy-900">Ubicación</legend>
        <div className="grid grid-cols-3 gap-2">
          <input name="sector" type="number" required placeholder="Sector" className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent" />
          <input name="calle" type="number" required placeholder="Calle" className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent" />
          <input name="posicion" type="number" required placeholder="Posición" className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent" />
        </div>
      </fieldset>

      <Campo label="Cantidad (cajas)">
        <input
          name="cantidad"
          type="number"
          min={1}
          required
          className="w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
        />
      </Campo>

      <Campo label="Motivo del ajuste (obligatorio)">
        <textarea
          name="motivo_ajuste"
          required
          rows={2}
          placeholder="Ej: recuento físico del 29/07 no coincidía con el sistema"
          className="w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
        />
      </Campo>

      <Campo label="Observaciones (opcional)">
        <textarea
          name="observaciones"
          rows={2}
          className="w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
        />
      </Campo>

      {mensaje && (
        <p role="alert" className={`text-sm font-medium ${mensaje.ok ? "text-ocupacion-libre" : "text-ocupacion-llena"}`}>
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Registrar ajuste"}
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-900">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
