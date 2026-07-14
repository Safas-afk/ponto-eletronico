function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function getDefaultAnoMes(): { ano: number; mes: number } {
  const hoje = new Date();
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
}

export function primeiroDiaIso(ano: number, mes: number): string {
  return `${ano}-${pad2(mes)}-01`;
}

export function ultimoDiaIso(ano: number, mes: number): string {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return `${ano}-${pad2(mes)}-${pad2(diasNoMes)}`;
}

// Gera as datas do mês como string local (yyyy-mm-dd), sem passar por
// parsing de fuso — evitar `new Date(iso)` em string "date-only" é
// importante aqui, porque isso é interpretado como UTC e pode voltar
// um dia no horário de Brasília (UTC-3).
export function getDiasDoMes(ano: number, mes: number): string[] {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return Array.from({ length: diasNoMes }, (_, i) => `${ano}-${pad2(mes)}-${pad2(i + 1)}`);
}

// 0 = domingo ... 6 = sábado — usado pra alinhar a grade do calendário
// (quantas células vazias antes do dia 1 do mês).
export function getPrimeiroDiaSemana(ano: number, mes: number): number {
  return new Date(ano, mes - 1, 1).getDay();
}

export function formatDataPtBr(iso: string, options?: Intl.DateTimeFormatOptions): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return new Intl.DateTimeFormat(
    "pt-BR",
    options ?? { weekday: "short", day: "2-digit", month: "2-digit" },
  ).format(data);
}

export const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;
