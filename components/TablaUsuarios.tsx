"use client";

import { useState, useTransition } from "react";
import { cambiarRol, cambiarActivo } from "@/actions/usuarios";
import type { UsuarioConEmail, RolUsuario } from "@/types/database";

export default function TablaUsuarios({
  usuarios,
  usuarioActualId,
}: {
  usuarios: UsuarioConEmail[];
  usuarioActualId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onCambiarRol(id: string, rol: RolUsuario) {
    setError(null);
    startTransition(async () => {
      const resultado = await cambiarRol(id, rol);
      if (!resultado.ok) setError(resultado.error);
    });
  }

  function onCambiarActivo(id: string, activo: boolean) {
    setError(null);
    startTransition(async () => {
      const resultado = await cambiarActivo(id, activo);
      if (!resultado.ok) setError(resultado.error);
    });
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-3 text-sm text-ocupacion-llena">{error}</p>}
      <div className="overflow-hidden rounded-lg border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-border/30 text-left text-navy-900">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Rol</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esUnoMismo = u.id === usuarioActualId;
              return (
                <tr key={u.id} className="border-t border-base-border bg-base-surface">
                  <td className="px-3 py-2">
                    {u.nombre} {esUnoMismo && <span className="text-navy-700">(vos)</span>}
                  </td>
                  <td className="px-3 py-2 text-navy-700">{u.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.rol}
                      disabled={pending || esUnoMismo}
                      onChange={(e) => onCambiarRol(u.id, e.target.value as RolUsuario)}
                      className="rounded-md border border-base-border px-2 py-1 text-sm disabled:opacity-50"
                    >
                      <option value="operario">Operario</option>
                      <option value="auditor">Auditor</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      disabled={pending || esUnoMismo}
                      onClick={() => onCambiarActivo(u.id, !u.activo)}
                      className={`rounded-md px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                        u.activo
                          ? "bg-ocupacion-libre/20 text-ocupacion-libre"
                          : "bg-ocupacion-llena/20 text-ocupacion-llena"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-navy-700">
        No podés cambiar tu propio rol ni desactivarte a vos mismo (para evitar quedar sin acceso
        de Administrador por error).
      </p>
    </div>
  );
}
