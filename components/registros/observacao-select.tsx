"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setObservacaoAction } from "@/app/(app)/registros/actions";
import { OBSERVACAO_OPCOES } from "@/lib/registros/constants";

const NENHUMA = "__nenhuma__";

export function ObservacaoSelect({
  colaboradorId,
  data,
  observacao,
  detalhesAtividade,
}: {
  colaboradorId: string;
  data: string;
  observacao: string | null;
  detalhesAtividade: string | null;
}) {
  const [valor, setValor] = useState(observacao ?? NENHUMA);
  const [detalhes, setDetalhes] = useState(detalhesAtividade ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const alterado = valor !== (observacao ?? NENHUMA) || detalhes !== (detalhesAtividade ?? "");

  function salvar() {
    startTransition(async () => {
      const result = await setObservacaoAction(
        colaboradorId,
        data,
        valor === NENHUMA ? null : valor,
        detalhes.trim() || null,
      );
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={valor}
        onValueChange={(v) => {
          const next = v ?? NENHUMA;
          setValor(next);
          if (next !== "Em Campo") setDetalhes("");
        }}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Observações">
            {(v: string | null) => (!v || v === NENHUMA ? "Observações" : v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NENHUMA}>Nenhuma</SelectItem>
          {OBSERVACAO_OPCOES.map((op) => (
            <SelectItem key={op} value={op}>
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {valor === "Em Campo" && (
        <Input
          placeholder="Detalhes da atividade"
          value={detalhes}
          onChange={(e) => setDetalhes(e.target.value)}
          className="w-48"
        />
      )}
      {alterado && (
        <Button size="sm" onClick={salvar} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
