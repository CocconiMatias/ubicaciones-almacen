"use client";

import { useState, useTransition } from "react";
import { registrarEntrada, registrarSalida, registrarTraslado } from "@/actions/movimientos";

type Tipo = "entrada" | "salida" | "traslado";

const TABS: { id: Tipo; label: string }[] = [
  { id: "entrada", label: "Entrada" },
  { id: "salida", label: "Salida" },
  { id: "traslado", label: "Traslado" },
];

export default function RegistroPage() {
  const [tipo, setTipo] = useState<Tipo>("entrada");
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  function handleSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const accion = tipo === "entrada" ? registrarEntrada : tipo === "salida" ? registrarSalida : registrarTraslado;
      const resultado = await accion(formData);
      if (resultado.ok) {
        setMensaje({ texto: "Movimiento registrado correctamente.", ok: true });
        (document.getElementById("form-movimiento") as HTMLFormElement)?.reset();
      } else {
        setMensaje({ texto: resultado.error, ok: false });
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Registrar movimiento</h1>

      <div className="mt-4 flex gap-1 rounded-md bg-base-border/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTipo(tab.id);
              setMensaje(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              tipo === tab.id ? "bg-base-surface text-navy-900 shadow-sm" : "text-navy-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        id="form-movimiento"
        action={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border border-base-border bg-base-surface p-6"
      >
        <Campo label="Código">
          <input
            name="codigo"
            required
            placeholder="IFR0075000-A00000"
            className="w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
          />
        </Campo>

        {tipo === "traslado" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <UbicacionFields prefijo="origen" titulo="Ubicación de origen" />
            <UbicacionFields prefijo="destino" titulo="Ubicación de destino" />
          </div>
        ) : (
          <UbicacionFields prefijo="" titulo={tipo === "entrada" ? "Ubicación destino" : "Ubicación origen"} />
        )}

        <Campo label="Cantidad (cajas)">
          <input
            name="cantidad"
            type="number"
            min={1}
            required
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
          {pending ? "Guardando..." : "Guardar movimiento"}
        </button>
      </form>
    </div>
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

// prefijo "" => sector/calle/posicion ; prefijo "origen" => sector_origen/calle_origen/posicion_origen
function UbicacionFields({ prefijo, titulo }: { prefijo: string; titulo: string }) {
  const nombre = (base: string) => (prefijo ? `${base}_${prefijo}` : base);
  return (
    <fieldset className="space-y-2 rounded-md border border-base-border p-3">
      <legend className="px-1 text-sm font-medium text-navy-900">{titulo}</legend>
      <div className="grid grid-cols-3 gap-2">
        <input
          name={nombre("sector")}
          type="number"
          required
          placeholder="Sector"
          className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent"
        />
        <input
          name={nombre("calle")}
          type="number"
          required
          placeholder="Calle"
          className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent"
        />
        <input
          name={nombre("posicion")}
          type="number"
          required
          placeholder="Posición"
          className="rounded-md border border-base-border px-2 py-2 text-sm focus-visible:border-accent"
        />
      </div>
    </fieldset>
  );
}
