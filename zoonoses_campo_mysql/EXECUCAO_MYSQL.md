# Execução passo a passo no MySQL

## Preparar

1. Use uma instância de estudo do **MySQL 8.0.16 ou superior**, preferencialmente 8.4. Não use o Supabase/PostgreSQL do aplicativo. O projeto não precisa de site, Node ou Python para executar.
2. Abra o MySQL Workbench e uma conexão local. O Workbench é o cliente; um servidor deve estar disponível. Nenhum servidor foi instalado nesta preparação.
3. Em uma aba SQL, execute `SELECT VERSION(), @@sql_mode;` e registre a versão. Confirme que a conexão é de estudo. MariaDB ou SQLite não comprovam execução em MySQL.
4. A conta precisa de permissão para criar banco e tabelas. O nome novo é **zoonoses_campo_mysql**, separado de **zoonoses_academico**. Antes da criação, execute apenas a consulta de leitura abaixo:

```sql
SELECT SCHEMA_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'zoonoses_campo_mysql';
```

Se retornar uma linha, pare: esse nome já existe. Não execute o arquivo 01 nessa conexão. Use outra instância de estudo ou escolha outro nome e substitua todas as referências nos quatro scripts, inclusive o filtro CONSTRAINT_SCHEMA do arquivo 03. A consulta só mostra esquemas visíveis à conta; o CREATE DATABASE continua sendo a verificação definitiva.

No menu **Query**, habilite **Stop Script Execution On Errors** antes de executar o arquivo 01. Para conferir esse comportamento sem alterar dados, abra uma aba temporária e execute as duas instruções abaixo juntas. A primeira deve falhar; a segunda não deve produzir resultado:

```sql
SELECT 1 + ;
SELECT 'NAO_DEVE_EXECUTAR' AS teste_parada;
```

Se a segunda instrução executar, ajuste a opção de parada e repita o teste antes de prosseguir. Não basta o CREATE DATABASE falhar: um cliente que continua após erros pode executar o USE seguinte e atingir um banco já existente. Esse teste é de configuração do cliente e não faz parte dos nove testes de restrições.

## Criar e povoar

5. No Workbench, clique **File → Open SQL Script** (Arquivo → Abrir script SQL) e abra `sql/01_criacao_povoamento.sql`.
6. Após confirmar nome disponível e parada no primeiro erro, execute o arquivo completo sem selecionar apenas um trecho. Leia a área **Action Output** e não ignore erros.
7. O arquivo contém CREATE DATABASE, 14 CREATE TABLE e INSERT INTO explícitos. O povoamento usa START TRANSACTION e COMMIT. DDL faz commit implícito; falha na criação pode deixar parte do esquema criada.
8. Se um INSERT falhar, interrompa o processamento e execute ROLLBACK na mesma sessão se a transação ainda estiver aberta. Não continue até COMMIT ignorando erros. Não há manipulador automático de exceções no arquivo.
9. Atualize Schemas, expanda zoonoses_campo_mysql e confira suas tabelas. Execute `USE zoonoses_campo_mysql; SHOW TABLES;`.
10. A criação é para a primeira execução em banco vazio, não uma migração. Se o nome já existir, o CREATE DATABASE falha. Não apague bancos automaticamente. Para outro ensaio, use outra instância de estudo ou altere o nome de maneira consistente nos quatro arquivos.

## Conferir

11. Execute `sql/03_verificacao.sql`: contagens devem coincidir com VALIDACAO.md; V01–V15 devem retornar zero linhas. Nessas verificações, zero significa nenhuma inconsistência encontrada.
12. Abra `sql/02_consultas.sql` e execute Q01–Q15 selecionando um SELECT completo por vez. Todas retornam dados na massa original. Compare com CATALOGO_CONSULTAS.md e `resultados/Qxx_esperado.csv`.
13. Examine estruturas com `SHOW CREATE TABLE visita;`, `SHOW CREATE TABLE profissional;` e `SHOW CREATE TABLE inspecao_deposito;`.
14. Abra `sql/04_testes_restricoes.sql`. **Execute um bloco por vez, não o arquivo inteiro automaticamente.** T01–T09 devem gerar rejeições. Se o cliente parar no erro, execute manualmente o ROLLBACK correspondente. T10 verifica padrões e também termina em ROLLBACK.
15. Rode novamente 03_verificacao.sql para confirmar que a massa não mudou. Guarde versão, contagens, resultados e evidências dos erros reais antes de afirmar validação no MySQL.

## Cliente mysql como alternativa

O roteiro principal é o Workbench. Se usar o cliente mysql, faça primeiro as mesmas verificações de conexão de estudo e nome disponível. Execute o arquivo 01 em modo batch, sem --force. No Prompt de Comando do Windows (cmd.exe), a partir da pasta zoonoses_campo_mysql:

```bat
mysql --host=127.0.0.1 --port=3306 --user=SEU_USUARIO --password --default-character-set=utf8mb4 < sql\01_criacao_povoamento.sql
```

Substitua SEU_USUARIO e a porta pelos dados da instância local de estudo. A senha é solicitada pelo cliente; não a escreva na linha de comando. O redirecionamento `<` deste exemplo é do cmd.exe, não do PowerShell. Confira o resultado e o código de saída (`echo %ERRORLEVEL%`) antes de executar qualquer próximo arquivo. Só após sucesso, execute 03 e 02 da mesma maneira, trocando o caminho do arquivo.

Não use --force nem opções/configurações que mandem continuar após erros. Não execute o arquivo 04 em lote: seus erros são esperados e cada bloco precisa de ROLLBACK explícito. A alternativa com SOURCE foi retirada deste guia para evitar confundir execução interativa com a parada em erros do modo batch.

Referências: [parada por erro no Workbench](https://dev.mysql.com/doc/workbench/en/wb-sql-editor-main-menu.html) e [opções do cliente mysql](https://dev.mysql.com/doc/refman/8.4/en/mysql-command-options.html).

## Providências acadêmicas

Preencha nomes completos, docente e semestre após confirmação. O enunciado é de 1/2026 e informa 02/07/2026, enquanto o PDF cita 2/2026. Confirme o calendário e o tema com o docente. O PDF menciona Luis Henrique Souza e Samuel Amaral, mas isso não confirma a identificação final. O repositório público ainda precisa ser criado e enviado pela dupla após revisão; nada foi publicado.
