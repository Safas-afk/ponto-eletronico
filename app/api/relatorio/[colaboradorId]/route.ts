import { createElement, type ReactElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { FolhaPontoDocument, montarLinhasDaTabela } from "@/lib/pdf/folha-ponto-document";
import { getDefaultAnoMes, primeiroDiaIso, ultimoDiaIso } from "@/lib/registros/dates";
import type { Tables } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ colaboradorId: string }> },
) {
  const { colaboradorId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const defaults = getDefaultAnoMes();
  const ano = searchParams.get("ano") ? Number(searchParams.get("ano")) : defaults.ano;
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : defaults.mes;

  const supabase = await createClient();
  const [{ data: colaborador }, { data: registros }] = await Promise.all([
    supabase.from("colaboradores").select("*").eq("id", colaboradorId).single(),
    supabase
      .from("registros")
      .select("*")
      .eq("colaborador_id", colaboradorId)
      .gte("data", primeiroDiaIso(ano, mes))
      .lte("data", ultimoDiaIso(ano, mes)),
  ]);

  if (!colaborador) {
    return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 404 });
  }

  const registrosPorDia = new Map<string, Tables<"registros">>();
  for (const r of registros ?? []) {
    registrosPorDia.set(r.data, r);
  }

  const linhas = montarLinhasDaTabela(ano, mes, registrosPorDia);
  const papelTimbrado = await readFile(
    path.join(process.cwd(), "public", "civalerg-papel-timbrado.jpg"),
  );

  // FolhaPontoDocument é um componente que retorna <Document>, mas o
  // typing de renderToBuffer exige um elemento tipado como DocumentProps
  // diretamente — cast necessário por causa dessa camada de wrapper.
  const documentElement = createElement(FolhaPontoDocument, {
    colaborador,
    ano,
    mes,
    linhas,
    papelTimbrado,
  }) as unknown as ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(documentElement);

  const nomeArquivo = `ponto-${colaborador.nome.replace(/\s+/g, "-")}-${mes}-${ano}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nomeArquivo}"`,
    },
  });
}
