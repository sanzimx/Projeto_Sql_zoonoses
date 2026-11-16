# Zoonoses+ — projeto acadêmico MySQL

Modelo relacional com **14 tabelas, 513 registros fictícios e 15 consultas**.

## Documentação

- [Relatório completo](RELATORIO.md)
- [Execução dos scripts](EXECUCAO_MYSQL.md)
- [Dicionário de dados](DICIONARIO.md)
- [Regras de negócio](REGRAS_NEGOCIO.md)
- [Normalização até 3FN](NORMALIZACAO.md)
- [Catálogo de consultas](CATALOGO_CONSULTAS.md)
- [Matriz de requisitos](MATRIZ_REQUISITOS.md)
- [Validação](VALIDACAO.md)
- [Roteiro de apresentação](APRESENTACAO_ESTUDO.md)
- [Fontes e escopo](FONTES_E_ESCOPO.md)

## Diagramas

Abra [DER.drawio](diagramas/DER.drawio) e [DER_complementar.drawio](diagramas/DER_complementar.drawio) no Draw.io. As imagens dos módulos ficam em diagramas/. O [guia de modelagem](GUIA_DRAWIO.md) descreve entidades e relações.

## SQL

1. sql/01_criacao_povoamento.sql — criação e carga inicial, somente em banco novo.
2. sql/02_consultas.sql — consultas Q01–Q15.
3. sql/03_verificacao.sql — contagens e consistência.
4. sql/04_testes_restricoes.sql — testes com erros esperados, conforme o guia de execução.

Os CSVs em resultados/ registram os resultados esperados. A demonstração SQL foi executada em [MySQL 8.0.46](https://dbfiddle.uk/3TarkRBS?hide=131073). O protótipo hospedado usa MariaDB; consulte [hospedagem](../hospedagem/README.md).

Os integrantes e dados de identificação acadêmica devem ser preenchidos pela dupla antes da entrega.
