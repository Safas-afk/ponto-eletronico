"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
          <div key={c.id} className="flex items-center gap-3 border-b py-3 last:border-b-0">
            <Checkbox checked={selecionados.has(c.id)} onCheckedChange={() => alternar(c.id)} />
            <Link
              href={`/registros/${data}/${c.id}`}
              className="flex flex-1 items-center justify-between hover:underline"
            >
              <span className="font-medium">{c.nome}</span>
              <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
            </Link>
          </div>
        ))}
        {colaboradores.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum colaborador ativo.</p>
        )}
      </div>
    </div>
  );
}
