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
// "Liberado" entra aqui porque o colaborador pode sair mais cedo sem
// bater a saída final, mas ele ainda pode ter batido ponto normalmente
// (ex: chegou de manhã e foi liberado à tarde) — por isso não entra em
// OBSERVACOES_DIA_INTEIRO, que é usada só onde não há expediente algum.
export const OBSERVACOES_SEM_EXPEDIENTE: readonly string[] = [
  "Feriado",
  "Fim de Semana",
  "Liberado",
  "Férias",
  "Dayoff Aniversário",
];

// Observações de dia inteiro sem nenhum horário esperado — usadas na
// exportação (PDF/CSV) pra substituir a linha de horários pelo texto da
// observação. Não inclui "Liberado" nem "Em Campo": nesses casos o
// colaborador pode ter horários reais batidos e a observação é só um
// complemento, não deve apagar os horários da exportação.
export const OBSERVACOES_DIA_INTEIRO: readonly string[] = [
  "Feriado",
  "Fim de Semana",
  "Férias",
  "Dayoff Aniversário",
];
