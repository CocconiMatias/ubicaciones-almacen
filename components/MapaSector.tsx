import type { OcupacionPosicion } from "@/types/database";

// Encuentra el color de ocupación según el % — 4 escalones,
// pensado para que se lea de un vistazo, no como decoración.
function colorOcupacion(pct: number): string {
  if (pct === 0) return "bg-base-surface border-base-border";
  if (pct < 50) return "bg-ocupacion-libre/20 border-ocupacion-libre";
  if (pct < 80) return "bg-ocupacion-media/25 border-ocupacion-media";
  if (pct < 100) return "bg-ocupacion-alta/30 border-ocupacion-alta";
  return "bg-ocupacion-llena/30 border-ocupacion-llena";
}

export default function MapaSector({
  sectorNombre,
  posiciones,
}: {
  sectorNombre: string;
  posiciones: OcupacionPosicion[];
}) {
  // Agrupar por calle para dibujar el piso real del sector
  const porCalle = new Map<number, OcupacionPosicion[]>();
  for (const p of posiciones) {
    const lista = porCalle.get(p.calle) ?? [];
    lista.push(p);
    porCalle.set(p.calle, lista);
  }
  const calles = Array.from(porCalle.keys()).sort((a, b) => a - b);

  const totalCajas = posiciones.reduce((acc, p) => acc + p.cajas_ocupadas, 0);
  const totalCapacidad = posiciones.reduce((acc, p) => acc + p.capacidad_cajas, 0);
  const pctSector = totalCapacidad > 0 ? Math.round((totalCajas / totalCapacidad) * 100) : 0;

  return (
    <div className="rounded-lg border border-base-border bg-base-surface p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-900">{sectorNombre}</h3>
        <span className="font-mono text-sm text-navy-700">{pctSector}% ocupado</span>
      </div>

      <div className="space-y-1.5">
        {calles.map((numCalle) => {
          const posCalle = porCalle.get(numCalle)!.sort((a, b) => a.posicion - b.posicion);
          return (
            <div key={numCalle} className="flex items-center gap-2">
              <span className="w-10 shrink-0 font-mono text-xs text-navy-700">
                C{numCalle}
              </span>
              <div className="flex flex-1 flex-wrap gap-1">
                {posCalle.map((p) => (
                  <div
                    key={p.posicion_id}
                    title={`Calle ${p.calle} · Posición ${p.posicion} — ${p.cajas_ocupadas}/${p.capacidad_cajas} cajas (${p.porcentaje_ocupacion}%)`}
                    className={`h-6 w-6 rounded-sm border ${colorOcupacion(p.porcentaje_ocupacion)}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
