import { createClient } from "@/lib/supabase/server";
import { getDefaultAnoMes } from "./dates";

export type Periodo = { ano: number; mes: number };

// Só períodos que já têm registro no banco (nunca uma lista fixa de
// anos) — regra confirmada em docs/PROJECT-BRIEF.md. Garante o mês
// atual na lista mesmo com o banco vazio, pra não travar o primeiro uso.
export async function getPeriodosDisponiveis(): Promise<Periodo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros")
    .select("data")
    .order("data", { ascending: false });

  const vistos = new Set<string>();
  const periodos: Periodo[] = [];
  for (const row of data ?? []) {
    const chave = row.data.slice(0, 7);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    const [ano, mes] = chave.split("-").map(Number);
    periodos.push({ ano, mes });
  }

  const atual = getDefaultAnoMes();
  const chaveAtual = `${atual.ano}-${String(atual.mes).padStart(2, "0")}`;
  if (!vistos.has(chaveAtual)) {
    periodos.unshift(atual);
  }

  return periodos;
}
