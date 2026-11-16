# Validação — 06/11/2026

Executados novamente: `npm.cmd test` (7 testes aprovados, incluindo modo local direto, CSRF/origem e preservação de caracteres especiais na configuração), `npm.cmd run build`, `npm.cmd run test:mysql` (12 grupos aprovados) e `node scripts/test-browser.cjs` (Chrome real headless, desktop 1440×1000 e móvel 390×844). Os resultados estruturados estão nesta pasta; capturas podem ser geradas pelos testes.

O teste MySQL confirma versão 8.0.46, massa inicial de 14 tabelas/513 registros, login/CSRF, cadastros, 15 relatórios, conversão, rota, tentativa sem acesso, revisão, retorno com inspeção, conclusão, concorrência e rollback. Ao final, as 15 consultas de coerência retornam vazias. O teste de navegador percorre as 14 telas de dados, cria/edita pessoa, busca, registra visita preventiva com inspeção, verifica histórico, exporta CSV e verifica navegação e largura móvel. O ciclo completo de revisão/retorno é coberto pela API; o navegador cobre o caminho de inspeção preventiva.

## Repetir sem tocar o banco pessoal

Os testes de integração exigem uma instância MySQL isolada na porta **3307**, com diretório de dados terminando em `zoonoses_prototipo_mysql/test-runtime/mysql-data/`. O script verifica porta e diretório, cria um banco novo com prefixo `zoonoses_campo_teste_` a cada execução e **não apaga bancos**. Nunca aponte esses testes para o banco de uso pessoal.

Esta máquina já possui a instância preparada. Suas credenciais ficam exclusivamente em `test-runtime/mysql-test-config.json`, ignorado pelo Git, com campos `rootPassword`, `appPassword` e `loginPassword`. O teste usa a primeira para criar um banco isolado e um usuário limitado; não usa a senha pessoal. O arquivo não acompanha uma distribuição pública. Em outra máquina, um administrador precisa preparar essa instância de teste antes de executar a integração.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:mysql
```

A integração gera `test-runtime/.env.test` e `test-runtime/auth-test.json`. Para o teste visual, inicie em outro terminal, a partir da pasta do protótipo:

```powershell
node --env-file=test-runtime/.env.test server/index.mjs
```

Depois execute `node scripts/test-browser.cjs`. Ele acessa a porta 4310 e grava novos dados somente na instância de teste. Use uma execução do servidor carregada com o `.env.test` atual; reinicie o servidor de teste após repetir `test:mysql`. O script usa Playwright do runtime local do Codex e Chrome; em outra máquina defina `PLAYWRIGHT_PATH` para o pacote instalado e `CHROME_PATH` para o executável do Chrome. Não é requisito do usuário final ter Playwright.

As credenciais, dados da instância e logs em `test-runtime/` não devem ser versionados. A execução mantém bancos de teste para inspeção; não há limpeza destrutiva automática. As capturas documentam dados fictícios de teste, não o banco pessoal. A validação não certifica produção, segurança multiusuário ou dispositivos móveis físicos.

Atualização: o navegador agora testa acesso direto sem login e ausência do botão Sair. A integração MySQL mantém REQUIRE_LOGIN=1 apenas para também verificar o modo autenticado opcional. TEST_BASE_URL permite selecionar a porta da instância visual isolada; nesta revisão foi usada 4312, sem interromper processos existentes.
