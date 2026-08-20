"use client";

import { useState, useTransition } from "react";
import { cambiarRol, cambiarActivo, cambiarPassword } from "@/actions/usuarios";
import type { UsuarioConEmail, RolUsuario } from "@/types/database";

function generarPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let resultado = "";
  for (let i = 0; i < 10; i++) {
    resultado += chars[Math.floor(Math.random() * chars.length)];
  }
  return resultado;
}

export default function TablaUsuarios({
  usuarios,
  usuarioActualId,
}: {
  usuarios: UsuarioConEmail[];
  usuarioActualId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [passwordNueva, setPasswordNueva] = useState<{ id: string; password: string } | null>(null);

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

  function onResetearPassword(id: string) {
    setError(null);
    setPasswordNueva(null);
    const nueva = generarPassword();
    startTransition(async () => {
      const resultado = await cambiarPassword(id, nueva);
      if (!resultado.ok) {
        setError(resultado.error);
      } else {
        setPasswordNueva({ id, password: nueva });
      }
    });
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-3 text-sm text-ocupacion-llena">{error}</p>}
      {passwordNueva && (
        <p className="mb-3 rounded-md border border-ocupacion-libre bg-ocupacion-libre/10 p-3 text-sm">
          Nueva contraseña para{" "}
          {usuarios.find((u) => u.id === passwordNueva.id)?.nombre}:{" "}
          <span className="font-mono font-semibold">{passwordNueva.password}</span> — pasásela vos.
        </p>
      )}
      <div className="overflow-hidden rounded-lg border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-border/30 text-left text-navy-900">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Rol</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Contraseña</th>
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
                  <td className="px-3 py-2">
                    <button
                      disabled={pending}
                      onClick={() => onResetearPassword(u.id)}
                      className="rounded-md border border-navy-900 px-2 py-1 text-xs font-semibold text-navy-900 hover:bg-navy-900/5 disabled:opacity-50"
                    >
                      Resetear
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
