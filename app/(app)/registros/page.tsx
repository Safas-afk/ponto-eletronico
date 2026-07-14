import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PeriodoPicker } from "@/components/registros/periodo-picker";
import { NovoRegistroDialog } from "@/components/registros/novo-registro-dialog";
import { CalendarioMes, type ResumoDiaCalendario } from "@/components/registros/calendario-mes";
import { getDefaultAnoMes, primeiroDiaIso, ultimoDiaIso } from "@/lib/registros/dates";
import { getResumoDia } from "@/lib/registros/alerts";
import { getPeriodosDisponiveis } from "@/lib/registros/periodos";
import type { Tables } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Registros — Ponto Eletrônico",
};

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const defaults = getDefaultAnoMes();
  const ano = sp.ano ? Number(sp.ano) : defaults.ano;
  const mes = sp.mes ? Number(sp.mes) : defaults.mes;

  const supabase = await createClient();
  const [{ data: colaboradores }, { data: registros }, periodos] = await Promise.all([
    supabase.from("colaboradores").select("*").eq("ativo", true).order("nome"),
    supabase
      .from("registros")
      .select("*")
      .gte("data", primeiroDiaIso(ano, mes))
      .lte("data", ultimoDiaIso(ano, mes)),
    getPeriodosDisponiveis(),
  ]);

  const colaboradoresAtivos = colaboradores ?? [];

  const registrosPorDia = new Map<string, Map<string, Tables<"registros">>>();
  for (const r of registros ?? []) {
    if (!registrosPorDia.has(r.data)) registrosPorDia.set(r.data, new Map());
    registrosPorDia.get(r.data)!.set(r.colaborador_id, r);
  }

  const resumosPorDia = new Map<string, ResumoDiaCalendario>();
  for (const [dia, registrosDoDia] of registrosPorDia) {
    resumosPorDia.set(dia, {
      ...getResumoDia(colaboradoresAtivos, registrosDoDia),
      temRegistro: registrosDoDia.size > 0,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registros</h1>
        <div className="flex items-center gap-2">
          <NovoRegistroDialog
            colaboradores={colaboradoresAtivos.map((c) => ({ id: c.id, nome: c.nome }))}
          />
          <PeriodoPicker ano={ano} mes={mes} periodos={periodos} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/backup?ano=${ano}&mes=${mes}`} />}
          >
            Exportar
          </Button>
        </div>
      </div>
      <CalendarioMes ano={ano} mes={mes} resumosPorDia={resumosPorDia} />
    </div>
  );
}
