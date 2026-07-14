# Lições do AppSheet — tentativas, bloqueios e gambiarras

Histórico das limitações reais enfrentadas no sistema antigo, com a
solução equivalente no app novo (Next.js + Supabase). Serve como
checklist: nenhum desses problemas deveria voltar a existir.

## 1. Deploy e distribuição segura
- **Tentativa:** publicar exigindo login por usuário (`Require Sign-In`)
- **Bloqueio:** plano gratuito desativa deploy com autenticação
  obrigatória
- **Gambiarra:** operação forçada em modo protótipo, teto de 10
  colaboradores
- **Solução no app novo:** Supabase Auth é gratuito e sem teto de
  usuários — login obrigatório desde o primeiro deploy

## 2. Geração de documentos automatizados
- **Tentativa:** automações (bots) de agendamento + PDF
- **Bloqueio:** disparo temporal e compilação de PDF na nuvem exigem
  licença paga
- **Solução no app novo:** `pg_cron`/Vercel Cron (agendamento) +
  geração de PDF via API route do Next.js — ambos gratuitos

## 3. Filtro interativo (mês/ano)
- **Tentativa:** filtro dinâmico de mês/ano na tela
- **Bloqueio:** sem variáveis de sessão/estado nativas de UI
- **Gambiarra:** tabela `Filtros_Data` travada em `ID=1`, acoplada a
  uma view de Dashboard só para emular estado
- **Solução no app novo:** `useState` do React — estado de UI nunca
  precisa tocar o banco de dados

## 4. Bloqueio de duplicidade de ponto
- **Tentativa:** impedir duas aberturas de ponto para o mesmo
  colaborador na mesma data
- **Bloqueio:** sem UNIQUE constraint nativa
- **Gambiarra:** `CONCATENATE([Colaborador], "-", [Data])` como chave
  primária, forçando colisão manual
- **Solução no app novo:** `UNIQUE (colaborador_id, data)` real no
  schema do Postgres — o banco recusa a duplicata sozinho

## 5. Renderização de nomes e integridade referencial
- **Tentativa:** vincular tabelas exibindo só o nome do funcionário
- **Bloqueio:** tipo `Ref` exige correspondência de string 100%;
  espaços residuais na planilha corromperam chaves estrangeiras
- **Gambiarra:** `TRIM()` aplicado diretamente no banco para
  higienizar os dados
- **Solução no app novo:** relacionamento sempre por `id` (uuid),
  nunca por texto — problema deixa de existir por design

## 6. Controle de exibição condicional (EnumList)
- **Tentativa:** mostrar "Detalhes da Atividade" só quando Observações
  = "Em Campo"
- **Bloqueio:** comparação direta (`=`) inválida quando o campo de
  origem é multi-seleção
- **Gambiarra:** troca para `IN()`/`CONTAINS()`
- **Solução no app novo:** `observacoes.includes("Em Campo")` — lógica
  de componente React, direta e legível

## 7. Ocultação de chave primária dinâmica
- **Tentativa:** gerar e esconder `ID_Registro` durante o preenchimento
- **Bloqueio:** regra em `App Formula` transformava a coluna `Key` em
  somente-leitura e quebrava a compilação
- **Gambiarra:** geração via `Initial Value` + desmarcar `Show`
  manualmente
- **Solução no app novo:** chave primária gerada pelo banco
  (`uuid`/`serial`), nunca exposta em formulário nenhum — não existe
  esse problema porque o formulário nunca lida com a chave

## 8. Processamento reverso de relacionamentos
- **Tentativa:** exibir os registros dentro do painel do colaborador
- **Bloqueio:** chaves quebradas inutilizaram `REF_ROWS`, que não
  atualiza em cascata
- **Gambiarra:** `FILTER()` fazendo Full Table Scan até reconstrução
  manual da estrutura
- **Solução no app novo:** consulta indexada simples
  (`WHERE colaborador_id = X`) — rápida por design, sem scan
