import { crearClienteServidor } from "@/lib/supabase/server";
import MapaSector from "@/components/MapaSector";
import type { OcupacionCalle } from "@/types/database";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = crearClienteServidor();

  const { data, error } = await supabase
    .from("v_ocupacion_calles")
    .select("*")
    .order("sector_id")
    .order("calle");

  if (error) {
    return (
      <p className="text-ocupacion-llena">
        No se pudo cargar el mapa de ocupación: {error.message}
      </p>
    );
  }

  const filas = (data ?? []) as OcupacionCalle[];
  const sectores = Array.from(new Map(filas.map((f) => [f.sector_id, f.sector])).entries()).sort(
    (a, b) => a[0] - b[0]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Mapa de ocupación
        </h1>
        <Leyenda />
      </div>

      {filas.length === 0 ? (
        <p className="text-navy-700">Todavía no hay calles cargadas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectores.map(([id, nombre]) => (
            <MapaSector
              key={id}
              sectorNombre={nombre}
              calles={filas.filter((f) => f.sector_id === id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Leyenda() {
  const items: { label: string; clase: string }[] = [
    { label: "Libre", clase: "bg-ocupacion-libre/20 border-ocupacion-libre" },
    { label: "Media", clase: "bg-ocupacion-media/25 border-ocupacion-media" },
    { label: "Alta", clase: "bg-ocupacion-alta/30 border-ocupacion-alta" },
    { label: "Llena", clase: "bg-ocupacion-llena/30 border-ocupacion-llena" },
  ];
  return (
    <div className="hidden items-center gap-3 sm:flex">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm border ${it.clase}`} />
          <span className="text-xs text-navy-700">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
