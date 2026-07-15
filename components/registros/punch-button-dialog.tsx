"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeSelect } from "@/components/ui/time-select";
import { Label } from "@/components/ui/label";
import { punchAction, type CampoPonto } from "@/app/(app)/registros/actions";
import { formatHora } from "@/lib/registros/dates";

function horarioAtual(): string {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
}

export function PunchButtonDialog({
  colaboradorId,
  data,
  campo,
  label,
  valorAtual,
}: {
  colaboradorId: string;
  data: string;
  campo: CampoPonto;
  label: string;
  valorAtual: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [horario, setHorario] = useState(valorAtual ? formatHora(valorAtual) : horarioAtual());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = `horario-${campo}-${colaboradorId}-${data}`;

  function handleOpenChange(next: boolean) {
    if (next) setHorario(valorAtual ? formatHora(valorAtual) : horarioAtual());
    setError(null);
    setOpen(next);
  }

  function confirmar() {
    startTransition(async () => {
      const result = await punchAction(colaboradorId, data, campo, horario || null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={valorAtual ? "secondary" : "outline"} size="sm">
            {label} {valorAtual ? formatHora(valorAtual) : "--:--"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Label htmlFor={inputId}>Horário</Label>
          <TimeSelect id={inputId} value={horario} onChange={setHorario} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setHorario("")}
            disabled={isPending || !horario}
          >
            Limpar
          </Button>
          <Button onClick={confirmar} disabled={isPending}>
            {isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
