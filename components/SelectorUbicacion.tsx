"use client";

import { useEffect, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

interface SectorOpcion {
  id: number;
  nombre: string;
  calles: number[];
}

// El catálogo (sectores y calles) se baja una sola vez y se comparte entre
// todos los selectores de la pantalla.
let catalogoPromesa: Promise<SectorOpcion[]> | null = null;

function cargarCatalogo(): Promise<SectorOpcion[]> {
  if (!catalogoPromesa) {
    const supabase = crearClienteNavegador();
    catalogoPromesa = (async () => {
      const [{ data: sectores, error: e1 }, { data: calles, error: e2 }] = await Promise.all([
        supabase.from("sectores").select("id, nombre").eq("activo", true).order("id"),
        supabase.from("calles").select("sector_id, numero").order("numero").limit(5000),
      ]);
      if (e1 || e2) throw new Error((e1 ?? e2)!.message);
      return (sectores ?? []).map((s) => ({
        id: s.id as number,
        nombre: s.nombre as string,
        calles: (calles ?? []).filter((c) => c.sector_id === s.id).map((c) => c.numero as number),
      }));
    })().catch((err) => {
      catalogoPromesa = null; // permite reintentar si falló
      throw err;
    });
  }
  return catalogoPromesa;
}

const esRack = (nombre: string) => /^Rack R\d+$/i.test(nombre);

function etiquetaSector(s: SectorOpcion) {
  return esRack(s.nombre) ? s.nombre : `Sector ${s.id}`;
}

function etiquetaCalle(s: SectorOpcion, calle: number) {
  const m = s.nombre.match(/^Rack (R\d+)$/i);
  return m ? `${m[1].toUpperCase()}/${calle}` : `Calle ${calle}`;
}

// prefijo "" => campos "sector" y "calle"; prefijo "origen" => "sector_origen" y "calle_origen"
export default function SelectorUbicacion({
  prefijo,
  titulo,
}: {
  prefijo: string;
  titulo: string;
}) {
  const nombre = (base: string) => (prefijo ? `${base}_${prefijo}` : base);
  const [catalogo, setCatalogo] = useState<SectorOpcion[] | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState("");
  const [calle, setCalle] = useState("");

  useEffect(() => {
    cargarCatalogo()
      .then(setCatalogo)
      .catch((e) => setErrorCarga(e instanceof Error ? e.message : "No se pudo cargar."));
  }, []);

  const sector = catalogo?.find((s) => String(s.id) === sectorId);
  const claseSelect =
    "w-full rounded-md border border-base-border bg-white px-2 py-2 text-sm focus-visible:border-accent disabled:opacity-50";

  return (
    <fieldset className="space-y-2 rounded-md border border-base-border p-3">
      <legend className="px-1 text-sm font-medium text-navy-900">{titulo}</legend>
      {errorCarga && (
        <p className="text-xs text-ocupacion-llena">
          No se pudieron cargar las ubicaciones: {errorCarga}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <select
          name={nombre("sector")}
          required
          value={sectorId}
          disabled={!catalogo}
          onChange={(e) => {
            setSectorId(e.target.value);
            setCalle("");
          }}
          className={claseSelect}
        >
          <option value="">{catalogo ? "Sector / Rack" : "Cargando..."}</option>
          {catalogo?.map((s) => (
            <option key={s.id} value={s.id}>
              {etiquetaSector(s)}
            </option>
          ))}
        </select>
        <select
          name={nombre("calle")}
          required
          value={calle}
          disabled={!sector}
          onChange={(e) => setCalle(e.target.value)}
          className={claseSelect}
        >
          <option value="">{sector ? (esRack(sector.nombre) ? "Posición" : "Calle") : "Calle"}</option>
          {sector?.calles.map((n) => (
            <option key={n} value={n}>
              {etiquetaCalle(sector, n)}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}