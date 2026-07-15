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
import { Switch } from "@/components/ui/switch";
import { upsertColaboradorAction } from "@/app/(app)/colaboradores/actions";
import type { Tables } from "@/lib/supabase/types";

export function ColaboradorFormDialog({
  colaborador,
  trigger,
}: {
  colaborador?: Tables<"colaboradores">;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ativo, setAtivo] = useState(colaborador?.ativo ?? true);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertColaboradorAction({ error: null, success: false }, formData);
      if (result.success) {
        setOpen(false);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setError(null);
          setAtivo(colaborador?.ativo ?? true);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{colaborador ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {colaborador && <input type="hidden" name="id" value={colaborador.id} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required defaultValue={colaborador?.nome} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" required defaultValue={colaborador?.cpf} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setor">Setor</Label>
            <Input id="setor" name="setor" defaultValue={colaborador?.setor ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" name="cargo" defaultValue={colaborador?.cargo ?? ""} />
          </div>
          {colaborador && (
            <label className="flex items-center gap-2 text-sm">
              <input type="hidden" name="ativo" value={ativo ? "true" : "false"} />
              <Switch checked={ativo} onCheckedChange={setAtivo} size="sm" />
              Ativo
            </label>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
