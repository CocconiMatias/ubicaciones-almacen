import { crearClienteServidor } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  let nombre = "";
  let rol = "";
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre, rol")
      .eq("id", user.id)
      .single();
    nombre = perfil?.nombre ?? "";
    rol = perfil?.rol ?? "";
  }

  return (
    <div className="min-h-screen">
      <NavBar nombre={nombre} rol={rol} />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:pb-6">{children}</main>
    </div>
  );
}
