"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

async function resolverCodigoId(supabase: ReturnType<typeof crearClienteServidor>, codigoTexto: string) {
  const codigo = codigoTexto.trim().toUpperCase();
  const { data: existente } = await supabase
    .from("codigos")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();

  if (existente) return existente.id as number;

  const { data: nuevo, error } = await supabase
    .from("codigos")
    .insert({ codigo })
    .select("id")
    .single();

  if (error) throw new Error(`No se pudo crear el código ${codigo}: ${error.message}`);
  return nuevo.id as number;
}

async function resolverCalleId(
  supabase: ReturnType<typeof crearClienteServidor>,
  sectorId: number,
  calleNumero: number
) {
  const { data, error } = await supabase
    .from("calles")
    .select("id")
    .eq("numero", calleNumero)
    .eq("sector_id", sectorId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`No existe la calle Sector ${sectorId} / Calle ${calleNumero}.`);
  }
  return data.id as number;
}

export async function registrarEntrada(formData: FormData): Promise<ResultadoAccion> {
  try {
    const supabase = crearClienteServidor();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sesión expirada." };

    const codigoId = await resolverCodigoId(supabase, String(formData.get("codigo")));
    const calleId = await resolverCalleId(
      supabase,
      Number(formData.get("sector")),
      Number(formData.get("calle"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "entrada",
      codigo_id: codigoId,
      calle_destino_id: calleId,
      cantidad: Number(formData.get("cantidad")),
      usuario_id: user.id,
      observaciones: String(formData.get("observaciones") ?? "") || null,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function registrarSalida(formData: FormData): Promise<ResultadoAccion> {
  try {
    const supabase = crearClienteServidor();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sesión expirada." };

    const codigoId = await resolverCodigoId(supabase, String(formData.get("codigo")));
    const calleId = await resolverCalleId(
      supabase,
      Number(formData.get("sector")),
      Number(formData.get("calle"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "salida",
      codigo_id: codigoId,
      calle_origen_id: calleId,
      cantidad: Number(formData.get("cantidad")),
      usuario_id: user.id,
      observaciones: String(formData.get("observaciones") ?? "") || null,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function registrarTraslado(formData: FormData): Promise<ResultadoAccion> {
  try {
    const supabase = crearClienteServidor();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sesión expirada." };

    const codigoId = await resolverCodigoId(supabase, String(formData.get("codigo")));
    const origenId = await resolverCalleId(
      supabase,
      Number(formData.get("sector_origen")),
      Number(formData.get("calle_origen"))
    );
    const destinoId = await resolverCalleId(
      supabase,
      Number(formData.get("sector_destino")),
      Number(formData.get("calle_destino"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "traslado",
      codigo_id: codigoId,
      calle_origen_id: origenId,
      calle_destino_id: destinoId,
      cantidad: Number(formData.get("cantidad")),
      usuario_id: user.id,
      observaciones: String(formData.get("observaciones") ?? "") || null,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function registrarAjuste(formData: FormData): Promise<ResultadoAccion> {
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
      return { ok: false, error: "Solo un Administrador puede registrar ajustes." };
    }

    const motivo = String(formData.get("motivo_ajuste") ?? "").trim();
    if (!motivo) {
      return { ok: false, error: "El motivo del ajuste es obligatorio." };
    }

    const sentido = String(formData.get("sentido")); // "alta" | "baja"
    const codigoId = await resolverCodigoId(supabase, String(formData.get("codigo")));
    const calleId = await resolverCalleId(
      supabase,
      Number(formData.get("sector")),
      Number(formData.get("calle"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "ajuste",
      codigo_id: codigoId,
      calle_destino_id: sentido === "alta" ? calleId : null,
      calle_origen_id: sentido === "baja" ? calleId : null,
      cantidad: Number(formData.get("cantidad")),
      usuario_id: user.id,
      motivo_ajuste: motivo,
      observaciones: String(formData.get("observaciones") ?? "") || null,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

