import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ColaboradoresList } from "@/components/colaboradores/colaboradores-list";
import { getDefaultAnoMes } from "@/lib/registros/dates";
import { getPeriodosDisponiveis } from "@/lib/registros/periodos";

export const metadata: Metadata = {
  title: "Colaboradores — Ponto Eletrônico",
};

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const defaults = getDefaultAnoMes();
  const ano = sp.ano ? Number(sp.ano) : defaults.ano;
  const mes = sp.mes ? Number(sp.mes) : defaults.mes;

  const supabase = await createClient();
  const [{ data: colaboradores }, periodos] = await Promise.all([
    supabase.from("colaboradores").select("*").order("nome"),
    getPeriodosDisponiveis(),
  ]);

  return (
    <ColaboradoresList
      colaboradores={colaboradores ?? []}
      ano={ano}
      mes={mes}
      periodos={periodos}
    />
  );
}
