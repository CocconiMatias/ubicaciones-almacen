"use client";

import { useState, useTransition } from "react";
import { agregarCodigos } from "@/actions/codigos";
import CodigoInput from "@/components/CodigoInput";

export default function FormularioCodigo() {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function handleSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const r = await agregarCodigos(formData);
      if (r.ok) {
        setMensaje({ texto: r.mensaje, ok: true });
        (document.getElementById("form-codigo") as HTMLFormElement)?.reset();
        setResetKey((k) => k + 1);
      } else {
        setMensaje({ texto: r.error, ok: false });
      }
    });
  }

  return (
    <form
      id="form-codigo"
      action={handleSubmit}
      className="space-y-4 rounded-lg border border-base-border bg-base-surface p-6"
    >
      <div>
        <label className="block text-sm font-medium text-navy-900">Código nuevo</label>
        <div className="mt-1">
          <CodigoInput key={resetKey} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900">
          O pegar varios códigos (uno por línea)
        </label>
        <textarea
          name="masivo"
          rows={4}
          placeholder={"IFR0078000-A00000\nIFR0078100-A00000"}
          className="mt-1 w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900">Descripción (opcional)</label>
        <input
          name="descripcion"
          type="text"
          className="mt-1 w-full rounded-md border border-base-border px-3 py-2 text-sm focus-visible:border-accent"
        />
      </div>

      {mensaje && (
        <p
          role="alert"
          className={`text-sm font-medium ${mensaje.ok ? "text-ocupacion-libre" : "text-ocupacion-llena"}`}
        >
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Agregar al maestro"}
      </button>
    </form>
  );
}