import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ColaboradorFormDialog } from "@/components/colaboradores/colaborador-form-dialog";
import { PeriodoPicker } from "@/components/registros/periodo-picker";
import {
  getDefaultAnoMes,
  primeiroDiaIso,
  ultimoDiaIso,
  formatDataPtBr,
} from "@/lib/registros/dates";
import { getPeriodosDisponiveis } from "@/lib/registros/periodos";

export default async function ColaboradorDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const defaults = getDefaultAnoMes();
  const ano = sp.ano ? Number(sp.ano) : defaults.ano;
  const mes = sp.mes ? Number(sp.mes) : defaults.mes;

  const supabase = await createClient();
  const [{ data: colaborador }, { data: registros }, periodos] = await Promise.all([
    supabase.from("colaboradores").select("*").eq("id", id).single(),
    supabase
      .from("registros")
      .select("*")
      .eq("colaborador_id", id)
      .gte("data", primeiroDiaIso(ano, mes))
      .lte("data", ultimoDiaIso(ano, mes))
      .order("data"),
    getPeriodosDisponiveis(),
  ]);

  if (!colaborador) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{colaborador.nome}</h1>
          <p className="text-sm text-muted-foreground">
            CPF: {colaborador.cpf} · Setor: {colaborador.setor ?? "—"} · Cargo:{" "}
            {colaborador.cargo ?? "—"} · {colaborador.ativo ? "Ativo" : "Inativo"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/relatorio/${id}?ano=${ano}&mes=${mes}`} target="_blank" rel="noreferrer" />}
          >
            Baixar PDF
          </Button>
          <ColaboradorFormDialog
            colaborador={colaborador}
            trigger={<Button variant="outline">Editar</Button>}
          />
        </div>
      </div>

      <PeriodoPicker ano={ano} mes={mes} periodos={periodos} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dia</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Saída Almoço</TableHead>
            <TableHead>Retorno Almoço</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead>Detalhes da Atividade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(registros ?? []).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{formatDataPtBr(r.data)}</TableCell>
              <TableCell>{r.entrada ?? "—"}</TableCell>
              <TableCell>{r.saida_almoco ?? "—"}</TableCell>
              <TableCell>{r.retorno_almoco ?? "—"}</TableCell>
              <TableCell>{r.saida_final ?? "—"}</TableCell>
              <TableCell>{r.observacao ?? "—"}</TableCell>
              <TableCell>{r.detalhes_atividade ?? "—"}</TableCell>
            </TableRow>
          ))}
          {(registros ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Nenhum registro neste mês.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
