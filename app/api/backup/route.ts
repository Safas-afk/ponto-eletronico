import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAnoMes, primeiroDiaIso, ultimoDiaIso } from "@/lib/registros/dates";

const CABECALHO = [
  "Colaborador",
  "CPF",
  "Setor",
  "Cargo",
  "Data",
  "Entrada",
  "Saída Almoço",
  "Retorno Almoço",
  "Saída",
  "Observações",
  "Detalhes da Atividade",
];

// Excel em português espera ; como separador (vírgula é o separador
// decimal no locale pt-BR) — usar vírgula faria tudo cair numa coluna só.
function escapeCsv(valor: string): string {
  if (/[";\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

// BOM UTF-8 — sem isso o Excel abre acentos (ã, ç, é) corrompidos.
const BOM_UTF8 = "﻿";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const defaults = getDefaultAnoMes();
  const ano = searchParams.get("ano") ? Number(searchParams.get("ano")) : defaults.ano;
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : defaults.mes;

  const supabase = await createClient();
  const { data: registros } = await supabase
    .from("registros")
    .select("*, colaboradores(nome, cpf, cargo, setor)")
    .gte("data", primeiroDiaIso(ano, mes))
    .lte("data", ultimoDiaIso(ano, mes))
    .order("data");

  const linhas = (registros ?? []).map((r) => {
    const colaborador = r.colaboradores;
    return [
      colaborador?.nome ?? "",
      colaborador?.cpf ?? "",
      colaborador?.setor ?? "",
      colaborador?.cargo ?? "",
      r.data,
      r.entrada ?? "",
      r.saida_almoco ?? "",
      r.retorno_almoco ?? "",
      r.saida_final ?? "",
      r.observacao ?? "",
      r.detalhes_atividade ?? "",
    ]
      .map((v) => escapeCsv(String(v)))
      .join(";");
  });

  const csv = [CABECALHO.join(";"), ...linhas].join("\r\n");
  const nomeArquivo = `backup-ponto-${mes}-${ano}.csv`;

  return new NextResponse(BOM_UTF8 + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
