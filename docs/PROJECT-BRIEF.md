# Requisitos Funcionais — Ponto Eletrônico

> Preencha este arquivo com as respostas reais do seu contexto. Ele vira
> parte do contexto que o Claude Code lê para tomar decisões corretas.

## Arquitetura de acesso (atualizado — stack web)
- **Login real via Supabase Auth**, uma única conta (o mantenedor) por
  enquanto. Diferente do AppSheet, aqui não há limitação de plano
  gratuito impedindo autenticação — é código próprio.
- Não é obrigatório por lei no momento (empresa com 11 funcionários,
  abaixo do limite de >20 do Art. 74 CLT), mas mantido por controle
  interno e como prova em eventual disputa trabalhista.
- Arquitetura pensada para permitir, numa fase futura, um login por
  funcionário (caso a chefia aprove expandir o uso) — mas isso não é
  implementado agora, só não deve ser impossível de adicionar depois.

## Funcionários (dados reais, confirmados)
- Quantidade atual: 12 (11 confirmados abaixo + 1 que será adicionado
  em breve pelo usuário)
- Campos: Nome completo, CPF, **Setor** (novo campo, não existia no
  AppSheet original), Função/Cargo
- Quem cadastra/edita: só o admin
- **Setor é um campo novo**, adicionado nesta fase — no AppSheet só
  existia Nome, CPF e Função. Incluir `setor` (texto) no schema de
  `colaboradores` desde já.

### Lista real dos colaboradores (dados para popular o banco)
| Nome | CPF | Setor | Função |
|---|---|---|---|
| Arthur Oliveira Santos Aurich | 060.838.605-71 | Administrativo | Analista de Nível Superior |
| Christiane Rayane Teixeira Silva | 041.444.695-06 | G.A.C | Assistente Administrativo |
| Francina Alves Meira Rocha | 384.021.575-72 | S.I.M | Assistente Administrativo |
| Jacione Silva Bastos | 018.109.115-16 | S.I.M | Médica Veterinária |
| Josimar da Silva Costa | 035.371.305-89 | Administrativo | Supervisor de Infraestrutura |
| Juliana Prates Viana | 968.334.245-00 | ATER - Assistência | Tec. de Nível Superior |
| Kariny Moreira Rocha | 080.839.965-99 | G.A.C | Assistente Técnico - Servidor Público |
| Lazaro Ferraz Viana | 789.469.805-91 | C.A.R | Assistente Administrativo |
| Queli Carolina de Souza Gonçalves | 018.526.865-02 | G.A.C | Assistente Técnico - Servidor Público |
| Simone Brito Lima | 062.857.115-18 | Administrativo | Serviços Gerais |
| Tainara Tavares Soares | 064.392.115-01 | Administrativo | Auxiliar Administrativo |

**Pendente:** 1 colaborador(a) ainda não informado — usuário vai
adicionar depois. Não travar a implementação por causa disso, só
deixar o cadastro fácil de repetir para o 12º quando vier.

**Nota de privacidade:** esta tabela contém CPFs reais. Se o
repositório GitHub deste projeto for tornado público em algum
momento, remover ou mascarar esta seção antes.

## Registro de ponto (dados da planilha atual)
- Eventos registrados: Entrada, Saída (Almoço), Retorno (Almoço), Saída
- Campo "Observações" — usado para marcar dias sem expediente normal:
  Feriado, Fim de Semana, Liberado, Férias, Dayoff Aniversário, Em Campo
- Campo "Detalhes da Atividade" — usado quando "Em Campo", para anotar
  o local/atividade (ex: "Encruzilhada - Oficina")
- Registro é feito manualmente pelo admin (não há geolocalização nem
  selfie/biometria — é digitação direta dos horários)

## Objetivo original que motivou as abas por funcionário
Gerar uma folha impressa mensal por funcionário, para colher assinatura
física e arquivar na pasta de cada um. **Este é um requisito funcional
real do novo app**, não um workaround a ser eliminado — precisa virar
uma função de exportação/impressão (PDF por funcionário e por mês).

