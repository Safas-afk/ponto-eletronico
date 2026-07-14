export const OBSERVACAO_OPCOES = [
  "Feriado",
  "Fim de Semana",
  "Liberado",
  "Férias",
  "Dayoff Aniversário",
  "Em Campo",
] as const;

export type Observacao = (typeof OBSERVACAO_OPCOES)[number];

// Dias com uma dessas observações não têm expediente esperado — não
// entram no cálculo de "ponto incompleto" mesmo sem nenhum horário.
export const OBSERVACOES_SEM_EXPEDIENTE: readonly string[] = [
  "Feriado",
  "Fim de Semana",
  "Liberado",
  "Férias",
  "Dayoff Aniversário",
];
