import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { formatDataPtBr, formatHora, getDiasDoMes, NOMES_MESES } from "@/lib/registros/dates";
import { OBSERVACOES_SEM_EXPEDIENTE } from "@/lib/registros/constants";
import type { Tables } from "@/lib/supabase/types";

// Desliga a hifenização automática (ex: "Al-moço") — o cabeçalho da
// tabela deve quebrar só entre palavras inteiras, como no docx original.
Font.registerHyphenationCallback((word) => [word]);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

// Margens extraídas do docx de referência (docs/referencia/*.docx,
// w:pgMar em twips ÷ 20 = pt): top 1660, bottom 280, left 1559, right 1133.
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 83,
    paddingBottom: 14,
    paddingLeft: 78,
    paddingRight: 57,
  },
  // A imagem fica atrás do conteúdo (equivalente ao behindDoc="1" +
  // wrapNone do docx original): position absolute, sem participar do
  // fluxo do documento, com o texto renderizado por cima na mesma página.
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  identificacao: {
    marginBottom: 14,
    gap: 2,
  },
  identLinha: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    padding: 3,
    borderRight: "1pt solid #ccc",
    borderBottom: "1pt solid #ccc",
    borderTop: "1pt solid #ccc",
    borderLeft: "1pt solid #ccc",
  },
  cell: {
    fontSize: 8,
    padding: 3,
    borderRight: "1pt solid #ccc",
    borderBottom: "1pt solid #ccc",
  },
  firstCell: {
    borderLeft: "1pt solid #ccc",
  },
  // Larguras proporcionais às colunas do docx original (1100/1120/1100/
  // 1240/1120/1340/1940 twips, de um total de 8960).
  colDia: { width: "12.3%" },
  colHora: { width: "12.5%" },
  colRetorno: { width: "13.8%" },
  colObs: { width: "15%" },
  colDetalhes: { width: "21.6%" },
  assinatura: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  assinaturaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  assinaturaLinha: {
    flexGrow: 1,
    marginLeft: 4,
    borderBottom: "1pt solid #000",
    height: 10,
  },
});

type LinhaTabela = {
  diaNumero: number;
  entrada: string;
  saidaAlmoco: string;
  retornoAlmoco: string;
  saidaFinal: string;
  observacao: string;
  detalhes: string;
};

function nomeDiaSemana(iso: string): string {
  const nome = formatDataPtBr(iso, { weekday: "long" });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function montarLinha(iso: string, registro: Tables<"registros"> | undefined): LinhaTabela {
  const diaNumero = Number(iso.slice(8, 10));
  const observacao = registro?.observacao ?? null;
  const semExpediente = observacao !== null && OBSERVACOES_SEM_EXPEDIENTE.includes(observacao);

  const entrada = semExpediente
    ? observacao === "Fim de Semana"
      ? nomeDiaSemana(iso)
      : observacao!
    : formatHora(registro?.entrada) || "-";

  const horarioOuTraco = (valor: string | null | undefined) =>
    semExpediente ? "-" : formatHora(valor) || "-";

  return {
    diaNumero,
    entrada,
    saidaAlmoco: horarioOuTraco(registro?.saida_almoco),
    retornoAlmoco: horarioOuTraco(registro?.retorno_almoco),
    saidaFinal: horarioOuTraco(registro?.saida_final),
    observacao: observacao ?? "-",
    detalhes: registro?.detalhes_atividade ?? "-",
  };
}

export function montarLinhasDaTabela(
  ano: number,
  mes: number,
  registrosPorDia: Map<string, Tables<"registros">>,
): LinhaTabela[] {
  return getDiasDoMes(ano, mes).map((iso) => montarLinha(iso, registrosPorDia.get(iso)));
}

export function FolhaPontoDocument({
  colaborador,
  ano,
  mes,
  linhas,
  papelTimbrado,
}: {
  colaborador: Pick<Tables<"colaboradores">, "nome" | "cpf" | "cargo" | "setor">;
  ano: number;
  mes: number;
  linhas: LinhaTabela[];
  papelTimbrado: Buffer;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image aqui é do @react-pdf/renderer (PDF), não <img> HTML */}
        <Image fixed src={papelTimbrado} style={styles.background} />

        <View style={styles.identificacao}>
          <Text style={styles.identLinha}>
            Nome: {colaborador.nome}     CPF: {colaborador.cpf}
          </Text>
          <Text style={styles.identLinha}>
            Setor: {colaborador.setor ?? "-"}     Cargo: {colaborador.cargo ?? "-"}
          </Text>
          <Text style={styles.identLinha}>
            Mês/Ano: {NOMES_MESES[mes - 1]}/{ano}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.colDia, styles.headerCell]}>Dia</Text>
          <Text style={[styles.colHora, styles.headerCell]}>Entrada</Text>
          <Text style={[styles.colHora, styles.headerCell]}>Saída Almoço</Text>
          <Text style={[styles.colRetorno, styles.headerCell]}>Retorno Almoço</Text>
          <Text style={[styles.colHora, styles.headerCell]}>Saída</Text>
          <Text style={[styles.colObs, styles.headerCell]}>Observações</Text>
          <Text style={[styles.colDetalhes, styles.headerCell]}>Detalhes da Atividade</Text>
        </View>

        {linhas.map((linha) => (
          <View key={linha.diaNumero} style={styles.tableRow}>
            <Text style={[styles.colDia, styles.cell, styles.firstCell]}>{linha.diaNumero}</Text>
            <Text style={[styles.colHora, styles.cell]}>{linha.entrada}</Text>
            <Text style={[styles.colHora, styles.cell]}>{linha.saidaAlmoco}</Text>
            <Text style={[styles.colRetorno, styles.cell]}>{linha.retornoAlmoco}</Text>
            <Text style={[styles.colHora, styles.cell]}>{linha.saidaFinal}</Text>
            <Text style={[styles.colObs, styles.cell]}>{linha.observacao}</Text>
            <Text style={[styles.colDetalhes, styles.cell]}>{linha.detalhes}</Text>
          </View>
        ))}

        <View style={styles.assinatura}>
          <Text style={styles.assinaturaLabel}>Assinatura:</Text>
          <View style={styles.assinaturaLinha} />
        </View>
      </Page>
    </Document>
  );
}
