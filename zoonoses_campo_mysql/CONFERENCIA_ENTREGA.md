# Conferência final da entrega

**Atualização posterior à conferência inicial:** o diagrama foi corrigido e validado no Draw.io real em 05/11/2026. Veja [evidências da revisão visual](diagramas/conferencia_editor/VALIDACAO_DIAGRAMA.md). O chat também informa MySQL 8.0.46 instalado, carga de 14 tabelas/513 registros e imagens dos testes T01–T03; os demais testes foram relatados pelo usuário. As notas abaixo sobre ausência do motor e ausência de abertura no editor são registros anteriores a essas atualizações.

Conferência em 27/10/2026 a partir dos arquivos entregues.

- 14 tabelas e 513 registros fictícios; todas as tabelas têm pelo menos 15 registros.
- Carga SQL adaptada para SQLite em memória, com referências habilitadas, sem referências inválidas.
- As 15 consultas produziram os resultados dos 15 CSVs; o SQL das consultas está também no relatório.
- As 15 verificações de coerência retornaram zero linhas no teste auxiliar.
- Todos os links locais dos documentos foram conferidos.
- Arquivo Draw.io conferido estruturalmente: quatro páginas com 21, 6, 12 e 6 relações respectivamente. Não foi validado por abertura no editor Draw.io.
- Imagens dos diagramas inspecionadas visualmente.
- Arquivos da versão antiga comparados byte a byte com o ZIP original, sem alterações.

A execução no MySQL continua pendente. O teste auxiliar não certifica comportamento, sintaxe específica, collation ou transações do MySQL. Siga EXECUCAO_MYSQL.md para a validação no motor exigido.

A entrega mantém 14 tabelas. As quatro tabelas adicionais sugeridas na conversa são propostas futuras e não foram incorporadas a esta versão.

## Revisão de 05/11/2026

A nova busca não localizou mysql, mysqld, mariadb ou docker no PATH; nenhum serviço com nome/descrição MySQL ou MariaDB; nem processos mysqld, mariadbd ou MySQLWorkbench em execução. Também não foram encontradas as pastas C:\Program Files\MySQL, C:\Program Files (x86)\MySQL, C:\xampp\mysql\bin ou C:\Program Files\MariaDB. Isso não exclui uma instalação em outro caminho ou um servidor remoto. Nenhum servidor foi acessado, instalado ou configurado.

O teste auxiliar em SQLite foi repetido a partir dos SQLs entregues: 14 tabelas, 513 registros, 15 consultas iguais aos CSVs, 15 verificações sem inconsistências, nove rejeições esperadas e dois valores padrão confirmados. Os testes foram revertidos, sem alteração da massa.

Foi corrigida uma lacuna no guia de execução: conferir previamente o nome do banco e habilitar/testar a parada no primeiro erro antes do script de criação. A alternativa de terminal agora usa modo batch. O relatório incorpora as mesmas instruções. Os arquivos SQL 01 e 04 tiveram apenas comentários ajustados; comandos, estrutura e dados permanecem iguais aos da entrega anterior.

O guia Draw.io foi conferido contra os nomes e a quantidade de campos das 14 tabelas. O editável tem quatro páginas com 21/6/12/6 ligações e não foi aberto no editor nesta revisão. Não foram encontradas divergências que exigissem alterar o guia ou os diagramas. Os arquivos do projeto antigo continuam idênticos ao ZIP original.

**MySQL segue não executado.** Próximo passo: disponibilizar uma instância local de estudo MySQL 8.0.16+ e seguir EXECUCAO_MYSQL.md. Não é necessário fornecer senha nesta documentação. Os resultados auxiliares não substituem a validação no MySQL.
