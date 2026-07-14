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
import { setObservacaoManyAction } from "@/app/(app)/registros/actions";
import { OBSERVACAO_OPCOES } from "@/lib/registros/constants";

const NENHUMA = "__nenhuma__";

// Controle inline (não Dialog) de propósito: um Select dentro de um
// Dialog aninhado apresentou bug real no base-ui (popup renderizava
// com opções de tamanho zero, sem responder a clique/teclado) — por
// isso a observação em lote segue o mesmo padrão inline já usado no
// nível 3 (ObservacaoSelect), em vez de um modal.
export function ObservacaoLoteSelect({
  colaboradorIds,
  data,
  onConcluido,
}: {
  colaboradorIds: string[];
  data: string;
  onConcluido?: () => void;
}) {
  const [valor, setValor] = useState(NENHUMA);
  const [detalhes, setDetalhes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function aplicar() {
    startTransition(async () => {
      const result = await setObservacaoManyAction(
        colaboradorIds,
        data,
        valor === NENHUMA ? null : valor,
        detalhes.trim() || null,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setValor(NENHUMA);
      setDetalhes("");
      setError(null);
      onConcluido?.();
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
          <SelectValue placeholder="Observação">
            {(v: string | null) => (!v || v === NENHUMA ? "Observação" : v)}
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
          className="w-40"
        />
      )}
      <Button size="sm" onClick={aplicar} disabled={isPending || colaboradorIds.length === 0}>
        {isPending ? "Aplicando..." : "Aplicar"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
