# Decisões de Arquitetura — Ponto Eletrônico

Histórico de por que a arquitetura mudou ao longo do planejamento.
Guardado aqui para não repetir a mesma discussão no futuro.

## 1ª decisão: Next.js + Supabase + Vercel (web, nuvem)
Recomendação inicial. Racional: stack padrão de mercado, ponte natural
para o objetivo final (Postgres real, útil para depois estudar IA como
motor de banco), boa curva de aprendizado reaproveitando conhecimento
de código do usuário.

## 2ª decisão: React Native + Expo (APK offline, Android)
Pivô motivado por um problema real do AppSheet: o plano gratuito só
libera deploy sem exigência de login. Como só o usuário usa o sistema,
a solução escolhida foi tirar o app da nuvem por completo — app local,
sem servidor, sem link público, segurança = tela de bloqueio do
celular.

## 3ª decisão (final): volta para Next.js + Supabase + Vercel
Pivô de volta motivado por duas descobertas durante o desenho de
funcionalidades:
1. A automação diária das 7h (criar linhas do dia, detectar fins de
   semana automaticamente) não tem garantia de execução em background
   num APK simples do Android — servidor resolve isso de forma
   confiável (cron real).
2. A limitação de login do AppSheet era **específica daquela
   plataforma** (recurso pago), não uma limitação de nuvem em geral.
   Em código próprio, autenticação é gratuita — então hospedar na
   nuvem com login real resolve a segurança de forma melhor do que o
   offline resolvia, e ainda deixa o caminho aberto para uso
   multiusuário se a empresa decidir expandir no futuro.

**Conclusão:** Next.js + Supabase + Vercel, com autenticação
obrigatória desde o primeiro deploy.

## Decisão: sem cálculo de horas extras/banco de horas
Confirmado com o usuário: a empresa não contabiliza horas extras nem
desconta horas não trabalhadas — modelo flexível, baseado em confiança
e entrega. O sistema não precisa (e não deve) implementar esse
cálculo.

## Decisão: o sistema não é o arquivo oficial de registros
O arquivo legal/oficial da folha de ponto é o papel impresso e
assinado, guardado em pasta suspensa por funcionário. O sistema serve
só para **facilitar o registro e gerar o PDF** — não é o repositório
de longo prazo dos dados. Por isso, backup é sobre não perder dados
*antes* da impressão mensal, não sobre retenção histórica de anos.

## Decisão: contas pessoais em vez de contas da empresa
Supabase, Vercel e GitHub deste projeto estão todos numa conta
pessoal do usuário, não em contas da empresa — escolha intencional,
não descuido. Motivo: se o usuário sair do emprego, o projeto (código
+ banco de dados) migra com ele sem depender de pedir acesso ou
transferência a ninguém. Migração nesse cenário seria só técnica:
exportar o banco Postgres (backup/pg_dump pelo Supabase) e reconectar
o repositório GitHub numa conta nova — sem barreira organizacional,
porque a base já é pessoal desde o início.

## Decisão: sem tela de cadastro público (login-only)
A tela de login não tem opção de criar conta — de propósito. Novas
contas de acesso (ex: uma segunda pessoa de confiança batendo ponto)
são criadas manualmente pelo painel do Supabase (Authentication ->
Users -> Add user), nunca por um formulário público no app. Evita que
qualquer pessoa com o link se autocadastre e acesse dados de todos os
funcionários — o mesmo tipo de exposição que existia no AppSheet
antigo, agora fechada por design.

Importante: contas criadas assim têm acesso a tudo (não há separação
por colaborador ainda). Login individual por funcionário (cada um
vendo só o próprio ponto) é a expansão multiusuário da fase futura
mencionada acima — exigiria vincular cada conta a um colaborador_id e
aplicar RLS por usuário, o que não está implementado hoje.
