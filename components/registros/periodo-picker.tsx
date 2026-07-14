"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOMES_MESES } from "@/lib/registros/dates";
import type { Periodo } from "@/lib/registros/periodos";

function chave(p: Periodo): string {
  return `${p.ano}-${p.mes}`;
}

function label(p: Periodo): string {
  return `${NOMES_MESES[p.mes - 1]} ${p.ano}`;
}

export function PeriodoPicker({
  ano,
  mes,
  periodos,
}: {
  ano: number;
  mes: number;
  periodos: Periodo[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function atualizar(valor: string) {
    const [novoAno, novoMes] = valor.split("-").map(Number);
    const params = new URLSearchParams(searchParams.toString());
    params.set("ano", String(novoAno));
    params.set("mes", String(novoMes));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={chave({ ano, mes })} onValueChange={(v) => v && atualizar(v)}>
      <SelectTrigger>
        <SelectValue>
          {(v: string | null) => {
            if (!v) return "";
            const [a, m] = v.split("-").map(Number);
            return `${NOMES_MESES[m - 1]} ${a}`;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {periodos.map((p) => (
          <SelectItem key={chave(p)} value={chave(p)}>
            {label(p)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
