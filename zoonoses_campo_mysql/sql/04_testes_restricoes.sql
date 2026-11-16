-- NÃO executar o arquivo inteiro automaticamente.
-- Selecione UM bloco por vez no Workbench. Erro esperado; execute ROLLBACK manualmente se o cliente interromper.
-- Somente em banco de estudo. Não contém DDL.
USE zoonoses_campo_mysql;

-- T01: Pontuação fora do domínio. Esperado: rejeição por CHECK.
START TRANSACTION;
UPDATE ocorrencia SET pontuacao=101 WHERE id_ocorrencia=1;
ROLLBACK;

-- T02: Horários invertidos. Esperado: rejeição por CHECK.
START TRANSACTION;
UPDATE ficha_visita SET saida_em=entrada_em WHERE id_ficha=1;
ROLLBACK;

-- T03: Larvas acima do total. Esperado: rejeição por CHECK.
START TRANSACTION;
UPDATE inspecao_deposito SET quantidade_com_larvas=quantidade_inspecionada+1 WHERE id_ficha=2;
ROLLBACK;

-- T04: Dois alvos na mesma visita. Esperado: rejeição por CHECK.
START TRANSACTION;
UPDATE visita SET id_imovel_preventivo=1 WHERE id_visita=1;
ROLLBACK;

-- T05: Referência inexistente. Esperado: rejeição por FOREIGN KEY.
START TRANSACTION;
UPDATE imovel SET id_bairro=99999 WHERE id_imovel=1;
ROLLBACK;

-- T06: Email duplicado. Esperado: rejeição por UNIQUE.
START TRANSACTION;
UPDATE pessoa SET email='pessoa01@example.com' WHERE id_pessoa=2;
ROLLBACK;

-- T07: Segunda extensão profissional da mesma pessoa. Esperado: rejeição por PRIMARY KEY.
START TRANSACTION;
INSERT INTO profissional (id_profissional,matricula,cargo,admissao) VALUES (1,'FUNC-NOVO','Agente','2026-01-01');
ROLLBACK;

-- T08: Excluir município referenciado. Esperado: rejeição por RESTRICT.
START TRANSACTION;
DELETE FROM municipio WHERE id_municipio=1;
ROLLBACK;

-- T09: Descrição ausente. Esperado: rejeição por NOT NULL.
START TRANSACTION;
UPDATE ocorrencia SET descricao_tecnica=NULL WHERE id_ocorrencia=1;
ROLLBACK;

-- T10: defaults (esperado S e Planejada); desfazer ao final.
START TRANSACTION;
INSERT INTO profissional (id_profissional,matricula,cargo,admissao) VALUES (40,'FUNC-PROVISORIO','Agente','2026-01-01');
SELECT ativo FROM profissional WHERE id_profissional=40;
INSERT INTO rota (id_rota,codigo,id_profissional,data_rota) VALUES (99999,'ROT-PROVISORIA',40,'2026-07-01');
SELECT situacao,distancia_km FROM rota WHERE id_rota=99999;
ROLLBACK;