## Sobre a exposição pública de dados no app antigo
O AppSheet atual ficava público (sem login) porque o plano gratuito só
libera deploy sem exigência de autenticação. **Confirmado com o
usuário:** desde a criação do app, só ele teve acesso ao link — risco
mitigado na prática, mesmo com a configuração exposta. No app novo,
sendo código próprio hospedado no Vercel/Supabase, essa limitação não
existe — o app terá login obrigatório desde o primeiro deploy, sem
custo adicional.

## Modelo de dados mapeado do AppSheet atual
**Tabela Colaboradores:** Nome, CPF, Cargo, Registros (referência/lookup
para os registros daquele colaborador)

**Tabela Registros:** ID_Registro, Colaborador, Data, Entrada,
Saída (Almoço), Retorno (Almoço), Saída, Observações, Detalhes da
Atividade

## Ações (Behavior) mapeadas — precisam virar funções no app novo
**Na tabela Colaboradores:**
- `Carga_Matinal` — **confirmado (com prints da configuração):**
  ação do tipo "execute an action on a set of rows", rodando sobre
  `FILTER("Colaboradores", ISNOTBLANK([Nome]))` (todos os colaboradores
  com nome preenchido), disparando `Gerar_Linha_Registro` para cada um.
  **Ela de fato cria a linha do dia de cada funcionário no backend** ao
  ser clicada — não é só preparação de UI.
- `Gerar_Linha_Registro` — **confirmado:** ação oculta (não aparece na
  UI, só existe para ser referenciada pela Carga_Matinal). Tipo
  "add a new row to another table" na tabela `Registros`, definindo:
  - `ID_Registro` = `CONCATENATE([Nome], "-", TEXT(TODAY(), "DDMMYYYY"))`
  - `Data` = `TODAY()`
  - `Colaborador` = `[Nome]`
  O `ID_Registro` composto (nome + data) substitui o UNIQUEID padrão
  do AppSheet exatamente para garantir que Entrada, Saída Almoço,
  Retorno Almoço e Saída Final do mesmo funcionário no mesmo dia caiam
  todos na mesma linha, em vez de criar uma linha nova a cada clique.
- Add, Delete, Edit — CRUD padrão

**Por que existe a `Carga_Matinal` (motivo confirmado):** o AppSheet
não permite disparo automático de ações sem um "bot" de automação, que
é recurso pago. `Carga_Matinal` é o workaround manual pra simular
"criar a linha do dia sozinho" — um clique que a pessoa dá toda manhã.

**Simplificação para o app novo:** como o app vai ser código próprio
(sem as limitações do AppSheet), essa distinção em duas ações deixa de
ser necessária. A criação da linha do dia passa a ser automática via
cron das 7h (ver seção "Automação diária às 7h" abaixo) — e, como
segurança adicional, qualquer registro de evento (Entrada/Saída
Almoço/Retorno Almoço/Saída Final) também faz um UPSERT: se por algum
motivo a linha do dia ainda não existir quando o evento for registrado,
ela é criada na hora. Isso elimina de vez a necessidade de um botão
"Carga Matinal" manual.

**Na tabela Registros:**
- `Bater Ponto` — ação customizada genérica
- `Entrada`, `Retorno_Almoco`, `Saida_Almoco`, `Saida_Final` —
  **confirmado:** cada uma abre um formulário curto (pop-up) já
  pré-preenchido com o horário atual; o usuário pode ajustar o horário
  antes de confirmar, e editar novamente depois pela tela de detalhe.
  Não é gravação automática sem revisão — sempre passa por um passo de
  confirmação visível. Replicar esse padrão no app novo: 4 botões de
  ação rápida, cada um abrindo um mini-formulário pré-preenchido.
- `Editar`, `Edit`, `Delete`, `Add`, `View Ref (Colaborador)` — CRUD/
  navegação padrão

## Template de PDF (fornecido pelo usuário, papel timbrado Civalerg)
Layout mapeado a partir do PDF de referência:
- **Cabeçalho:** logo da empresa (Civalerg) em papel timbrado
- **Linha de identificação:** "Nome: [nome] CPF: [cpf]" e
  "Cargo: [cargo] Mês/Ano: [mês/ano]"
