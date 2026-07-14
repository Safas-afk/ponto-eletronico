import { PunchButtonDialog } from "./punch-button-dialog";
import { ObservacaoSelect } from "./observacao-select";
import { Badge } from "@/components/ui/badge";
import { isPunchIncomplete } from "@/lib/registros/alerts";
import type { Tables } from "@/lib/supabase/types";

export function ColaboradorDiaRow({
  colaborador,
  data,
  registro,
}: {
  colaborador: Tables<"colaboradores">;
  data: string;
  registro?: Tables<"registros">;
}) {
  const incompleto = isPunchIncomplete(registro);

  return (
    <div className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-40 items-center gap-2">
        <span className="font-medium">{colaborador.nome}</span>
        {incompleto && <Badge variant="destructive">Incompleto</Badge>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PunchButtonDialog
          colaboradorId={colaborador.id}
          data={data}
          campo="entrada"
          label="Entrada"
          valorAtual={registro?.entrada ?? null}
        />
        <PunchButtonDialog
          colaboradorId={colaborador.id}
          data={data}
          campo="saida_almoco"
          label="Saída Almoço"
          valorAtual={registro?.saida_almoco ?? null}
        />
        <PunchButtonDialog
          colaboradorId={colaborador.id}
          data={data}
          campo="retorno_almoco"
          label="Retorno Almoço"
          valorAtual={registro?.retorno_almoco ?? null}
        />
        <PunchButtonDialog
          colaboradorId={colaborador.id}
          data={data}
          campo="saida_final"
          label="Saída Final"
          valorAtual={registro?.saida_final ?? null}
        />
        <ObservacaoSelect
          colaboradorId={colaborador.id}
          data={data}
          observacao={registro?.observacao ?? null}
          detalhesAtividade={registro?.detalhes_atividade ?? null}
        />
      </div>
    </div>
  );
}
