import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ColaboradoresList } from "@/components/colaboradores/colaboradores-list";

export const metadata: Metadata = {
  title: "Colaboradores — Ponto Eletrônico",
};

export default async function ColaboradoresPage() {
  const supabase = await createClient();
  const { data: colaboradores } = await supabase
    .from("colaboradores")
    .select("*")
    .order("nome");

  return <ColaboradoresList colaboradores={colaboradores ?? []} />;
}
