import { createElement, type ReactElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { FolhaPontoDocumentLote, montarLinhasDaTabela } from "@/lib/pdf/folha-ponto-document";
import { getDefaultAnoMes, primeiroDiaIso, ultimoDiaIso } from "@/lib/registros/dates";
import type { Tables } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ error: "Nenhum colaborador selecionado" }, { status: 400 });
  }

  const defaults = getDefaultAnoMes();
  const ano = searchParams.get("ano") ? Number(searchParams.get("ano")) : defaults.ano;
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : defaults.mes;

  const supabase = await createClient();
  const [{ data: colaboradores }, { data: registros }] = await Promise.all([
    supabase.from("colaboradores").select("*").in("id", ids),
    supabase
      .from("registros")
      .select("*")
      .in("colaborador_id", ids)
      .gte("data", primeiroDiaIso(ano, mes))
      .lte("data", ultimoDiaIso(ano, mes)),
  ]);

  if (!colaboradores || colaboradores.length === 0) {
    return NextResponse.json({ error: "Colaboradores não encontrados" }, { status: 404 });
  }

  const registrosPorColaborador = new Map<string, Map<string, Tables<"registros">>>();
  for (const r of registros ?? []) {
    if (!registrosPorColaborador.has(r.colaborador_id)) {
      registrosPorColaborador.set(r.colaborador_id, new Map());
    }
    registrosPorColaborador.get(r.colaborador_id)!.set(r.data, r);
  }

  const colaboradoresOrdenados = [...colaboradores].sort((a, b) => a.nome.localeCompare(b.nome));

  const itens = colaboradoresOrdenados.map((colaborador) => ({
    colaborador,
    linhas: montarLinhasDaTabela(ano, mes, registrosPorColaborador.get(colaborador.id) ?? new Map()),
  }));

  const papelTimbrado = await readFile(
    path.join(process.cwd(), "public", "civalerg-papel-timbrado.jpg"),
  );

  // FolhaPontoDocumentLote retorna <Document>, mas o typing de
  // renderToBuffer exige um elemento tipado como DocumentProps diretamente
  // — cast necessário por causa dessa camada de wrapper (mesmo motivo do
  // relatorio individual).
  const documentElement = createElement(FolhaPontoDocumentLote, {
    itens,
    ano,
    mes,
    papelTimbrado,
  }) as unknown as ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(documentElement);

  const nomeArquivo = `folhas-ponto-${mes}-${ano}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
