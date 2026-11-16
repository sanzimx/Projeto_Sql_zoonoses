# Fontes e decisões de adaptação

## Materiais utilizados

1. **Projeto_Final_Banco_de_Dados (1).docx**: enunciado fornecido, lido integralmente. O mínimo original é 8 tabelas; o pedido atual exige pelo menos 10.
2. **Zoonoses+ — Projeto Final de Banco de Dados.pdf**: referência de 26 páginas, lida integralmente. Suas afirmações de execução MySQL não são evidência desta nova versão.
3. Código local consultado somente para leitura: `src/lib/navegacao.ts`; `src/components/campo/FichaTecnicaDialog.tsx`; migrations `20261022120000_solicitacoes_cidadaos.sql` e `20261022210000_trabalho_campo.sql`; referência territorial em `20261023160000_localidades_identificacao.sql`.
4. Revisão administrativa anterior do protótipo, recebida como contexto, com distinção entre solicitações, ocorrências, visitas, fichas e revisão.

Nenhuma credencial ou dado pessoal da produção foi copiado. O aplicativo e as fontes não foram alterados nem redistribuídos.

## Decisões em relação à referência

| Tema | Adaptação |
|---|---|
| Tecnologia | MySQL independente; app original PostgreSQL/Supabase. Não é migração de produção. |
| Equipe | Cadastro funcional de pessoas; sem grupos inventados nem equipe_agente. |
| Pessoas | Cadastro único e extensão Profissional para não duplicar cidadão/agente. |
| Solicitação | Relato com triagem, separado do caso técnico. |
| Visita/ficha | Tarefa com várias tentativas numeradas e revisão por tentativa. |
| Prevenção | Alvo exclusivo: ocorrência ou imóvel preventivo. |
| Rotas | Responsabilidade individual; não há regra de uma por equipe/data. |
| N:N | Profissional–Município e Ficha–TipoDeposito. |
| Larvas | Contagem direta de depósitos positivos, sem multiplicar quantidade por indicador booleano. |
| Catálogo | 15 recipientes/estruturas; não afirma reproduzir classificação oficial PNCD. |
| Encerramento | Sem tabela de parecer final de ocorrência; 1:1 por extensão profissional e revisão de ficha. |
| Integridade | CHECK valida linha; consultas entre tabelas detectam erros, não impõem transições. |
| Fora do recorte | Laboratório, armadilhas, fotos, campanhas, mapa, auditoria completa, autenticação e offline. |
| Consultas | 15 numeradas nesta versão. O PDF anuncia 14, mas apresenta Q01–Q13. |
| Nomes e semestre | Campos a confirmar: PDF cita Luis Henrique Souza, Samuel Amaral e 2/2026; enunciado cita 1/2026. |

## Referências oficiais

- Oracle. [MySQL 8.4 — CREATE TABLE](https://dev.mysql.com/doc/refman/8.4/en/create-table.html).
- Oracle. [MySQL 8.4 — FOREIGN KEY](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html).
- Oracle. [MySQL 8.4 — CHECK](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html).
- Oracle. [MySQL 8.4 — funções de agregação](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html).
- draw.io. [Notação pé de galinha](https://www.drawio.com/docs/tutorials/crows-foot-notation/).
- draw.io. [Formatos de exportação](https://www.drawio.com/docs/manual/export/export-diagram/).

Consulta documental em 27/10/2026. Assistência de IA utilizada na preparação e conferência. A dupla deve revisar e compreender cada comando, conforme permitido no enunciado.
