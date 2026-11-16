# Zoonoses+ — Projeto de Banco de Dados

Projeto acadêmico com modelagem relacional, SQL para MySQL e protótipo de trabalho de campo. Todos os dados de exemplo são fictícios.

- [Protótipo online](https://zoonoses.alwaysdata.net/) — acesso de operador necessário; banco MariaDB.
- [Consultas em MySQL 8.0](https://phpmyadmin.alwaysdata.com/) — demonstração SQL independente do protótipo.

## Conteúdo

- [Projeto acadêmico](zoonoses_campo_mysql/README.md): relatório, dicionário, normalização, DER, scripts SQL e resultados esperados.
- [Código do protótipo](zoonoses_prototipo_mysql/README.md): interface React, servidor Express, conector mysql2 e testes.
- [Apresentação PowerPoint](apresentacao/Zoonoses_Apresentacao.pptx).
- [Consultas online](demonstracao_online/COMO_USAR.md).
- [Hospedagem e conexão local](hospedagem/README.md).

## Execução local

Usar Node.js 24. Na pasta zoonoses_prototipo_mysql, executar npm ci, configurar .env a partir de .env.example, executar npm run build e npm start. Acessar http://127.0.0.1:4310. O banco deve conter as tabelas do projeto; consultar as instruções SQL antes de importar.

Para a base acadêmica, seguir [EXECUCAO_MYSQL.md](zoonoses_campo_mysql/EXECUCAO_MYSQL.md). O trabalho original usa MySQL; a demonstração hospedada usa MariaDB.

## Validação

9 testes locais aprovados, interface compilada, conexão online validada com 14 tabelas e 513 registros. Os 15 relatórios foram executados na hospedagem.

## Publicação

O site é atualizado manualmente; um commit no GitHub não altera automaticamente a hospedagem. Credenciais, arquivos .env preenchidos, dados locais de autenticação e dependências instaladas não são versionados.
