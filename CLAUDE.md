# Ponto Eletrônico — CLAUDE.md

## Sobre o projeto
App web para registro de ponto de ~11 funcionários de escritório,
substituindo planilhas físicas e o AppSheet do Google. Uso pessoal por
enquanto (só o mantenedor tem login), com espaço para virar
multiusuário no futuro. Prioridade: funcional antes de bonito.

Quem mantém: [seu nome aqui]. Sem equipe de dev — priorize simplicidade
e manutenção por uma pessoa só.

## Documentação de apoio (ler antes de decisões grandes)
- `docs/PROJECT-BRIEF.md` — requisitos funcionais completos
- `docs/DECISIONS.md` — por que a arquitetura é essa (histórico de pivôs)
- `docs/APPSHEET-LICOES.md` — anti-padrões do sistema antigo, não repetir

## Stack
- Next.js (App Router) + React + TypeScript + Tailwind CSS
- shadcn/ui — biblioteca de componentes prontos (tabela, formulário,
  acordeão) construída sobre Tailwind, para acelerar a implementação
  sem escrever CSS do zero
- Supabase (Postgres + Auth) como backend
- Deploy: Vercel (frontend) + Supabase (banco, plano free)
- Automação diária (7h): `pg_cron` (Supabase) ou Vercel Cron

## Comandos
- `npm run dev` / `npm run build` / `npm run lint`

## Estrutura do projeto
- `app/` — páginas e rotas · `components/` — componentes React
- `lib/` — cliente Supabase, lógica de negócio · `docs/` — documentação

## Regras arquiteturais não-negociáveis
(motivo detalhado de cada uma em `docs/APPSHEET-LICOES.md`)
- Relacionamentos sempre por `id` (uuid), nunca comparando texto/nome
- Duplicidade impedida por `UNIQUE (colaborador_id, data)` no Postgres,
  não só por checagem no código
- Estado de UI (filtro de mês/ano, busca) vive em `useState`, nunca em
  tabela do banco
- Exibição condicional de campo é lógica de componente (`if`/render
  condicional), nunca fórmula de banco
- Chave primária é gerada pelo banco e nunca aparece em formulário
- Consultas de relacionamento usam índice na foreign key

## Segurança (checklist básico deste projeto)
- RLS (Row Level Security) ativo em todas as tabelas do Supabase,
  mesmo com um único usuário — segunda barreira caso a chave de API
  vaze
- Login obrigatório em todas as rotas, sem exceção
- Senha forte na conta admin; usar 2FA do Supabase Auth se disponível
- Nunca commitar `.env.local` nem qualquer credencial
- Validar e sanitizar todo input de formulário no backend
- CPF e dados pessoais nunca aparecem em logs (nem client nem server)
- Backup mensal exportável (ver PROJECT-BRIEF) — o sistema não é o
  arquivo legal oficial (isso é o papel assinado), mas não pode perder
  dados antes da impressão do mês

## Convenções
- Textos de interface em português (pt-BR); código em inglês
- Sempre validar dados no backend, nunca confiar só no frontend
- Componentes pequenos e reutilizáveis, não telas monolíticas

## Regras importantes
- Antes de mudanças estruturais (schema, cron, autenticação), propor
  um plano curto antes de implementar
- Ao corrigir um bug, explicar a causa raiz antes de aplicar a correção
- **Sem cálculo automático de feriado nacional/regional** — decisão
  explícita, ver `docs/PROJECT-BRIEF.md`. Feriados são marcados
  manualmente pelo usuário via Observações. Não reintroduzir essa
  lógica sem confirmar antes.
- Este projeto também serve de aprendizado — prefira explicações que
  ensinem o "porquê", não só o "o quê"