- **Tabela, uma linha por dia do mês:** Dia | Entrada | Saída Almoço |
  Retorno Almoço | Saída | Observações | Detalhes da Atividade
- **Regra para dias sem expediente** (feriado/sábado/domingo): o nome
  do dia (ex: "Feriado", "Sábado", "Domingo") ocupa a coluna Entrada;
  as demais colunas de horário mostram `-`
- **Regra para dias parciais** (ex: um horário faltando): a coluna sem
  valor mostra `-`; a razão vai em Observações (ex: "Liberada")
- **Rodapé:** apenas a linha de assinatura ("Assinatura: ___") como
  texto real no template. O endereço da empresa NAO precisa ser
  adicionado por código — já faz parte da imagem de fundo
  (`public/civalerg-papel-timbrado.jpg`), que cobre a página inteira
  como papel timbrado. A linha de assinatura fica posicionada logo
  acima da faixa decorativa/endereço que já está na imagem.

No app novo: gerar esse PDF no servidor (Next.js API route), a partir
de um template HTML/CSS reproduzindo esse layout, filtrando os
registros do Postgres (Supabase) por funcionário e por mês/ano
selecionados.

## Automação diária às 7h (simplificado — confirmado)
Rotina agendada no servidor (Supabase `pg_cron` ou Vercel Cron),
rodando todo dia às 7h:
1. Para cada colaborador ativo, verifica se já existe linha do dia
2. **Sábado ou domingo:** cria automaticamente a linha com Observações
   = "Fim de Semana", sem ação humana
3. **Qualquer outro dia sem nenhum registro** (feriado nacional,
   estadual, municipal, ou dia normal ainda não preenchido): cria a
   linha como "pendente de classificação" e dispara notificação —
   o usuário marca manualmente pela opção já existente em Observações
   (Feriado, Liberado, etc.)

**Decisão explícita: não implementar cálculo automático de feriado
nacional.** Foi cogitado, mas não compensa a complexidade — marcar
manualmente quando a notificação de "pendente" aparecer é mais simples
de construir e manter, e o usuário já ia precisar revisar feriados
regionais/municipais manualmente de qualquer forma. Se o Claude Code
insistir em construir lógica de calendário de feriados nacionais,
redirecionar para esta seção.

## Regras de alerta de ponto incompleto (confirmado)
- Entrada e Saída Final registradas, SEM nenhum dos dois horários de
  almoço → tratado como completo, **sem alerta** (padrão de dia
  extraordinário, ex: evento fora do escritório)
- Entrada e Saída Final registradas, mas com **apenas um** dos dois
  horários de almoço preenchido → **gerar alerta** de possível
  esquecimento
- Falta Entrada ou falta Saída Final → **gerar alerta** de possível
  esquecimento

## Nota de arquitetura: sem necessidade de espelhamento entre abas
No AppSheet, o mesmo registro precisava ser espelhado (via fórmula do
Sheets) entre a aba geral "Registros" e a aba individual do
funcionário, porque a separação por pessoa era feita fisicamente em
abas diferentes. No app novo, com uma única tabela no Postgres, isso
deixa de ser necessário — a "separação por funcionário" vira apenas
um filtro na hora de gerar o PDF, sem duplicar dado nenhum.

## UX confirmada — duas abas principais

### Seletor de mês/ano — só períodos com dados (confirmado)
O seletor de mês/ano (usado tanto na aba Colaboradores quanto em
Registros) deve listar **apenas os meses/anos que já têm pelo menos um
registro no banco**, calculado dinamicamente a partir da tabela
`registros` — nunca uma lista fixa/hardcoded voltando a um ano
arbitrário (ex: 2024). Evita navegação por períodos vazios.

### Aba "Colaboradores"
- Lista de todos os colaboradores (ativos por padrão) com informações
  básicas (nome, cargo)
