"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PunchButtonDialog } from "./punch-button-dialog";
import { ObservacaoSelect } from "./observacao-select";
import { PunchLoteDialog } from "./punch-lote-dialog";
import { ObservacaoLoteSelect } from "./observacao-lote-select";
import type { StatusPonto } from "@/lib/registros/alerts";

const STATUS_LABEL: Record<StatusPonto, string> = {
  sem_registro: "Sem registro",
  incompleto: "Incompleto",
  completo: "Completo",
};

const STATUS_VARIANT: Record<StatusPonto, "outline" | "destructive" | "secondary"> = {
  sem_registro: "outline",
  incompleto: "destructive",
  completo: "secondary",
};

export type ColaboradorDia = {
  id: string;
  nome: string;
  status: StatusPonto;
  entrada: string | null;
  saida_almoco: string | null;
  retorno_almoco: string | null;
  saida_final: string | null;
  observacao: string | null;
  detalhes_atividade: string | null;
};

export function ListaDiaSelecionavel({
  data,
  colaboradores,
}: {
  data: string;
  colaboradores: ColaboradorDia[];
}) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados((atual) =>
      atual.size === colaboradores.length ? new Set() : new Set(colaboradores.map((c) => c.id)),
    );
  }

  function limparSelecao() {
    setSelecionados(new Set());
  }

  const idsSelecionados = Array.from(selecionados);

  return (
    <div className="flex flex-col gap-3">
      {colaboradores.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={selecionados.size === colaboradores.length}
            onCheckedChange={alternarTodos}
          />
          Selecionar todos
        </label>
      )}

      {selecionados.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">
            {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}:
          </span>
          <PunchLoteDialog
            colaboradorIds={idsSelecionados}
            data={data}
            campo="entrada"
            label="Entrada"
            onConcluido={limparSelecao}
          />
          <PunchLoteDialog
            colaboradorIds={idsSelecionados}
            data={data}
            campo="saida_almoco"
            label="Saída Almoço"
            onConcluido={limparSelecao}
          />
          <PunchLoteDialog
            colaboradorIds={idsSelecionados}
            data={data}
            campo="retorno_almoco"
            label="Retorno Almoço"
            onConcluido={limparSelecao}
          />
          <PunchLoteDialog
            colaboradorIds={idsSelecionados}
            data={data}
            campo="saida_final"
            label="Saída Final"
            onConcluido={limparSelecao}
          />
          <ObservacaoLoteSelect
            colaboradorIds={idsSelecionados}
            data={data}
            onConcluido={limparSelecao}
          />
          <Button size="sm" variant="ghost" onClick={limparSelecao}>
            Limpar seleção
          </Button>
        </div>
      )}

      <div className="flex flex-col">
        {colaboradores.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-48 items-center gap-2">
              <Checkbox checked={selecionados.has(c.id)} onCheckedChange={() => alternar(c.id)} />
              <span className="font-medium">{c.nome}</span>
              <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PunchButtonDialog
                colaboradorId={c.id}
                data={data}
                campo="entrada"
                label="Entrada"
                valorAtual={c.entrada}
              />
              <PunchButtonDialog
                colaboradorId={c.id}
                data={data}
                campo="saida_almoco"
                label="Saída Almoço"
                valorAtual={c.saida_almoco}
              />
              <PunchButtonDialog
                colaboradorId={c.id}
                data={data}
                campo="retorno_almoco"
                label="Retorno Almoço"
                valorAtual={c.retorno_almoco}
              />
              <PunchButtonDialog
                colaboradorId={c.id}
                data={data}
                campo="saida_final"
                label="Saída Final"
                valorAtual={c.saida_final}
              />
              <ObservacaoSelect
                colaboradorId={c.id}
                data={data}
                observacao={c.observacao}
                detalhesAtividade={c.detalhes_atividade}
              />
            </div>
          </div>
        ))}
        {colaboradores.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum colaborador ativo.</p>
        )}
      </div>
    </div>
  );
}
