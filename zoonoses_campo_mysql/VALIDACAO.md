# Validação realizada e limites

**Atualização posterior à conferência inicial:** o diagrama foi corrigido e validado no Draw.io real em 05/11/2026. Veja [diagramas editáveis](diagramas/DER.drawio). O chat também informa MySQL 8.0.46 instalado, carga de 14 tabelas/513 registros e imagens dos testes T01–T03; os demais testes foram relatados pelo usuário. As notas abaixo sobre ausência do motor e ausência de abertura no editor são registros anteriores a essas atualizações.

Data: 27/10/2026.

**MySQL não executado.** Não foram localizados mysql, mysqld ou Docker no PATH, serviço MySQL/MariaDB na consulta de serviços ou instalação nas pastas usuais verificadas. Isso não prova ausência de qualquer instalação ou servidor remoto. Não houve instalação nem acesso ao banco de produção.

A conferência usou SQLite em memória, convertendo INT AUTO_INCREMENT PRIMARY KEY para INTEGER PRIMARY KEY e removendo ENGINE=InnoDB. A criação/seleção do banco MySQL foi tratada fora do teste auxiliar. FKs permaneceram habilitadas. O teste não certifica collation, DECIMAL, permissões, sintaxe exclusiva ou transações do MySQL.

| Tabela | Registros |
|---|---|
| municipio | 15 |
| pessoa | 40 |
| profissional | 15 |
| profissional_municipio | 76 |
| bairro | 30 |
| imovel | 40 |
| solicitacao | 35 |
| ocorrencia | 30 |
| rota | 25 |
| visita | 45 |
| ficha_visita | 50 |
| revisao_ficha | 15 |
| tipo_deposito | 15 |
| inspecao_deposito | 82 |

**Total: 513 registros.**

- Todos os INSERTs foram aceitos; nenhuma tabela abaixo de 15 registros.
- PRAGMA foreign_key_check não apontou referências inválidas.
- As 15 consultas de negócio retornaram linhas.
- V01–V15 retornaram zero linhas.
- Os nove testes negativos foram rejeitados e revertidos em savepoints.
- Os padrões S em profissional e Planejada em rota foram confirmados e revertidos.

| Consulta | Linhas |
|---|---|
| Q01 | 5 |
| Q02 | 13 |
| Q03 | 17 |
| Q04 | 5 |
| Q05 | 10 |
| Q06 | 15 |
| Q07 | 10 |
| Q08 | 15 |
| Q09 | 76 |
| Q10 | 15 |
| Q11 | 15 |
| Q12 | 5 |
| Q13 | 5 |
| Q14 | 15 |
| Q15 | 45 |

## Erros observados no teste auxiliar

| Teste | Erro SQLite |
|---|---|
| Pontuação fora do domínio | CHECK constraint failed: pontuacao BETWEEN 0 AND 100 |
| Horários invertidos | CHECK constraint failed: ck_ficha_horario |
| Larvas acima do total | CHECK constraint failed: ck_inspecao_limites |
| Dois alvos na mesma visita | CHECK constraint failed: ck_visita_alvo |
| Referência inexistente | FOREIGN KEY constraint failed |
| Email duplicado | UNIQUE constraint failed: pessoa.email |
| Segunda extensão profissional da mesma pessoa | UNIQUE constraint failed: profissional.id_profissional |
| Excluir município referenciado | FOREIGN KEY constraint failed |
| Descrição ausente | NOT NULL constraint failed: ocorrencia.descricao_tecnica |

Não apresentar esses erros como códigos do MySQL. Repita os scripts 03 e 04 no motor obrigatório e registre a versão. As consultas V detectam inconsistências, não impedem gravações. Não existem gatilhos de transição ou autorização.

As FKs declaram ON UPDATE RESTRICT e ON DELETE RESTRICT, evitando cascatas sobre campos usados nos CHECKs. Datas são fixas, com referência operacional em 30/06/2026, para resultados reproduzíveis. Os CSVs são exemplos calculados, não exportações de MySQL.

## Revisão de 05/11/2026

A nova busca não localizou mysql, mysqld, mariadb ou docker no PATH; nenhum serviço com nome/descrição MySQL ou MariaDB; nem processos mysqld, mariadbd ou MySQLWorkbench em execução. Também não foram encontradas as pastas C:\Program Files\MySQL, C:\Program Files (x86)\MySQL, C:\xampp\mysql\bin ou C:\Program Files\MariaDB. Isso não exclui uma instalação em outro caminho ou um servidor remoto. Nenhum servidor foi acessado, instalado ou configurado.

O teste auxiliar em SQLite foi repetido a partir dos SQLs entregues: 14 tabelas, 513 registros, 15 consultas iguais aos CSVs, 15 verificações sem inconsistências, nove rejeições esperadas e dois valores padrão confirmados. Os testes foram revertidos, sem alteração da massa.

Foi corrigida uma lacuna no guia de execução: conferir previamente o nome do banco e habilitar/testar a parada no primeiro erro antes do script de criação. A alternativa de terminal agora usa modo batch. O relatório incorpora as mesmas instruções. Os arquivos SQL 01 e 04 tiveram apenas comentários ajustados; comandos, estrutura e dados permanecem iguais aos da entrega anterior.

O guia Draw.io foi conferido contra os nomes e a quantidade de campos das 14 tabelas. O editável tem quatro páginas com 21/6/12/6 ligações e não foi aberto no editor nesta revisão. Não foram encontradas divergências que exigissem alterar o guia ou os diagramas. Os arquivos do projeto antigo continuam idênticos ao ZIP original.

**MySQL segue não executado.** Próximo passo: disponibilizar uma instância local de estudo MySQL 8.0.16+ e seguir EXECUCAO_MYSQL.md. Não é necessário fornecer senha nesta documentação. Os resultados auxiliares não substituem a validação no MySQL.

## Protótipo funcional e teste isolado — 06/11/2026

O protótipo em ../zoonoses_prototipo_mysql foi validado em MySQL 8.0.46 isolado, porta 3307. O teste confirmou massa inicial de 14 tabelas e 513 registros; executou o ciclo solicitação, ocorrência, rota, visita sem acesso, revisão, retorno com inspeção e conclusão; verificou transações, concorrência, autenticação e as 15 consultas de coerência vazias ao final. Evidência: ../zoonoses_prototipo_mysql/docs/resultado-testes-mysql.json. Isso complementa os testes auxiliares históricos acima, sem representar acesso independente ao banco pessoal na porta 3306. O schema acadêmico foi preservado.
