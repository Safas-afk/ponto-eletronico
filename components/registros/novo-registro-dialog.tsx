"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { getDefaultAnoMes } from "@/lib/registros/dates";

function hojeIso(): string {
  const { ano, mes } = getDefaultAnoMes();
  const dia = new Date().getDate();
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function NovoRegistroDialog({
  colaboradores,
}: {
  colaboradores: { id: string; nome: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(hojeIso());
  const [colaboradorId, setColaboradorId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setData(hojeIso());
      setColaboradorId("");
      setError(null);
    }
    setOpen(next);
  }

  function irParaRegistro() {
    if (!data || !colaboradorId) {
      setError("Escolha a data e o colaborador.");
      return;
    }
    setOpen(false);
    router.push(`/registros/${data}/${colaboradorId}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline">Novo registro</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo registro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-registro-data">Data</Label>
            <Input
              id="novo-registro-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-registro-colaborador">Colaborador</Label>
            {/* Select nativo de propósito: o Select do base-ui dentro de um
                Dialog apresentou bug real (popup com opções de tamanho
                zero) — ver observacao-lote-select.tsx. */}
            <select
              id="novo-registro-colaborador"
              value={colaboradorId}
              onChange={(e) => setColaboradorId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="" disabled>
                Selecione um colaborador
              </option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={irParaRegistro}>Ir para o registro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
