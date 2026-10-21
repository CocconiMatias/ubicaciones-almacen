import type { OcupacionCalle, StockPorCodigo } from "@/types/database";

function colorOcupacion(pct: number): string {
  if (pct === 0) return "bg-base-surface border-base-border";
  if (pct < 50) return "bg-ocupacion-libre/20 border-ocupacion-libre";
  if (pct < 80) return "bg-ocupacion-media/25 border-ocupacion-media";
  if (pct < 100) return "bg-ocupacion-alta/30 border-ocupacion-alta";
  return "bg-ocupacion-llena/30 border-ocupacion-llena";
}

// En los racks la "calle" es la posición: se muestra como R1/4 en lugar de C4.
function etiquetaCalle(sectorNombre: string, calle: number): string {
  const m = sectorNombre.match(/^Rack (R\d+)$/i);
  return m ? `${m[1].toUpperCase()}/${calle}` : `C${calle}`;
}

export default function MapaSector({
  sectorNombre,
  calles,
  stock,
}: {
  sectorNombre: string;
  calles: OcupacionCalle[];
  stock: StockPorCodigo[];
}) {
  const ordenadas = [...calles].sort((a, b) => a.calle - b.calle);

  const totalCajas = calles.reduce((acc, c) => acc + c.cajas_ocupadas, 0);
  const totalCapacidad = calles.reduce((acc, c) => acc + c.capacidad_cajas, 0);
  const pctSector = totalCapacidad > 0 ? Math.round((totalCajas / totalCapacidad) * 100) : 0;

  return (
    <div className="rounded-lg border border-base-border bg-base-surface p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-900">{sectorNombre}</h3>
        <span className="font-mono text-sm text-navy-700">{pctSector}% ocupado</span>
      </div>

      <div className="space-y-1.5">
        {ordenadas.map((c) => (
          <div key={c.calle_id} className="flex items-center gap-2">
            <span className="w-12 shrink-0 font-mono text-xs text-navy-700">{etiquetaCalle(sectorNombre, c.calle)}</span>
            <div className="group relative flex-1" tabIndex={0}>
              <div className={`h-6 rounded-sm border ${colorOcupacion(c.porcentaje_ocupacion)}`} />
              <TooltipCalle etiqueta={etiquetaCalle(sectorNombre, c.calle)} calle={c} stock={stock.filter((s) => s.calle === c.calle)} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-xs text-navy-700">
              {c.porcentaje_ocupacion}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MAX_CODIGOS = 12;

function TooltipCalle({
  etiqueta,
  calle,
  stock,
}: {
  etiqueta: string;
  calle: OcupacionCalle;
  stock: StockPorCodigo[];
}) {
  const ordenado = [...stock].sort((a, b) => b.cantidad - a.cantidad);
  const visibles = ordenado.slice(0, MAX_CODIGOS);
  const resto = ordenado.length - visibles.length;

  return (
    <div className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-64 rounded-md border border-base-border bg-white p-3 shadow-lg group-hover:block group-focus:block">
      <p className="font-mono text-xs font-semibold text-navy-900">
        {etiqueta} — {calle.cajas_ocupadas}/{calle.capacidad_cajas} cajas (
        {calle.porcentaje_ocupacion}%)
      </p>
      {ordenado.length === 0 ? (
        <p className="mt-2 text-xs text-navy-700">Sin cajas cargadas.</p>
      ) : (
        <ul className="mt-2 space-y-0.5">
          {visibles.map((s) => (
            <li key={s.codigo} className="flex justify-between gap-3 font-mono text-xs text-navy-900">
              <span>{s.codigo}</span>
              <span className="font-semibold">{s.cantidad}</span>
            </li>
          ))}
          {resto > 0 && (
            <li className="pt-1 text-xs text-navy-700">+ {resto} código(s) más</li>
          )}
        </ul>
      )}
    </div>
  );
}