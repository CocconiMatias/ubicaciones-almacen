"use client";

import { useState } from "react";

interface Fila {
  codigo: string;
  descripcion: string | null;
}

export default function TablaCodigos({ codigos }: { codigos: Fila[] }) {
  const [filtro, setFiltro] = useState("");
  const f = filtro.trim().toUpperCase();
  const visibles = f ? codigos.filter((c) => c.codigo.includes(f)) : codigos;

  return (
    <div>
      <input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar códigos..."
        className="w-full rounded-md border border-base-border px-3 py-2 font-mono text-sm uppercase focus-visible:border-accent"
      />
      <p className="mt-2 text-xs text-navy-700">
        {visibles.length} de {codigos.length} códigos
      </p>
      <div className="mt-2 max-h-[420px] overflow-y-auto rounded-lg border border-base-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-base-border/30 text-left text-navy-900">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c.codigo} className="border-t border-base-border bg-base-surface">
                <td className="px-3 py-1.5 font-mono">{c.codigo}</td>
                <td className="px-3 py-1.5 text-navy-700">{c.descripcion ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}