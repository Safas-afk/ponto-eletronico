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
import { punchManyAction, type CampoPonto } from "@/app/(app)/registros/actions";

function horarioAtual(): string {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
}

export function PunchLoteDialog({
  colaboradorIds,
  data,
  campo,
  label,
  onConcluido,
}: {
  colaboradorIds: string[];
  data: string;
  campo: CampoPonto;
  label: string;
  onConcluido?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [horario, setHorario] = useState(horarioAtual());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = `horario-lote-${campo}`;

  function handleOpenChange(next: boolean) {
    if (next) setHorario(horarioAtual());
    setError(null);
    setOpen(next);
  }

  function confirmar() {
    startTransition(async () => {
      const result = await punchManyAction(colaboradorIds, data, campo, horario);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      onConcluido?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm">{label}</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {label} para {colaboradorIds.length}{" "}
            {colaboradorIds.length === 1 ? "colaborador" : "colaboradores"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Label htmlFor={inputId}>Horário</Label>
          <TimeSelect id={inputId} value={horario} onChange={setHorario} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={confirmar} disabled={isPending || colaboradorIds.length === 0}>
            {isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
