# Consultas de zoonoses online

Abra: https://dbfiddle.uk/3TarkRBS?hide=131073

O banco e as 15 consultas já estão carregados. Você precisa apenas de um navegador e internet, inclusive em outro computador. Não precisa instalar MySQL nem baixar o banco.

## Como executar

1. Abra o link acima. As opções no topo já estarão em **MySQL** e **8.0**.
2. Clique em **run**, no topo da página, e aguarde os resultados.
3. Role a página: cada consulta Q01 a Q15 tem seu resultado logo abaixo.
4. Para experimentar uma alteração, edite o SQL no bloco da consulta e clique novamente em **run**. Esse botão executa os blocos em sequência, incluindo a preparação do banco.
5. Se quiser guardar a versão alterada, copie o endereço que aparecer após a execução. Guarde também o link original acima para voltar à versão preparada.

Abrir o link mostra os resultados salvos; clicar em **run** executa o SQL. Cada execução recria o banco a partir do script: alterações nos dados precisam estar nos comandos para serem repetidas.

O primeiro bloco, que cria e preenche as tabelas, está recolhido para facilitar a apresentação. Não o apague. O último bloco contém as verificações e também está recolhido. Para ver todo o script, abra https://dbfiddle.uk/3TarkRBS sem o parâmetro final.

## Para apresentar

- Comece pela conferência das tabelas e registros.
- Mostre as consultas Q01 a Q10 e explique o que cada uma busca.
- Use as consultas adicionais conforme o tempo disponível.
- Para ampliar no datashow, use Ctrl e + no navegador; Ctrl e 0 restaura o tamanho.
- Teste a internet do local antes. Os arquivos SQL desta pasta são uma cópia de reserva, mas a execução online depende de internet.

## Scripts

- [Preparar banco online](01_preparar_banco_online.sql): cria e preenche tabelas em um banco vazio já selecionado.
- [Consultas](../zoonoses_campo_mysql/sql/02_consultas.sql) e [verificação](../zoonoses_campo_mysql/sql/03_verificacao.sql): versões principais. Para outro nome de banco, adapte o comando USE antes de executar.

Conferido em MySQL 8.0.46: 14 tabelas, 513 registros iniciais e 15 consultas executadas. As 15 verificações de inconsistência retornaram vazias, como esperado.
