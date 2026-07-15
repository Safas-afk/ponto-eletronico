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

export function NovoRegistroDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(hojeIso());

  function handleOpenChange(next: boolean) {
    if (next) setData(hojeIso());
    setOpen(next);
  }

  function irParaRegistro() {
    setOpen(false);
    router.push(`/registros/${data}`);
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
        </div>
        <DialogFooter>
          <Button onClick={irParaRegistro}>Ir para o dia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
