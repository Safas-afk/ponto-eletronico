"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColaboradorFormDialog } from "./colaborador-form-dialog";
import type { Tables } from "@/lib/supabase/types";

export function ColaboradoresList({
  colaboradores,
}: {
  colaboradores: Tables<"colaboradores">[];
}) {
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const visiveis = colaboradores.filter((c) => mostrarInativos || c.ativo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Colaboradores</h1>
        <div className="flex items-center gap-2">
          <ColaboradorFormDialog trigger={<Button>Novo colaborador</Button>} />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Mais opções">
                  <MoreVertical />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={mostrarInativos}
                onCheckedChange={setMostrarInativos}
              >
                Mostrar inativos
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>CPF</TableHead>
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
