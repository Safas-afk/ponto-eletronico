"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEM_VALOR = "--";
const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimeSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hora, minuto] = value ? value.split(":") : [SEM_VALOR, SEM_VALOR];

  return (
    <div id={id} className="flex items-center gap-1.5">
      <Select
        value={hora}
        onValueChange={(h) =>
          onChange(h === SEM_VALOR ? "" : `${h}:${minuto === SEM_VALOR ? "00" : minuto}`)
        }
      >
        <SelectTrigger aria-label="Hora">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEM_VALOR}>--</SelectItem>
          {HORAS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select
        value={minuto}
        onValueChange={(m) =>
          onChange(m === SEM_VALOR ? "" : `${hora === SEM_VALOR ? "00" : hora}:${m}`)
        }
      >
        <SelectTrigger aria-label="Minuto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEM_VALOR}>--</SelectItem>
          {MINUTOS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
