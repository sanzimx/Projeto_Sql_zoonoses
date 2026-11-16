-- Somente leitura. Cada consulta V deve retornar ZERO linhas na massa original.
USE zoonoses_campo_mysql;
SELECT VERSION() AS versao, @@sql_mode AS modo_sql;
SELECT 'municipio' AS tabela, COUNT(*) AS registros, 15 AS esperado FROM municipio
UNION ALL
SELECT 'pessoa' AS tabela, COUNT(*) AS registros, 40 AS esperado FROM pessoa
UNION ALL
SELECT 'profissional' AS tabela, COUNT(*) AS registros, 15 AS esperado FROM profissional
UNION ALL
SELECT 'profissional_municipio' AS tabela, COUNT(*) AS registros, 76 AS esperado FROM profissional_municipio
UNION ALL
SELECT 'bairro' AS tabela, COUNT(*) AS registros, 30 AS esperado FROM bairro
UNION ALL
SELECT 'imovel' AS tabela, COUNT(*) AS registros, 40 AS esperado FROM imovel
UNION ALL
SELECT 'solicitacao' AS tabela, COUNT(*) AS registros, 35 AS esperado FROM solicitacao
UNION ALL
SELECT 'ocorrencia' AS tabela, COUNT(*) AS registros, 30 AS esperado FROM ocorrencia
UNION ALL
SELECT 'rota' AS tabela, COUNT(*) AS registros, 25 AS esperado FROM rota
UNION ALL
SELECT 'visita' AS tabela, COUNT(*) AS registros, 45 AS esperado FROM visita
UNION ALL
SELECT 'ficha_visita' AS tabela, COUNT(*) AS registros, 50 AS esperado FROM ficha_visita
UNION ALL
SELECT 'tipo_deposito' AS tabela, COUNT(*) AS registros, 15 AS esperado FROM tipo_deposito
UNION ALL
SELECT 'inspecao_deposito' AS tabela, COUNT(*) AS registros, 82 AS esperado FROM inspecao_deposito
UNION ALL
SELECT 'revisao_ficha' AS tabela, COUNT(*) AS registros, 15 AS esperado FROM revisao_ficha;

SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='zoonoses_campo_mysql' ORDER BY TABLE_NAME, CONSTRAINT_TYPE;


-- V01: Conversões sem correspondência coerente
SELECT s.id_solicitacao FROM solicitacao s LEFT JOIN ocorrencia o ON o.id_solicitacao=s.id_solicitacao WHERE (s.situacao='Convertida' AND o.id_ocorrencia IS NULL) OR (s.situacao<>'Convertida' AND o.id_ocorrencia IS NOT NULL);

-- V02: Abertura anterior à análise da solicitação
SELECT o.id_ocorrencia FROM ocorrencia o INNER JOIN solicitacao s ON s.id_solicitacao=o.id_solicitacao WHERE o.aberta_em<s.analisada_em;

-- V03: Visitas anteriores à abertura do caso
SELECT v.id_visita FROM visita v INNER JOIN ocorrencia o ON o.id_ocorrencia=v.id_ocorrencia WHERE v.criada_em<o.aberta_em;

-- V04: Tentativas anteriores à criação da visita
SELECT f.id_ficha FROM ficha_visita f INNER JOIN visita v ON v.id_visita=f.id_visita WHERE f.entrada_em<v.criada_em;

-- V05: Numeração de tentativas com lacunas
SELECT id_visita FROM ficha_visita GROUP BY id_visita HAVING MIN(numero_tentativa)<>1 OR MAX(numero_tentativa)<>COUNT(*);

-- V06: Inspeção atribuída a tentativa sem acesso
SELECT d.id_ficha FROM inspecao_deposito d INNER JOIN ficha_visita f ON f.id_ficha=d.id_ficha WHERE f.resultado<>'Inspecionada';

-- V07: Revisão anterior à saída ou de ficha inspecionada
SELECT r.id_ficha FROM revisao_ficha r INNER JOIN ficha_visita f ON f.id_ficha=r.id_ficha WHERE r.revisada_em<f.saida_em OR f.resultado='Inspecionada';

-- V08: Revisão por função inadequada ou pelo próprio executor
SELECT r.id_ficha FROM revisao_ficha r INNER JOIN profissional p ON p.id_profissional=r.id_revisor INNER JOIN ficha_visita f ON f.id_ficha=r.id_ficha WHERE p.cargo NOT IN ('Supervisor','Administrador') OR r.id_revisor=f.id_executor;

-- V09: Tentativas sobrepostas ou fora da sequência
SELECT f.id_ficha FROM ficha_visita f INNER JOIN ficha_visita anterior ON anterior.id_visita=f.id_visita AND anterior.numero_tentativa=f.numero_tentativa-1 WHERE f.entrada_em<=anterior.saida_em;

-- V10: Retentativa sem revisão anterior autorizando retorno
SELECT f.id_ficha FROM ficha_visita f INNER JOIN ficha_visita anterior ON anterior.id_visita=f.id_visita AND anterior.numero_tentativa=f.numero_tentativa-1 LEFT JOIN revisao_ficha r ON r.id_ficha=anterior.id_ficha WHERE r.id_ficha IS NULL OR r.decisao<>'Retornar' OR r.revisada_em>f.entrada_em OR DATE(f.entrada_em)<r.retorno_previsto;

-- V11: Visita concluída sem última tentativa inspecionada
SELECT v.id_visita FROM visita v LEFT JOIN ficha_visita f ON f.id_visita=v.id_visita AND f.numero_tentativa=(SELECT MAX(x.numero_tentativa) FROM ficha_visita x WHERE x.id_visita=v.id_visita) WHERE v.situacao='Concluida' AND (f.id_ficha IS NULL OR f.resultado<>'Inspecionada');

-- V12: Visita arquivada sem decisão na última tentativa
SELECT v.id_visita FROM visita v LEFT JOIN ficha_visita f ON f.id_visita=v.id_visita AND f.numero_tentativa=(SELECT MAX(x.numero_tentativa) FROM ficha_visita x WHERE x.id_visita=v.id_visita) LEFT JOIN revisao_ficha r ON r.id_ficha=f.id_ficha WHERE v.situacao='Arquivada' AND (r.id_ficha IS NULL OR r.decisao<>'Arquivar');

-- V13: Executor sem vínculo territorial cadastrado
SELECT f.id_ficha FROM ficha_visita f INNER JOIN visita v ON v.id_visita=f.id_visita LEFT JOIN ocorrencia o ON o.id_ocorrencia=v.id_ocorrencia INNER JOIN imovel i ON i.id_imovel=COALESCE(o.id_imovel,v.id_imovel_preventivo) INNER JOIN bairro b ON b.id_bairro=i.id_bairro LEFT JOIN profissional_municipio pm ON pm.id_profissional=f.id_executor AND pm.id_municipio=b.id_municipio WHERE pm.id_profissional IS NULL OR pm.vinculado_em>DATE(f.entrada_em);

-- V14: Ocorrência concluída sem visita concluída
SELECT o.id_ocorrencia FROM ocorrencia o WHERE o.situacao='Concluida' AND NOT EXISTS (SELECT 1 FROM visita v WHERE v.id_ocorrencia=o.id_ocorrencia AND v.situacao='Concluida');

-- V15: Analista sem função de revisão
SELECT s.id_solicitacao FROM solicitacao s INNER JOIN profissional p ON p.id_profissional=s.id_analista WHERE p.cargo NOT IN ('Supervisor','Administrador');
