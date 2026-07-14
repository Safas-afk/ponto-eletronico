"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ColaboradorFormDialog } from "./colaborador-form-dialog";
import { toggleAtivoAction } from "@/app/(app)/colaboradores/actions";
import type { Tables } from "@/lib/supabase/types";

export function ColaboradoresList({
  colaboradores,
}: {
  colaboradores: Tables<"colaboradores">[];
}) {
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [, startTransition] = useTransition();

  const visiveis = colaboradores.filter((c) => mostrarInativos || c.ativo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={mostrarInativos}
            onCheckedChange={setMostrarInativos}
            size="sm"
          />
          Mostrar inativos
        </label>
        <ColaboradorFormDialog trigger={<Button>Novo colaborador</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiveis.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/colaboradores/${c.id}`} className="font-medium hover:underline">
                  {c.nome}
                </Link>
              </TableCell>
              <TableCell>{c.setor ?? "—"}</TableCell>
              <TableCell>{c.cargo ?? "—"}</TableCell>
              <TableCell>{c.cpf}</TableCell>
              <TableCell>
                <Switch
                  checked={c.ativo}
                  onCheckedChange={(ativo) =>
                    startTransition(() => {
                      toggleAtivoAction(c.id, ativo);
                    })
                  }
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <ColaboradorFormDialog
                  colaborador={c}
                  trigger={
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
