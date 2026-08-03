import { crearClienteServidor } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormularioAjuste from "@/components/FormularioAjuste";

export default async function AjustesPage() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "administrador") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-base-border bg-base-surface p-6 text-center">
        <p className="text-navy-700">
          Esta sección es solo para Administradores.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Ajustes de stock</h1>
      <p className="mt-1 text-sm text-navy-700">
        Usar solo para corregir diferencias puntuales (error de tipeo, recuento físico distinto,
        etc.). El motivo queda registrado junto con tu usuario y la fecha — no reemplaza el
        historial, se suma a él.
      </p>
      <FormularioAjuste />
    </div>
  );
}
