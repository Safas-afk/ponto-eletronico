import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase/types";

function getHojeBrasil(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function isFimDeSemana(iso: string): boolean {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const diaSemana = new Date(ano, mes - 1, dia).getDay();
  return diaSemana === 0 || diaSemana === 6;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const hoje = getHojeBrasil();
  const observacao = isFimDeSemana(hoje) ? "Fim de Semana" : null;

  const supabase = createAdminClient();
  const { data: colaboradoresAtivos, error: erroColaboradores } = await supabase
    .from("colaboradores")
    .select("id")
    .eq("ativo", true);

  if (erroColaboradores) {
    return NextResponse.json({ error: "Erro ao buscar colaboradores" }, { status: 500 });
  }

  const linhas: TablesInsert<"registros">[] = (colaboradoresAtivos ?? []).map((c) => ({
    colaborador_id: c.id,
    data: hoje,
    observacao,
  }));

  if (linhas.length === 0) {
    return NextResponse.json({ hoje, criadas: 0 });
  }

  // insere só quem ainda não tem linha do dia — nunca sobrescreve um
  // registro que o colaborador já tenha batido antes das 7h
  const { error: erroInsert } = await supabase
    .from("registros")
    .upsert(linhas, { onConflict: "colaborador_id,data", ignoreDuplicates: true });

  if (erroInsert) {
    return NextResponse.json({ error: "Erro ao criar registros do dia" }, { status: 500 });
  }

  return NextResponse.json({ hoje, observacao, colaboradores: linhas.length });
}