- Clicar em um colaborador → tela de detalhe mostrando seus dados
  (Nome, CPF, Cargo) e o **histórico de registros dele, organizado por
  mês/ano** — selecionar um período e ver todos os dias daquele mês
  com os registros do colaborador
- É essa tela que alimenta a exportação do PDF (por colaborador + mês)
- **Diferença chave em relação à aba Registros:** aqui a navegação é
  "colaborador → todos os dias dele no período". Em Registros é o
  caminho inverso: "dia → colaboradores daquele dia" (ver abaixo)

### Aba "Registros" (fluxo de navegação confirmado e refinado)
- É onde o registro diário de ponto acontece — bater ponto de cada
  funcionário, em cada dia
- **Mudança central em relação ao AppSheet:** nunca mostrar uma lista
  plana com todos os registros de todos os dias do mês ao mesmo tempo
  (esse era o problema real do sistema antigo: 200-300 linhas pra
  rolar até o fim do mês)
- **Visualização do mês: formato calendário**, não lista corrida —
  grade tipo calendário com os dias do mês selecionado, não uma lista
  vertical de blocos expansíveis (isso substitui a ideia anterior de
  acordeão por dia)
- **Fluxo de navegação, em 3 níveis:**
  1. Usuário seleciona o mês/ano → vê o **calendário** daquele mês
  2. Clica num dia do calendário → aparece a **lista de colaboradores
     que têm registro naquele dia específico** (não os 11/12 sempre,
     só quem já tem algo registrado naquele dia)
  3. Clica no nome de um colaborador dentro dessa lista → aparece
     **os registros de horário daquele colaborador, só daquele dia**
     (Entrada, Saída Almoço, Retorno Almoço, Saída Final), com os
     botões de ação rápida pra bater ponto/editar
- Indicação visual no próprio calendário: útil marcar visualmente
  dias com pendência (ex: cor diferente para "dia sem nenhum registro
  ainda" vs "dia completo") — vem do requisito já registrado de
  alerta de pendência (ver seção de automação/alertas)

## Direção visual
Sem preocupação estética prioritária — o requisito é **funcional
antes de bonito**. Interface simples e direta é suficiente; não
investir tempo em customização visual elaborada nesta fase.

## O que já funcionava bem no AppSheet (manter no app novo)
- Painel de detalhe com navegação sequencial entre registros
  (anterior/próximo) sem voltar à lista
- Filtro por coluna com intervalo de datas
- Campo "Observações" como lista fechada de opções (chips), não texto
  livre — evita erro de digitação
- Visão mestre-detalhe: colaborador → seus registros

## O que NÃO conseguiu implementar no AppSheet
- Geração de PDF/folha de ponto por funcionário e por mês (você já
  tem o template pronto — usado como base)
- **Cálculo de horas extras/banco de horas: confirmado que NÃO é
  requisito.** A empresa é flexível — não contabiliza horas extras
  nem desconta horas não trabalhadas, desde que o trabalho seja
  entregue. Não implementar esse cálculo.

## Retenção de dados e backup (confirmado)
O sistema **não é o arquivo legal oficial** — esse papel é do
documento impresso e assinado, guardado em pasta suspensa por
funcionário. O sistema serve só para facilitar o registro diário e
gerar o PDF mensal. Consequência:
- Não é necessário planejar retenção histórica de anos no banco
- **É necessário um backup mensal** (ex: botão "exportar backup do
  mês" gerando um JSON/CSV, ou export automático antes do fechamento
  do mês), para não perder os registros caso algo falhe antes da
  impressão

## Funcionários inativos
Sem exigência legal de retenção infinita, mas por usabilidade: incluir
um campo `ativo` (boolean) em `colaboradores`, para que funcionários
desligados saiam da lista do dia a dia sem precisar apagar o
histórico já impresso/assinado daquele período.

## Relatórios e impressão
- Quem revisa/assina: o próprio funcionário, no papel impresso
- Formato necessário: folha de ponto mensal por funcionário, pronta
  para impressão e assinatura
- [Preencher: precisa também de um relatório consolidado de todos os
  funcionários, tipo resumo gerencial?]
