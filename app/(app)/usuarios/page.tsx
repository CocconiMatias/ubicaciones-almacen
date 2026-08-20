import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import TablaUsuarios from "@/components/TablaUsuarios";
import FormularioInvitarUsuario from "@/components/FormularioInvitarUsuario";

export default async function UsuariosPage() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <p className="text-navy-700">Sesión expirada.</p>;
  }

  const { data: perfilPropio } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfilPropio?.rol !== "administrador") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-base-border bg-base-surface p-6 text-center">
        <p className="text-navy-700">Esta sección es solo para Administradores.</p>
      </div>
    );
  }

  const admin = crearClienteAdmin();

  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre, rol, activo")
    .order("nombre");

  const { data: listaAuth } = await admin.auth.admin.listUsers();
  const emailPorId = new Map(listaAuth?.users.map((u) => [u.id, u.email ?? ""]));

  const usuarios = (perfiles ?? []).map((p) => ({
    ...p,
    email: emailPorId.get(p.id) ?? "",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Usuarios</h1>
      <p className="mt-1 text-sm text-navy-700">
        Invitar gente nueva, cambiar roles o desactivar acceso. Nunca se borra un usuario —
        desactivarlo le bloquea el ingreso pero conserva su historial de movimientos.
      </p>

      <FormularioInvitarUsuario />
      <TablaUsuarios usuarios={usuarios} usuarioActualId={user.id} />
    </div>
  );
}
