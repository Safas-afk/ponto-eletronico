import { OBSERVACOES_SEM_EXPEDIENTE } from "./constants";
import type { Tables } from "@/lib/supabase/types";

export type RegistroPontos = Pick<
  Tables<"registros">,
  "entrada" | "saida_almoco" | "retorno_almoco" | "saida_final" | "observacao"
>;

export type StatusPonto = "sem_registro" | "incompleto" | "completo";

export function getStatusPonto(registro: RegistroPontos | undefined): StatusPonto {
  if (!registro) return "sem_registro";
  return isPunchIncomplete(registro) ? "incompleto" : "completo";
}

export function isPunchIncomplete(registro: RegistroPontos | undefined): boolean {
  if (registro?.observacao && OBSERVACOES_SEM_EXPEDIENTE.includes(registro.observacao)) {
    return false;
  }

  if (!registro?.entrada || !registro?.saida_final) {
    return true;
  }

  const almocosPreenchidos = [registro.saida_almoco, registro.retorno_almoco].filter(
    Boolean,
  ).length;
  return almocosPreenchidos === 1;
}

export function estaAdmitidoEm(
  colaborador: { data_admissao: string | null },
  dataIso: string,
): boolean {
  return !colaborador.data_admissao || colaborador.data_admissao <= dataIso;
}

export function getResumoDia(
  colaboradoresAtivos: { id: string; data_admissao: string | null }[],
  registrosDoDia: Map<string, RegistroPontos>,
  dataIso: string,
): { completos: number; pendentes: number; total: number } {
  const admitidos = colaboradoresAtivos.filter((c) => estaAdmitidoEm(c, dataIso));
  const pendentes = admitidos.filter((c) => isPunchIncomplete(registrosDoDia.get(c.id))).length;

  return {
    completos: admitidos.length - pendentes,
    pendentes,
    total: admitidos.length,
  };
}
