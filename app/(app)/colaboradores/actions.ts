"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpsertColaboradorState = { error: string | null; success: boolean };

export async function upsertColaboradorAction(
  _prevState: UpsertColaboradorState,
  formData: FormData,
): Promise<UpsertColaboradorState> {
  const id = formData.get("id");
  const nome = formData.get("nome");
  const cpf = formData.get("cpf");
  const cargo = formData.get("cargo");
  const setor = formData.get("setor");

  if (typeof nome !== "string" || !nome.trim()) {
    return { error: "Nome é obrigatório.", success: false };
  }

  const cpfDigits = typeof cpf === "string" ? cpf.replace(/\D/g, "") : "";
  if (cpfDigits.length !== 11) {
    return { error: "CPF inválido — use 11 dígitos.", success: false };
  }

  const payload = {
    nome: nome.trim(),
    cpf: cpfDigits,
    cargo: typeof cargo === "string" && cargo.trim() ? cargo.trim() : null,
    setor: typeof setor === "string" && setor.trim() ? setor.trim() : null,
  };

  const supabase = await createClient();
  const { error } =
    typeof id === "string" && id
      ? await supabase.from("colaboradores").update(payload).eq("id", id)
      : await supabase.from("colaboradores").insert(payload);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Já existe um colaborador com esse CPF."
          : "Erro ao salvar colaborador.",
      success: false,
    };
  }

  revalidatePath("/colaboradores");
  return { error: null, success: true };
}

export async function toggleAtivoAction(id: string, ativo: boolean) {
  const supabase = await createClient();
  await supabase.from("colaboradores").update({ ativo }).eq("id", id);
  revalidatePath("/colaboradores");
}
