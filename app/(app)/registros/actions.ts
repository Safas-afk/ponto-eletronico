"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { OBSERVACAO_OPCOES, type Observacao } from "@/lib/registros/constants";
import type { TablesInsert } from "@/lib/supabase/types";

const CAMPOS_PONTO = ["entrada", "saida_almoco", "retorno_almoco", "saida_final"] as const;
export type CampoPonto = (typeof CAMPOS_PONTO)[number];

export async function punchAction(
  colaboradorId: string,
  data: string,
  campo: CampoPonto,
  horario: string,
): Promise<{ error: string | null }> {
  if (!CAMPOS_PONTO.includes(campo)) {
    return { error: "Campo inválido." };
  }
  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return { error: "Horário inválido." };
  }

  const payload: TablesInsert<"registros"> = { colaborador_id: colaboradorId, data };
  payload[campo] = horario;

  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .upsert(payload, { onConflict: "colaborador_id,data" });

  if (error) {
    return { error: "Erro ao salvar horário." };
  }

  revalidatePath("/registros");
  return { error: null };
}

export async function setObservacaoAction(
  colaboradorId: string,
  data: string,
  observacao: string | null,
  detalhesAtividade: string | null,
): Promise<{ error: string | null }> {
  if (observacao !== null && !OBSERVACAO_OPCOES.includes(observacao as Observacao)) {
    return { error: "Observação inválida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("registros").upsert(
    {
      colaborador_id: colaboradorId,
      data,
      observacao,
      detalhes_atividade: observacao === "Em Campo" ? detalhesAtividade : null,
    },
    { onConflict: "colaborador_id,data" },
  );

  if (error) {
    return { error: "Erro ao salvar observação." };
  }

  revalidatePath("/registros");
  return { error: null };
}

export async function punchManyAction(
  colaboradorIds: string[],
  data: string,
  campo: CampoPonto,
  horario: string,
): Promise<{ error: string | null }> {
  if (colaboradorIds.length === 0) {
    return { error: null };
  }
  if (!CAMPOS_PONTO.includes(campo)) {
    return { error: "Campo inválido." };
  }
  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return { error: "Horário inválido." };
  }

  const linhas: TablesInsert<"registros">[] = colaboradorIds.map((colaboradorId) => {
    const linha: TablesInsert<"registros"> = { colaborador_id: colaboradorId, data };
    linha[campo] = horario;
    return linha;
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .upsert(linhas, { onConflict: "colaborador_id,data" });

  if (error) {
    return { error: "Erro ao salvar horário em lote." };
  }

  revalidatePath("/registros");
  return { error: null };
}

export async function setObservacaoManyAction(
  colaboradorIds: string[],
  data: string,
  observacao: string | null,
  detalhesAtividade: string | null,
): Promise<{ error: string | null }> {
  if (colaboradorIds.length === 0) {
    return { error: null };
  }
  if (observacao !== null && !OBSERVACAO_OPCOES.includes(observacao as Observacao)) {
    return { error: "Observação inválida." };
  }

  const linhas: TablesInsert<"registros">[] = colaboradorIds.map((colaboradorId) => ({
    colaborador_id: colaboradorId,
    data,
    observacao,
    detalhes_atividade: observacao === "Em Campo" ? detalhesAtividade : null,
  }));

  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .upsert(linhas, { onConflict: "colaborador_id,data" });

  if (error) {
    return { error: "Erro ao salvar observação em lote." };
  }

  revalidatePath("/registros");
  return { error: null };
}
