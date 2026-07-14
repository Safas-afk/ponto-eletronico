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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { punchAction, type CampoPonto } from "@/app/(app)/registros/actions";

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
  const [horario, setHorario] = useState(valorAtual ?? horarioAtual());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = `horario-${campo}-${colaboradorId}-${data}`;

  function handleOpenChange(next: boolean) {
    if (next) setHorario(valorAtual ?? horarioAtual());
    setError(null);
    setOpen(next);
  }

  function confirmar() {
    startTransition(async () => {
      const result = await punchAction(colaboradorId, data, campo, horario);
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
            {label} {valorAtual ?? "--:--"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Label htmlFor={inputId}>Horário</Label>
          <Input
            id={inputId}
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={confirmar} disabled={isPending}>
            {isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
