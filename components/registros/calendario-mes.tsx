import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDiasDoMes, getPrimeiroDiaSemana } from "@/lib/registros/dates";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type ResumoDiaCalendario = {
  completos: number;
  pendentes: number;
  total: number;
  temRegistro: boolean;
};

export function CalendarioMes({
  ano,
  mes,
  resumosPorDia,
}: {
  ano: number;
  mes: number;
  resumosPorDia: Map<string, ResumoDiaCalendario>;
}) {
  const dias = getDiasDoMes(ano, mes);
  const offset = getPrimeiroDiaSemana(ano, mes);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => (
          <div key={`vazio-${i}`} />
        ))}
        {dias.map((dia) => {
          const resumo = resumosPorDia.get(dia);
          const diaNumero = Number(dia.slice(8, 10));
          const status = !resumo?.temRegistro
            ? "vazio"
            : resumo.pendentes === 0
              ? "completo"
              : "pendente";

          return (
            <Link
              key={dia}
              href={`/registros/${dia}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-[10px] border text-sm transition-colors hover:bg-muted",
                status === "completo" &&
                  "border-[var(--cell-complete-border)] bg-[var(--cell-complete-bg)] text-primary",
                status === "pendente" &&
                  "border-[var(--cell-pendente-border)] bg-[var(--cell-pendente-bg)] text-destructive",
                status === "vazio" && "border-border",
              )}
            >
              {diaNumero}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
