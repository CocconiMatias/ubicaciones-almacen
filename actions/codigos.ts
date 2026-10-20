"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

const FORMATO_CODIGO = /^IFR00\d{5}-[A-Z]00000(-[A-Z0-9]{1,4})?$/;

// Alta de uno o varios códigos nuevos en el maestro. Solo Administrador.
export async function agregarCodigos(formData: FormData): Promise<Resultado> {
  try {
    const supabase = crearClienteServidor();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sesión expirada." };

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    if (perfil?.rol !== "administrador") {
      return { ok: false, error: "Solo un Administrador puede dar de alta códigos." };
    }

    const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
    const unico = String(formData.get("codigo") ?? "");
    const masivo = String(formData.get("masivo") ?? "");

    const codigos = Array.from(
      new Set(
        `${unico}\n${masivo}`
          .split(/[\n,;\t ]+/)
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    if (codigos.length === 0) return { ok: false, error: "Ingresá al menos un código." };

    const invalidos = codigos.filter((c) => !FORMATO_CODIGO.test(c));
    if (invalidos.length > 0) {
      return {
        ok: false,
        error: `No se cargó nada. Formato inválido (IFR00xxxxx-X00000): ${invalidos.join(", ")}`,
      };
    }

    const { data: existentes } = await supabase.from("codigos").select("codigo").in("codigo", codigos);
    const yaEstan = new Set((existentes ?? []).map((r) => r.codigo as string));
    const nuevos = codigos.filter((c) => !yaEstan.has(c));

    if (nuevos.length === 0) {
      return { ok: false, error: "Todos esos códigos ya existen en el maestro." };
    }

    const { error } = await supabase
      .from("codigos")
      .insert(nuevos.map((codigo) => ({ codigo, descripcion })));
    if (error) return { ok: false, error: error.message };

    revalidatePath("/codigos");
    const omitidos = yaEstan.size > 0 ? ` (${yaEstan.size} ya existían)` : "";
    return { ok: true, mensaje: `Se agregaron ${nuevos.length} código(s)${omitidos}.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}