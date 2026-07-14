import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ColaboradorDiaRow } from "@/components/registros/colaborador-dia-row";
import { formatDataPtBr } from "@/lib/registros/dates";

export const metadata: Metadata = {
  title: "Registro do colaborador — Ponto Eletrônico",
};

export default async function RegistroColaboradorDiaPage({
  params,
}: {
  params: Promise<{ data: string; colaboradorId: string }>;
}) {
  const { data, colaboradorId } = await params;

  const supabase = await createClient();
  const [{ data: colaborador }, { data: registro }, { data: colaboradoresAtivos }] =
    await Promise.all([
      supabase.from("colaboradores").select("*").eq("id", colaboradorId).single(),
      supabase
        .from("registros")
        .select("*")
        .eq("colaborador_id", colaboradorId)
        .eq("data", data)
        .maybeSingle(),
      supabase.from("colaboradores").select("id, nome").eq("ativo", true).order("nome"),
    ]);

  if (!colaborador) {
    notFound();
  }

  const lista = colaboradoresAtivos ?? [];
  const indice = lista.findIndex((c) => c.id === colaboradorId);
  const anterior = indice > 0 ? lista[indice - 1] : undefined;
  const proximo = indice >= 0 && indice < lista.length - 1 ? lista[indice + 1] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/registros/${data}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Voltar aos colaboradores do dia
        </Link>
        <h1 className="text-xl font-semibold">
          {colaborador.nome} —{" "}
          {formatDataPtBr(data, {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </h1>
      </div>

      <ColaboradorDiaRow colaborador={colaborador} data={data} registro={registro ?? undefined} />

      <div className="flex justify-between text-sm">
        {anterior ? (
          <Link href={`/registros/${data}/${anterior.id}`} className="hover:underline">
            ← {anterior.nome}
          </Link>
        ) : (
          <span />
        )}
        {proximo ? (
          <Link href={`/registros/${data}/${proximo.id}`} className="hover:underline">
            {proximo.nome} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
