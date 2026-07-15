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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PeriodoPicker } from "@/components/registros/periodo-picker";
import { ColaboradorFormDialog } from "./colaborador-form-dialog";
import type { Periodo } from "@/lib/registros/periodos";
import type { Tables } from "@/lib/supabase/types";

export function ColaboradoresList({
  colaboradores,
  ano,
  mes,
  periodos,
}: {
  colaboradores: Tables<"colaboradores">[];
  ano: number;
  mes: number;
  periodos: Periodo[];
}) {
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const visiveis = colaboradores.filter((c) => mostrarInativos || c.ativo);

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados((atual) =>
      atual.size === visiveis.length ? new Set() : new Set(visiveis.map((c) => c.id)),
    );
  }

  const idsSelecionados = Array.from(selecionados);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Colaboradores</h1>
        <div className="flex items-center gap-2">
          <PeriodoPicker ano={ano} mes={mes} periodos={periodos} />
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

      {selecionados.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">
            {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}:
          </span>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href={`/api/relatorio/lote?ids=${idsSelecionados.join(",")}&ano=${ano}&mes=${mes}`} />
            }
          >
            Baixar PDF
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={visiveis.length > 0 && selecionados.size === visiveis.length}
                onCheckedChange={alternarTodos}
              />
            </TableHead>
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
                <Checkbox checked={selecionados.has(c.id)} onCheckedChange={() => alternar(c.id)} />
              </TableCell>
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
