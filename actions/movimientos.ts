"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

// Busca (o crea) el código y la posición por sus valores "de negocio"
// (texto de código, sector+calle+número de posición) para que el
// formulario no tenga que manejar IDs internos.
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

async function resolverPosicionId(
  supabase: ReturnType<typeof crearClienteServidor>,
  sectorId: number,
  calleNumero: number,
  posicionNumero: number
) {
  const { data, error } = await supabase
    .from("posiciones")
    .select("id, calles!inner(sector_id, numero)")
    .eq("numero", posicionNumero)
    .eq("calles.numero", calleNumero)
    .eq("calles.sector_id", sectorId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `No existe la posición Sector ${sectorId} / Calle ${calleNumero} / Posición ${posicionNumero}.`
    );
  }
  return data.id as number;
}

export async function registrarEntrada(formData: FormData): Promise<ResultadoAccion> {
  try {
    const supabase = crearClienteServidor();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sesión expirada." };

    const codigoId = await resolverCodigoId(supabase, String(formData.get("codigo")));
    const posicionId = await resolverPosicionId(
      supabase,
      Number(formData.get("sector")),
      Number(formData.get("calle")),
      Number(formData.get("posicion"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "entrada",
      codigo_id: codigoId,
      posicion_destino_id: posicionId,
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
    const posicionId = await resolverPosicionId(
      supabase,
      Number(formData.get("sector")),
      Number(formData.get("calle")),
      Number(formData.get("posicion"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "salida",
      codigo_id: codigoId,
      posicion_origen_id: posicionId,
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
    const origenId = await resolverPosicionId(
      supabase,
      Number(formData.get("sector_origen")),
      Number(formData.get("calle_origen")),
      Number(formData.get("posicion_origen"))
    );
    const destinoId = await resolverPosicionId(
      supabase,
      Number(formData.get("sector_destino")),
      Number(formData.get("calle_destino")),
      Number(formData.get("posicion_destino"))
    );

    const { error } = await supabase.from("movimientos").insert({
      tipo: "traslado",
      codigo_id: codigoId,
      posicion_origen_id: origenId,
      posicion_destino_id: destinoId,
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
