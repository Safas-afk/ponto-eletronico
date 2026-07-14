# Ponto Eletrônico

App web interno de registro de ponto, substituindo o AppSheet.

## Pré-requisitos

1. **Node.js** (versão 20+) — https://nodejs.org
2. **Conta no Supabase** (gratuita) — https://supabase.com
3. **Conta na Vercel** (gratuita) — https://vercel.com
4. **Claude Code** instalado — veja a documentação oficial:
   https://docs.claude.com/en/docs/claude-code/overview

## Primeiros passos

```bash
# 1. Criar o projeto Next.js (rodar uma vez, fora desta pasta de docs)
npx create-next-app@latest ponto-eletronico --typescript --tailwind --app

# 2. Entrar na pasta do projeto
cd ponto-eletronico

# 3. Instalar o cliente do Supabase
npm install @supabase/supabase-js @supabase/ssr

# 4. Instalar o shadcn/ui (componentes prontos: tabela, formulário, acordeão)
npx shadcn@latest init

# 5. Copiar o CLAUDE.md deste pacote para a raiz do projeto Next.js
# 6. Copiar a pasta docs/ deste pacote para dentro do projeto Next.js

# 7. Iniciar o Claude Code dentro da pasta do projeto
claude
```

## Variáveis de ambiente

Criar um arquivo `.env.local` (nunca commitar) com:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

Essas chaves aparecem no painel do Supabase em
Project Settings → API.

## Próximos passos sugeridos

1. Criar o schema do banco no Supabase: tabela `colaboradores`
   (nome, cpf, cargo) e tabela `registros` (colaborador_id, data,
   entrada, saida_almoco, retorno_almoco, saida_final, observacoes,
   detalhes_atividade), com índice único em `(colaborador_id, data)`
2. Configurar Supabase Auth com uma única conta (a sua)
3. Rodar `claude` dentro do projeto e pedir para gerar a primeira tela
   de login e a tela de registro de ponto com base no CLAUDE.md e no
   PROJECT-BRIEF.md
4. Depois de validado, implementar a rotina das 7h (cron) e a
   exportação em PDF
