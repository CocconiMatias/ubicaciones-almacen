"use client";

import { useState, useTransition } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import type { StockPorCodigo } from "@/types/database";

export default function BuscadorPage() {
  const supabase = crearClienteNavegador();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<StockPorCodigo[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { data, error } = await supabase
        .from("v_stock_por_codigo")
        .select("*")
        .ilike("codigo", `%${query.trim()}%`)
        .order("sector")
        .order("calle");

      if (error) {
        setError(error.message);
        return;
      }
      setResultados(data as StockPorCodigo[]);
    });
  }

  const total = resultados?.reduce((acc, r) => acc + r.cantidad, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Buscar código</h1>

      <form onSubmit={buscar} className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código o parte del código..."
          className="flex-1 rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-ocupacion-llena">{error}</p>}

      {resultados !== null && (
        <div className="mt-6">
          {resultados.length === 0 ? (
            <p className="text-navy-700">No se encontraron ubicaciones para ese código.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-navy-700">
                Total encontrado: <span className="font-mono font-semibold">{total}</span> cajas en{" "}
                {resultados.length} ubicación(es)
              </p>
              <div className="overflow-hidden rounded-lg border border-base-border">
                <table className="w-full text-sm">
                  <thead className="bg-base-border/30 text-left text-navy-900">
                    <tr>
                      <th className="px-3 py-2 font-medium">Código</th>
                      <th className="px-3 py-2 font-medium">Descripción</th>
                      <th className="px-3 py-2 font-medium">Sector</th>
                      <th className="px-3 py-2 font-medium">Calle</th>
                      <th className="px-3 py-2 font-medium">Posición</th>
                      <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r, i) => (
                      <tr key={i} className="border-t border-base-border bg-base-surface">
                        <td className="px-3 py-2 font-mono">{r.codigo}</td>
                        <td className="px-3 py-2 text-navy-700">{r.descripcion}</td>
                        <td className="px-3 py-2">{r.sector}</td>
                        <td className="px-3 py-2 font-mono">{r.calle}</td>
                        <td className="px-3 py-2 font-mono">{r.posicion}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{r.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
