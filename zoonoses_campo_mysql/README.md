# Zoonoses+ Vigilância e trabalho de campo em MySQL

Projeto acadêmico independente: **14 tabelas, 513 registros fictícios e 15 consultas**. O foco é solicitação, ocorrência, rota, visita e tentativa de campo. A versão anterior zoonoses_academico permanece preservada.

Integrante 1: ____________________  
Integrante 2: ____________________  
Docente: ____________________  
Curso: Engenharia da Computação — AFYA Centro Universitário  
Disciplina: Banco de Dados  
Semestre: confirmar (enunciado 1/2026; referência 2/2026).

## Comece por aqui

1. Leia o [relatório completo](RELATORIO.md), da introdução às considerações finais.
2. Monte o DER pelo [guia manual Draw.io](GUIA_DRAWIO.md) ou abra o [arquivo editável](diagramas/zoonoses_campo_revisado.drawio).
3. Execute os scripts conforme [EXECUCAO_MYSQL.md](EXECUCAO_MYSQL.md).
4. Confira [VALIDACAO.md](VALIDACAO.md) e ensaie com [APRESENTACAO_ESTUDO.md](APRESENTACAO_ESTUDO.md).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| sql/01_criacao_povoamento.sql | Banco, 14 tabelas e INSERTs explícitos |
| sql/02_consultas.sql | 15 consultas comentadas |
| sql/03_verificacao.sql | Contagens, restrições e 15 verificações de coerência |
| sql/04_testes_restricoes.sql | 9 rejeições esperadas e teste de padrões, por blocos |
| RELATORIO.md | Relatório com dicionário, catálogo e imagem incorporados |
| DICIONARIO.md | Todos os campos, tipos, restrições e significados |
| REGRAS_NEGOCIO.md | 24 regras numeradas e alcance da integridade |
| NORMALIZACAO.md | Dependências e decomposição até 3FN |
| CATALOGO_CONSULTAS.md | SQL, perguntas, exemplos e interpretação |
| GUIA_DRAWIO.md | Passo a passo manual, campos e relações exatas |
| diagramas/ | PNG, SVG e .drawio editável |
| resultados/ | 15 CSVs de resultados esperados auxiliares |
| FONTES_E_ESCOPO.md | Referências e diferenças do aplicativo/PDF |
| MATRIZ_REQUISITOS.md | Correspondência com enunciado e pendências |

## Limites e pendências

Use MySQL 8.0.16 ou superior, preferencialmente 8.4. O banco criado é **zoonoses_campo_mysql**. O script não apaga bancos e exige nome ainda não existente. Não é migração de produção.

**Não houve execução em MySQL nesta preparação.** A conferência auxiliar passou, mas não substitui o motor exigido. Os scripts do projeto são SQL puro e não dependem de linguagem adicional.

O PDF cita Luis Henrique Souza e Samuel Amaral, nomes finais a confirmar. O enunciado informa 02/07/2026, data passada: confirme calendário e aprovação do tema. A publicação pública no GitHub e envio do link ainda dependem da dupla. Nada foi publicado nem enviado ao docente.

## Revisão de 05/11/2026

Entrega reconferida; estrutura de 14 tabelas e 513 registros preservada. O guia de execução e o relatório agora orientam verificar nome disponível e testar a parada por erro antes da criação. A busca local não encontrou um motor MySQL disponível; execução no MySQL segue pendente. Veja [conferência da entrega](CONFERENCIA_ENTREGA.md).

## Diagrama corrigido em 05/11/2026

Abra [zoonoses_campo_revisado.drawio](diagramas/zoonoses_campo_revisado.drawio). As quatro páginas agora usam cabeçalho e células separadas nas colunas Chave, Atributo e Tipo. SQL, campos, tipos e relações permanecem iguais. Veja [conferência visual](diagramas/conferencia_editor/VALIDACAO_DIAGRAMA.md).

Atualização do estado do banco informada no chat: MySQL 8.0.46 instalado; imagens confirmaram 14 tabelas/513 registros e rejeições T01–T03. Os demais testes e contagens posteriores foram relatados pelo usuário, sem verificação individual nesta revisão do diagrama. As notas anteriores sobre ausência de MySQL descrevem a busca feita antes dessa atualização.
