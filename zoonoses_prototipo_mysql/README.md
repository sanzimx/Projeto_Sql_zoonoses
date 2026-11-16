# Zoonoses+ — protótipo local MySQL

Aplicação funcional de vigilância em campo, adaptada da referência local do projeto `sanzimx/zoonoses`. React/Vite, Express e MySQL real. Preserva as **14 tabelas** do projeto acadêmico em `../zoonoses_campo_mysql`. Não usa Supabase nem dados simulados como backend.

## Iniciar no Windows

1. Tenha Node.js 22.12 ou superior e MySQL 8.0.16 ou superior. O banco `zoonoses_campo_mysql` deve estar criado com o SQL acadêmico. Se já executou os scripts, **não execute a criação novamente**.
2. Abra **INICIAR.cmd** nesta pasta. Na primeira execução ele instala as dependências e abre o assistente de configuração.
3. Informe porta, usuário e senha do seu MySQL local. O assistente verifica as 14 tabelas, sem criar, apagar ou povoar banco. Use o nome `zoonoses_campo_mysql`; não use `zoonoses_academico`.
4. Após conferir as 14 tabelas, o assistente salva a conexão e preserva o modo de acesso existente. Não solicita outra senha da aplicação.
5. O navegador abre http://127.0.0.1:4310. No modo autenticado, entre com sua conta local; no modo direto, o painel abre sem login. Mantenha a janela do servidor aberta; Ctrl+C encerra o aplicativo.

Alternativa pelo PowerShell, dentro desta pasta:

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run build
npm.cmd start
```

Para reconfigurar, execute `npm.cmd run setup`. A senha deve ser digitada no computador, nunca enviada no chat. `.env` guarda a conexão local e está ignorado pelo Git. No modo autenticado, `data/auth.json` contém somente o hash com sal da senha e também é ignorado pelo Git. Faça backup desses arquivos de forma privada se necessário. O modelo `.env.example` não contém credenciais. O assistente não altera a senha do MySQL.

O usuário MySQL da aplicação precisa somente de SELECT, INSERT, UPDATE e DELETE no banco acadêmico. A criação de uma conta dedicada pode ser feita pelo administrador no Workbench. O aplicativo não precisa de CREATE, DROP ou privilégios em outros bancos.

## Percorrer o fluxo

1. Confira municípios, bairros, imóveis, pessoas, profissionais e áreas de atuação. Profissional reutiliza a pessoa existente; os vínculos territoriais são necessários para trabalhar no município.
2. Em **Solicitações**, cadastre a demanda e use a ação de análise para indeferir ou converter em ocorrência, indicando um supervisor/administrador ativo.
3. Em **Rotas do dia**, crie uma rota planejada. Em **Visitas técnicas**, crie uma visita com exatamente um alvo: ocorrência ou imóvel preventivo. Agende na rota de profissional vinculado ao território, com ordem livre.
4. Use **Registrar tentativa** na visita. Informe executor, entrada, saída, resultado e observações. A saída deve ser posterior à entrada e não pode estar no futuro. Para uma inspeção, acrescente tipos de depósito, quantidades e ação realizada.
5. Uma tentativa sem acesso aguarda **Revisão**. Um supervisor/administrador diferente do executor, vinculado ao território, pode arquivar ou autorizar retorno com data. O retorno gera a próxima ficha numerada na mesma visita.
6. Após inspecionar, a visita fica concluída. Conclua a ocorrência quando não houver visitas pendentes. Conclua a rota após haver tentativas no dia planejado e informe a distância.
7. Consulte **Histórico** da visita, o painel e os **15 relatórios** com exportação CSV. Relatórios usam as consultas acadêmicas, incluindo seus períodos fixos; não são filtros dinâmicos de datas.

Fichas, inspeções e revisões são gravadas pelo fluxo, em transações; não permitem edição ou exclusão direta do histórico. Exclusões cadastrais respeitam referências. Estados, tentativas e combinações únicas são validados no servidor e no MySQL.

## Acesso e limites do recorte

Este é um aplicativo **local**. A distribuição abre diretamente por padrão; uma configuração pessoal com `REQUIRE_LOGIN=1` exige a conta de `data/auth.json`. Com `REQUIRE_LOGIN=0`, o acesso é direto. A proteção CSRF, a verificação de origem e o endereço restrito a 127.0.0.1 continuam ativos. Profissionais selecionados nos formulários são responsáveis registrados: o servidor verifica cargo, atividade e território, mas não há contas individuais por profissional nem prova de identidade de quem foi selecionado. Não é uma aplicação multiusuário com perfis independentes.

São 14 tabelas, sem laboratório, fotos, campanhas, mapas, offline ou sincronização. O modo autenticado usa sessão, proteção CSRF, limitação de tentativas e revogação no logout. Uma senha curta pode ser escolhida para este protótipo restrito ao computador local. A conta pessoal e sua senha não acompanham o ZIP. As transições são transacionais na API; alterações externas no Workbench podem contornar regras da aplicação. As 15 verificações SQL ajudam a detectar incoerências. O cadastro de consulta tem limite de 2.000 opções relacionadas, adequado à massa acadêmica. O servidor escuta apenas `127.0.0.1`; o teste móvel é de layout no navegador, não acesso pela rede do celular.

O usuário confirmou a conexão pessoal e as 14 tabelas pelo assistente. O executor não acessou o banco pessoal. Testes usaram MySQL isolado na porta 3307. O serviço MySQL80/3306 e Supabase não foram alterados. Nada foi publicado, enviado ao GitHub ou configurado em produção.

## Código e evidências

- `client/`: interface e estilo; `public/`: identidade visual reaproveitada.
- `server/`: API, acesso local, consultas parametrizadas e fluxos transacionais.
- `referencia/`: cópia de consulta do aplicativo original, não utilizada em execução nem compilada. Não execute seus scripts de publicação/sincronização para este protótipo.
- `docs/TESTES.md`: execução e limites dos testes.
- `docs/resultado-testes-mysql.json`, `docs/resultado-testes-browser.json` e `docs/capturas/`: evidências de 06/11/2026.
- `../zoonoses_campo_mysql/`: SQL, regras, dicionário e DER acadêmico.

Para desenvolvimento: `npm.cmd run dev`; a interface Vite usa a API local por proxy. Para uso normal, prefira INICIAR.cmd.

Se a porta 4310 estiver ocupada por uma execução de teste, encerre somente o processo do protótipo antes de iniciar sua configuração pessoal. Não encerre o serviço MySQL80. Erros de conexão devem ser resolvidos conferindo serviço, porta, usuário, senha e nome do banco; o painel informa a conexão MySQL quando recebe os dados reais.

Se o assistente antigo ainda estiver parado em 'Nome de acesso ao protótipo', pressione Ctrl+C e reabra INICIAR.cmd. A versão antiga só salvava a conexão depois da senha da aplicação: se não houver .env, será necessário informar os dados MySQL novamente apenas no terminal local.

Alterações em REQUIRE_LOGIN ou AUTH_FILE exigem reiniciar o servidor. Inicie pela pasta deste projeto com INICIAR.cmd para usar .env; uma execução de teste com .env.test utiliza outra configuração. O assistente preserva o modo e o caminho da conta ao reconfigurar o banco.
