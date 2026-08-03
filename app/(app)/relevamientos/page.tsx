"use client";

import { useState, useTransition } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import type { StockPorCodigo } from "@/types/database";

interface FilaRelevamiento {
  codigo: string;
  descripcion: string;
  sector: string;
  calle: string;
  posicion: string;
  cantidad_sistema: number | "";
  cantidad_fisica: string;
  observaciones: string;
}

export default function RelevamientosPage() {
  const supabase = crearClienteNavegador();
  const [textoCodigos, setTextoCodigos] = useState("");
  const [filas, setFilas] = useState<FilaRelevamiento[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function buscar() {
    setError(null);
    const codigos = Array.from(
      new Set(
        textoCodigos
          .split(/[\n,;\t]+/)
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    if (codigos.length === 0) {
      setError("Pegá al menos un código.");
      return;
    }

    startTransition(async () => {
      const { data, error } = await supabase
        .from("v_stock_por_codigo")
        .select("*")
        .in("codigo", codigos);

      if (error) {
        setError(error.message);
        return;
      }

      const encontrados = (data ?? []) as StockPorCodigo[];
      const nuevasFilas: FilaRelevamiento[] = encontrados.map((r) => ({
        codigo: r.codigo,
        descripcion: r.descripcion ?? "",
        sector: r.sector,
        calle: String(r.calle),
        posicion: String(r.posicion),
        cantidad_sistema: r.cantidad,
        cantidad_fisica: "",
        observaciones: "",
      }));

      // Códigos pegados que no aparecen en ninguna ubicación
      const codigosEncontrados = new Set(encontrados.map((r) => r.codigo));
      for (const c of codigos) {
        if (!codigosEncontrados.has(c)) {
          nuevasFilas.push({
            codigo: c,
            descripcion: "",
            sector: "—",
            calle: "—",
            posicion: "—",
            cantidad_sistema: 0,
            cantidad_fisica: "",
            observaciones: "Sin ubicación registrada en el sistema",
          });
        }
      }

      nuevasFilas.sort((a, b) => a.codigo.localeCompare(b.codigo));
      setFilas(nuevasFilas);
    });
  }

  function actualizarFila(idx: number, campo: "cantidad_fisica" | "observaciones", valor: string) {
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f)));
  }

  async function exportarExcel() {
    const XLSX = await import("xlsx");
    const datos = filas.map((f) => ({
      Código: f.codigo,
      Descripción: f.descripcion,
      Sector: f.sector,
      Calle: f.calle,
      Posición: f.posicion,
      "Cantidad sistema": f.cantidad_sistema,
      "Cantidad física": f.cantidad_fisica,
      Diferencia:
        f.cantidad_fisica !== "" && f.cantidad_sistema !== ""
          ? Number(f.cantidad_fisica) - Number(f.cantidad_sistema)
          : "",
      Observaciones: f.observaciones,
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Relevamiento");
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `relevamiento_${fecha}.xlsx`);
  }

  function exportarPDF() {
    window.print();
  }

  return (
    <div>
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-semibold text-navy-900">Relevamientos</h1>
        <p className="mt-1 text-sm text-navy-700">
          Pegá los códigos a relevar (uno por línea), buscá sus ubicaciones registradas y completá
          el conteo físico. Después exportá a Excel o PDF para la auditoría.
        </p>

        <textarea
          value={textoCodigos}
          onChange={(e) => setTextoCodigos(e.target.value)}
          rows={5}
          placeholder={"IFR0075000-A00000\nIFR0076000-A00000\n..."}
          className="mt-4 w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={buscar}
            disabled={pending}
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
          >
            {pending ? "Buscando..." : "Buscar ubicaciones"}
          </button>
          {filas.length > 0 && (
            <>
              <button
                onClick={exportarExcel}
                className="rounded-md border border-navy-900 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
              >
                Exportar a Excel
              </button>
              <button
                onClick={exportarPDF}
                className="rounded-md border border-navy-900 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
              >
                Exportar a PDF
              </button>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-ocupacion-llena">{error}</p>}
      </div>

      {filas.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-base-border print:mt-0 print:overflow-visible print:border-none">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-base-border/30 text-left text-navy-900">
              <tr>
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Descripción</th>
                <th className="px-3 py-2 font-medium">Ubicación</th>
                <th className="px-3 py-2 text-right font-medium">Sistema</th>
                <th className="px-3 py-2 text-right font-medium">Física</th>
                <th className="px-3 py-2 font-medium">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-t border-base-border bg-base-surface">
                  <td className="px-3 py-2 font-mono">{f.codigo}</td>
                  <td className="px-3 py-2 text-navy-700">{f.descripcion}</td>
                  <td className="px-3 py-2 font-mono">
                    {f.sector !== "—" ? `${f.sector} · C${f.calle} · P${f.posicion}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{f.cantidad_sistema}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      value={f.cantidad_fisica}
                      onChange={(e) => actualizarFila(i, "cantidad_fisica", e.target.value)}
                      className="w-20 rounded-md border border-base-border px-2 py-1 text-right font-mono text-sm print:border-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={f.observaciones}
                      onChange={(e) => actualizarFila(i, "observaciones", e.target.value)}
                      className="w-full rounded-md border border-base-border px-2 py-1 text-sm print:border-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
