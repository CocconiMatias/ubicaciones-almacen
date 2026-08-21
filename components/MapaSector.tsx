import type { OcupacionCalle } from "@/types/database";

function colorOcupacion(pct: number): string {
  if (pct === 0) return "bg-base-surface border-base-border";
  if (pct < 50) return "bg-ocupacion-libre/20 border-ocupacion-libre";
  if (pct < 80) return "bg-ocupacion-media/25 border-ocupacion-media";
  if (pct < 100) return "bg-ocupacion-alta/30 border-ocupacion-alta";
  return "bg-ocupacion-llena/30 border-ocupacion-llena";
}

export default function MapaSector({
  sectorNombre,
  calles,
}: {
  sectorNombre: string;
  calles: OcupacionCalle[];
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
            <span className="w-10 shrink-0 font-mono text-xs text-navy-700">C{c.calle}</span>
            <div
              title={`Calle ${c.calle} — ${c.cajas_ocupadas}/${c.capacidad_cajas} cajas (${c.porcentaje_ocupacion}%)`}
              className={`h-6 flex-1 rounded-sm border ${colorOcupacion(c.porcentaje_ocupacion)}`}
            />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-navy-700">
              {c.porcentaje_ocupacion}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
