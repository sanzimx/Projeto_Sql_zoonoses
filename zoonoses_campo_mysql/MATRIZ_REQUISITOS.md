# Matriz de requisitos

| Exigência | Evidência | Situação |
|---|---|---|
| Mínimo 10 tabelas solicitado | 14 CREATE TABLE | Preparado |
| 2 N:N | profissional_municipio; inspecao_deposito | Associações com PK composta |
| 4 ou mais 1:N | Município–Bairro, Bairro–Imóvel, Pessoa–Solicitação, Imóvel–Ocorrência, Visita–Ficha | Declarado por FK |
| 1:1 | Pessoa–Profissional e Ficha–Revisão | Participação 0..1 do lado pai |
| 3FN com decomposição | NORMALIZACAO.md | Dependências documentadas |
| PK/FK/NOT NULL/UNIQUE | DDL e dicionário | Todas as FKs com ON UPDATE/DELETE |
| CHECK em pelo menos 3 colunas | cargo, ativo, zona, tipo, pontuacao, numero_tentativa, contagens e estados | Supera o mínimo |
| DEFAULT em pelo menos 2 | uf, ativo, estados e contagens | Supera o mínimo |
| 15+ registros por tabela | 513 no total; mínimo 15 por tabela | Conferência auxiliar |
| 5 consultas simples | Q01–Q05 | Todos os operadores exigidos |
| 5 INNER JOIN | Q06–Q08 com 2 tabelas; Q09–Q10 com 3 | Mais Q14 complementar |
| COUNT/SUM/AVG/MAX/MIN/GROUP BY/HAVING | Q07–Q10 | Resultados significativos |
| Subquery e LEFT JOIN | Q11; Q12–Q13 e Q15 | Incluídos |
| E1 relatório completo | RELATORIO.md | Introdução até considerações finais |
| E2 DER imagem/editável | diagramas/der_completo.png e zoonoses_campo.drawio | Modelo baseado no DDL |
| E3 criação/povoamento | sql/01_criacao_povoamento.sql | SQL puro |
| E4 consultas separadas | sql/02_consultas.sql | 15 consultas |
| E5 dicionário | DICIONARIO.md e conteúdo incorporado no relatório | Todos os campos |
| E6 README | README.md | Identificação a confirmar |
| E7 GitHub público | Sem publicação | Pendente da dupla |
| Guia manual Draw.io | GUIA_DRAWIO.md | Campos e ligações exatos |
| Apresentação | APRESENTACAO_ESTUDO.md | 15 minutos, ambos falam |
| Validação MySQL | EXECUCAO_MYSQL.md e VALIDACAO.md | Pendente, sem alegação de execução |
| Tema/calendário | Enunciado informa 02/07/2026 | Confirmar com docente |
