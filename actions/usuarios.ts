"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { RolUsuario } from "@/types/database";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

// Todas las acciones verifican de nuevo el rol del que llama, aunque la
// página ya esté protegida — defensa en profundidad, por si en el futuro
// se llama esta action desde otro lado.
async function exigirAdministrador() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "administrador") {
    throw new Error("Solo un Administrador puede gestionar usuarios.");
  }

  return user.id;
}

export async function invitarUsuario(formData: FormData): Promise<ResultadoAccion> {
  try {
    await exigirAdministrador();

    const email = String(formData.get("email")).trim().toLowerCase();
    const nombre = String(formData.get("nombre")).trim();
    const rol = String(formData.get("rol")) as RolUsuario;

    if (!email || !nombre) return { ok: false, error: "Completá nombre y email." };

    const admin = crearClienteAdmin();

    // Crea el usuario en Supabase Auth y le manda un email con un link
    // para que defina su propia contraseña — nadie tiene que inventar
    // ni compartir contraseñas provisorias.
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email);

    if (error) return { ok: false, error: error.message };

    const { error: errorPerfil } = await admin.from("perfiles").insert({
      id: data.user.id,
      nombre,
      rol,
    });

    if (errorPerfil) return { ok: false, error: errorPerfil.message };

    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function cambiarRol(usuarioId: string, rol: RolUsuario): Promise<ResultadoAccion> {
  try {
    const idPropio = await exigirAdministrador();
    if (usuarioId === idPropio) {
      return { ok: false, error: "No podés cambiar tu propio rol." };
    }

    const admin = crearClienteAdmin();
    const { error } = await admin.from("perfiles").update({ rol }).eq("id", usuarioId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function cambiarActivo(usuarioId: string, activo: boolean): Promise<ResultadoAccion> {
  try {
    const idPropio = await exigirAdministrador();
    if (usuarioId === idPropio) {
      return { ok: false, error: "No podés desactivarte a vos mismo." };
    }

    const admin = crearClienteAdmin();
    const { error } = await admin.from("perfiles").update({ activo }).eq("id", usuarioId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}
