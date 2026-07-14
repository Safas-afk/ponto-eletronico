import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListaDiaSelecionavel, type ColaboradorDia } from "@/components/registros/lista-dia-selecionavel";
import { formatDataPtBr } from "@/lib/registros/dates";
import { getStatusPonto } from "@/lib/registros/alerts";
import type { Tables } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Registros do dia — Ponto Eletrônico",
};

export default async function RegistrosDoDiaPage({
  params,
}: {
  params: Promise<{ data: string }>;
}) {
  const { data } = await params;
  const [ano, mes] = data.split("-").map(Number);

  const supabase = await createClient();
  const [{ data: colaboradores }, { data: registros }] = await Promise.all([
    supabase.from("colaboradores").select("*").eq("ativo", true).order("nome"),
    supabase.from("registros").select("*").eq("data", data),
  ]);

  const registrosPorColaborador = new Map<string, Tables<"registros">>();
  for (const r of registros ?? []) {
    registrosPorColaborador.set(r.colaborador_id, r);
  }

  const colaboradoresDia: ColaboradorDia[] = (colaboradores ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    status: getStatusPonto(registrosPorColaborador.get(c.id)),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/registros?ano=${ano}&mes=${mes}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Voltar ao mês
        </Link>
        <h1 className="text-xl font-semibold">
          {formatDataPtBr(data, {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </h1>
      </div>

      <ListaDiaSelecionavel data={data} colaboradores={colaboradoresDia} />
    </div>
  );
}
