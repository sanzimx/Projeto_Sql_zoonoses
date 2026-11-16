SET NAMES utf8mb4;
USE zoonoses_campo_mysql;

-- Q01 | Simples | Prioridade de casos abertos
-- Quais cinco casos abertos ou em acompanhamento têm maior pontuação?
SELECT protocolo, pontuacao, situacao
FROM ocorrencia
WHERE situacao IN ('Aberta', 'Em acompanhamento')
ORDER BY pontuacao DESC, aberta_em, id_ocorrencia
LIMIT 5;

-- Q02 | Simples | Busca de endereço
-- Quais imóveis têm logradouro iniciado por Rua S?
SELECT inscricao, logradouro, numero
FROM imovel
WHERE logradouro LIKE 'Rua S%'
ORDER BY logradouro, id_imovel;

-- Q03 | Simples | Tentativas no período
-- Quais tentativas começaram entre 5 e 10 de junho de 2026?
SELECT id_ficha, id_visita, numero_tentativa, entrada_em, resultado
FROM ficha_visita
WHERE entrada_em BETWEEN '2026-06-05 00:00:00' AND '2026-06-10 23:59:59'
ORDER BY entrada_em, id_ficha;

-- Q04 | Simples | Tipos de imóvel com contato
-- Quais tipos distintos de imóvel têm responsável conhecido?
SELECT DISTINCT tipo
FROM imovel
WHERE id_responsavel IS NOT NULL
ORDER BY tipo;

-- Q05 | Simples | Solicitações em triagem
-- Quais solicitações ainda aguardam análise?
SELECT protocolo, recebida_em, descricao
FROM solicitacao
WHERE situacao = 'Pendente'
ORDER BY recebida_em, id_solicitacao;

-- Q06 | INNER JOIN / 2 tabelas | Pessoas e atuação funcional
-- Quem são os profissionais ativos e quais suas funções?
SELECT p.id_pessoa, p.nome, f.matricula, f.cargo
FROM pessoa p
INNER JOIN profissional f ON f.id_profissional = p.id_pessoa
WHERE f.ativo = 'S'
ORDER BY p.id_pessoa;

-- Q07 | INNER JOIN / 2 tabelas | Casos recorrentes por imóvel
-- Quais imóveis têm mais de um caso e qual a pontuação média?
SELECT i.inscricao, COUNT(*) AS casos, ROUND(AVG(o.pontuacao), 2) AS pontuacao_media
FROM imovel i
INNER JOIN ocorrencia o ON o.id_imovel = i.id_imovel
GROUP BY i.id_imovel, i.inscricao
HAVING COUNT(*) > 1
ORDER BY casos DESC, i.id_imovel;

-- Q08 | INNER JOIN / 2 tabelas | Distâncias efetivamente registradas
-- Qual o total, média, menor e maior distância das rotas concluídas por profissional?
SELECT f.matricula, COUNT(*) AS rotas, SUM(r.distancia_km) AS km_total,
       ROUND(AVG(r.distancia_km), 2) AS km_medio, MIN(r.distancia_km) AS menor_km, MAX(r.distancia_km) AS maior_km
FROM profissional f
INNER JOIN rota r ON r.id_profissional = f.id_profissional
WHERE r.situacao = 'Concluida'
GROUP BY f.id_profissional, f.matricula
ORDER BY km_total DESC, f.id_profissional;

-- Q09 | INNER JOIN / 3 tabelas | Territórios por profissional
-- Quais municípios estão vinculados a cada profissional?
SELECT p.nome AS profissional, m.nome AS municipio, pm.vinculado_em
FROM pessoa p
INNER JOIN profissional_municipio pm ON pm.id_profissional = p.id_pessoa
INNER JOIN municipio m ON m.id_municipio = pm.id_municipio
ORDER BY p.id_pessoa, m.id_municipio;

-- Q10 | INNER JOIN / 3 tabelas | Depósitos e positividade observada
-- Quantos depósitos foram inspecionados, tinham larvas e foram eliminados por tipo?
SELECT t.nome, COUNT(DISTINCT f.id_ficha) AS tentativas,
       SUM(d.quantidade_inspecionada) AS inspecionados,
       SUM(d.quantidade_com_larvas) AS com_larvas, SUM(d.quantidade_eliminada) AS eliminados
FROM tipo_deposito t
INNER JOIN inspecao_deposito d ON d.id_tipo_deposito = t.id_tipo_deposito
INNER JOIN ficha_visita f ON f.id_ficha = d.id_ficha
WHERE f.resultado = 'Inspecionada'
GROUP BY t.id_tipo_deposito, t.nome
ORDER BY inspecionados DESC, t.id_tipo_deposito;

-- Q11 | Subconsulta | Pontuação acima da média
-- Quais casos possuem pontuação maior que a média de todos os casos?
SELECT protocolo, pontuacao, situacao
FROM ocorrencia
WHERE pontuacao > (SELECT AVG(pontuacao) FROM ocorrencia)
ORDER BY pontuacao DESC, id_ocorrencia;

-- Q12 | LEFT JOIN | Visitas sem tentativa
-- Quais tarefas ainda não possuem ficha de tentativa?
SELECT v.codigo, v.objetivo, v.situacao
FROM visita v
LEFT JOIN ficha_visita f ON f.id_visita = v.id_visita
WHERE f.id_ficha IS NULL
ORDER BY v.id_visita;

-- Q13 | LEFT JOIN | Rotas sem tarefas
-- Quais roteiros ainda não possuem visitas atribuídas?
SELECT r.codigo, r.data_rota, r.situacao
FROM rota r
LEFT JOIN visita v ON v.id_rota = r.id_rota
WHERE v.id_visita IS NULL
ORDER BY r.data_rota, r.id_rota;

-- Q14 | INNER JOIN / 3 tabelas | Revisões e encaminhamentos
-- Quais tentativas sem acesso foram revisadas e qual foi a decisão?
SELECT v.codigo, f.numero_tentativa, f.resultado, r.decisao, r.retorno_previsto
FROM visita v
INNER JOIN ficha_visita f ON f.id_visita = v.id_visita
INNER JOIN revisao_ficha r ON r.id_ficha = f.id_ficha
ORDER BY v.id_visita, f.numero_tentativa;

-- Q15 | LEFT JOIN / CASE / COALESCE | Imóvel efetivo da visita
-- Como localizar tanto visitas de ocorrência quanto visitas preventivas sem duplicar o imóvel?
SELECT v.codigo, CASE WHEN v.id_ocorrencia IS NULL THEN 'Preventiva' ELSE 'Ocorrencia' END AS origem,
       i.inscricao, b.nome AS bairro
FROM visita v
LEFT JOIN ocorrencia o ON o.id_ocorrencia = v.id_ocorrencia
INNER JOIN imovel i ON i.id_imovel = COALESCE(o.id_imovel, v.id_imovel_preventivo)
INNER JOIN bairro b ON b.id_bairro = i.id_bairro
ORDER BY v.id_visita;
