import { crearClienteServidor } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormularioCodigo from "@/components/FormularioCodigo";
import TablaCodigos from "@/components/TablaCodigos";

export default async function CodigosPage() {
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
        <p className="text-navy-700">Esta sección es solo para Administradores.</p>
      </div>
    );
  }

  const { data } = await supabase
    .from("codigos")
    .select("codigo, descripcion")
    .order("codigo")
    .limit(5000);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Maestro de códigos</h1>
        <p className="mt-1 text-sm text-navy-700">
          Solo los códigos de esta lista se pueden usar al registrar movimientos. Cuando ingrese un
          producto nuevo, agregalo acá antes de cargarlo.
        </p>
      </div>
      <FormularioCodigo />
      <TablaCodigos codigos={data ?? []} />
    </div>
  );
}