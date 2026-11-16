# Catálogo das 15 consultas

Q01–Q05 são simples; Q06–Q10 são os cinco INNER JOIN obrigatórios; Q11–Q15 complementam a análise. Os resultados são **esperados e conferidos em SQLite em memória**, não capturas do MySQL. A formatação decimal pode variar. NULL significa ausência de valor. Critérios de desempate tornam a ordem previsível.

## Q01 — Prioridade de casos abertos

**Pergunta:** Quais cinco casos abertos ou em acompanhamento têm maior pontuação?

**Recursos:** Simples.

```sql
SELECT protocolo, pontuacao, situacao
FROM ocorrencia
WHERE situacao IN ('Aberta', 'Em acompanhamento')
ORDER BY pontuacao DESC, aberta_em, id_ocorrencia
LIMIT 5;
```

Resultado completo: 5 linhas. Exemplo: primeiras 5.

| protocolo | pontuacao | situacao |
|---|---|---|
| OC-2026-0016 | 98 | Em acompanhamento |
| OC-2026-0021 | 93 | Em acompanhamento |
| OC-2026-0026 | 88 | Aberta |
| OC-2026-0020 | 80 | Em acompanhamento |
| OC-2026-0025 | 75 | Em acompanhamento |

## Q02 — Busca de endereço

**Pergunta:** Quais imóveis têm logradouro iniciado por Rua S?

**Recursos:** Simples.

```sql
SELECT inscricao, logradouro, numero
FROM imovel
WHERE logradouro LIKE 'Rua S%'
ORDER BY logradouro, id_imovel;
```

Resultado completo: 13 linhas. Exemplo: primeiras 5.

| inscricao | logradouro | numero |
|---|---|---|
| CAD-0006 | Rua Santa Clara | 62 |
| CAD-0012 | Rua Santa Clara | 104 |
| CAD-0018 | Rua Santa Clara | 146 |
| CAD-0024 | Rua Santa Clara | 188 |
| CAD-0030 | Rua Santa Clara | 230 |

## Q03 — Tentativas no período

**Pergunta:** Quais tentativas começaram entre 5 e 10 de junho de 2026?

**Recursos:** Simples.

```sql
SELECT id_ficha, id_visita, numero_tentativa, entrada_em, resultado
FROM ficha_visita
WHERE entrada_em BETWEEN '2026-06-05 00:00:00' AND '2026-06-10 23:59:59'
ORDER BY entrada_em, id_ficha;
```

Resultado completo: 17 linhas. Exemplo: primeiras 5.

| id_ficha | id_visita | numero_tentativa | entrada_em | resultado |
|---|---|---|---|---|
| 10 | 5 | 2 | 2026-06-05 09:00:00 | Inspecionada |
| 11 | 6 | 1 | 2026-06-05 09:00:00 | Ausente |
| 30 | 20 | 1 | 2026-06-05 11:00:00 | Inspecionada |
| 12 | 6 | 2 | 2026-06-06 09:00:00 | Inspecionada |
| 13 | 7 | 1 | 2026-06-06 09:00:00 | Fechado |

## Q04 — Tipos de imóvel com contato

**Pergunta:** Quais tipos distintos de imóvel têm responsável conhecido?

**Recursos:** Simples.

```sql
SELECT DISTINCT tipo
FROM imovel
WHERE id_responsavel IS NOT NULL
ORDER BY tipo;
```

Resultado completo: 5 linhas. Exemplo: primeiras 5.

| tipo |
|---|
| Comercial |
| Estrategico |
| Publico |
| Residencial |
| Terreno |

## Q05 — Solicitações em triagem

**Pergunta:** Quais solicitações ainda aguardam análise?

**Recursos:** Simples.

```sql
SELECT protocolo, recebida_em, descricao
FROM solicitacao
WHERE situacao = 'Pendente'
ORDER BY recebida_em, id_solicitacao;
```

Resultado completo: 10 linhas. Exemplo: primeiras 5.

| protocolo | recebida_em | descricao |
|---|---|---|
| SOL-2026-0029 | 2026-04-01 09:00:00 | Presenca de animal sinantropico no deposito. |
| SOL-2026-0030 | 2026-04-02 09:00:00 | Pedido de avaliacao ambiental do local. |
| SOL-2026-0021 | 2026-04-21 09:00:00 | Agua acumulada em recipientes no quintal. |
| SOL-2026-0022 | 2026-04-22 09:00:00 | Residuos expostos junto ao muro lateral. |
| SOL-2026-0023 | 2026-04-23 09:00:00 | Relato de insetos na area externa. |

## Q06 — Pessoas e atuação funcional

**Pergunta:** Quem são os profissionais ativos e quais suas funções?

**Recursos:** INNER JOIN / 2 tabelas.

```sql
SELECT p.id_pessoa, p.nome, f.matricula, f.cargo
FROM pessoa p
INNER JOIN profissional f ON f.id_profissional = p.id_pessoa
WHERE f.ativo = 'S'
ORDER BY p.id_pessoa;
```

Resultado completo: 15 linhas. Exemplo: primeiras 5.

| id_pessoa | nome | matricula | cargo |
|---|---|---|---|
| 1 | Ana Prado | FUNC-001 | Agente |
| 2 | Bruno Lima | FUNC-002 | Agente |
| 3 | Carla Mendes | FUNC-003 | Agente |
| 4 | Daniel Rocha | FUNC-004 | Agente |
| 5 | Elisa Costa | FUNC-005 | Agente |

## Q07 — Casos recorrentes por imóvel

**Pergunta:** Quais imóveis têm mais de um caso e qual a pontuação média?

**Recursos:** INNER JOIN / 2 tabelas.

```sql
SELECT i.inscricao, COUNT(*) AS casos, ROUND(AVG(o.pontuacao), 2) AS pontuacao_media
FROM imovel i
INNER JOIN ocorrencia o ON o.id_imovel = i.id_imovel
GROUP BY i.id_imovel, i.inscricao
HAVING COUNT(*) > 1
ORDER BY casos DESC, i.id_imovel;
```

Resultado completo: 10 linhas. Exemplo: primeiras 5.

| inscricao | casos | pontuacao_media |
|---|---|---|
| CAD-0001 | 2 | 68.0 |
| CAD-0002 | 2 | 46.0 |
| CAD-0003 | 2 | 59.0 |
| CAD-0004 | 2 | 72.0 |
| CAD-0005 | 2 | 85.0 |

## Q08 — Distâncias efetivamente registradas

**Pergunta:** Qual o total, média, menor e maior distância das rotas concluídas por profissional?

**Recursos:** INNER JOIN / 2 tabelas.

```sql
SELECT f.matricula, COUNT(*) AS rotas, SUM(r.distancia_km) AS km_total,
       ROUND(AVG(r.distancia_km), 2) AS km_medio, MIN(r.distancia_km) AS menor_km, MAX(r.distancia_km) AS maior_km
FROM profissional f
INNER JOIN rota r ON r.id_profissional = f.id_profissional
WHERE r.situacao = 'Concluida'
GROUP BY f.id_profissional, f.matricula
ORDER BY km_total DESC, f.id_profissional;
```

Resultado completo: 15 linhas. Exemplo: primeiras 5.

| matricula | rotas | km_total | km_medio | menor_km | maior_km |
|---|---|---|---|---|---|
| FUNC-005 | 2 | 23.5 | 11.75 | 11 | 12.5 |
| FUNC-004 | 2 | 20.1 | 10.05 | 9.3 | 10.8 |
| FUNC-003 | 2 | 16.7 | 8.35 | 7.6 | 9.1 |
| FUNC-002 | 2 | 13.3 | 6.65 | 5.9 | 7.4 |
| FUNC-010 | 1 | 12 | 12.0 | 12 | 12 |

## Q09 — Territórios por profissional

**Pergunta:** Quais municípios estão vinculados a cada profissional?

**Recursos:** INNER JOIN / 3 tabelas.

```sql
SELECT p.nome AS profissional, m.nome AS municipio, pm.vinculado_em
FROM pessoa p
INNER JOIN profissional_municipio pm ON pm.id_profissional = p.id_pessoa
INNER JOIN municipio m ON m.id_municipio = pm.id_municipio
ORDER BY p.id_pessoa, m.id_municipio;
```

Resultado completo: 76 linhas. Exemplo: primeiras 5.

| profissional | municipio | vinculado_em |
|---|---|---|
| Ana Prado | Montes Claros | 2026-03-02 |
| Ana Prado | Bocaiuva | 2026-03-02 |
| Bruno Lima | Bocaiuva | 2026-03-02 |
| Bruno Lima | Janauba | 2026-03-02 |
| Carla Mendes | Janauba | 2026-03-02 |

## Q10 — Depósitos e positividade observada

**Pergunta:** Quantos depósitos foram inspecionados, tinham larvas e foram eliminados por tipo?

**Recursos:** INNER JOIN / 3 tabelas.

```sql
SELECT t.nome, COUNT(DISTINCT f.id_ficha) AS tentativas,
       SUM(d.quantidade_inspecionada) AS inspecionados,
       SUM(d.quantidade_com_larvas) AS com_larvas, SUM(d.quantidade_eliminada) AS eliminados
FROM tipo_deposito t
INNER JOIN inspecao_deposito d ON d.id_tipo_deposito = t.id_tipo_deposito
INNER JOIN ficha_visita f ON f.id_ficha = d.id_ficha
WHERE f.resultado = 'Inspecionada'
GROUP BY t.id_tipo_deposito, t.nome
ORDER BY inspecionados DESC, t.id_tipo_deposito;
```

Resultado completo: 15 linhas. Exemplo: primeiras 5.

| nome | tentativas | inspecionados | com_larvas | eliminados |
|---|---|---|---|---|
| Cisterna | 8 | 33 | 9 | 0 |
| Lata | 8 | 32 | 9 | 8 |
| Calha | 6 | 28 | 6 | 0 |
| Bacia | 7 | 25 | 6 | 7 |
| Barril | 5 | 24 | 6 | 0 |

## Q11 — Pontuação acima da média

**Pergunta:** Quais casos possuem pontuação maior que a média de todos os casos?

**Recursos:** Subconsulta.

```sql
SELECT protocolo, pontuacao, situacao
FROM ocorrencia
WHERE pontuacao > (SELECT AVG(pontuacao) FROM ocorrencia)
ORDER BY pontuacao DESC, id_ocorrencia;
```

Resultado completo: 15 linhas. Exemplo: primeiras 5.

| protocolo | pontuacao | situacao |
|---|---|---|
| OC-2026-0016 | 98 | Em acompanhamento |
| OC-2026-0005 | 95 | Concluida |
| OC-2026-0021 | 93 | Em acompanhamento |
| OC-2026-0010 | 90 | Concluida |
| OC-2026-0026 | 88 | Aberta |

## Q12 — Visitas sem tentativa

**Pergunta:** Quais tarefas ainda não possuem ficha de tentativa?

**Recursos:** LEFT JOIN.

```sql
SELECT v.codigo, v.objetivo, v.situacao
FROM visita v
LEFT JOIN ficha_visita f ON f.id_visita = v.id_visita
WHERE f.id_ficha IS NULL
ORDER BY v.id_visita;
```

Resultado completo: 5 linhas. Exemplo: primeiras 5.

| codigo | objetivo | situacao |
|---|---|---|
| VIS-2026-0041 | Inspecao preventiva de recipientes e ambiente. | Pendente |
| VIS-2026-0042 | Inspecao preventiva de recipientes e ambiente. | Pendente |
| VIS-2026-0043 | Inspecao preventiva de recipientes e ambiente. | Pendente |
| VIS-2026-0044 | Inspecao preventiva de recipientes e ambiente. | Pendente |
| VIS-2026-0045 | Inspecao preventiva de recipientes e ambiente. | Pendente |

## Q13 — Rotas sem tarefas

**Pergunta:** Quais roteiros ainda não possuem visitas atribuídas?

**Recursos:** LEFT JOIN.

```sql
SELECT r.codigo, r.data_rota, r.situacao
FROM rota r
LEFT JOIN visita v ON v.id_rota = r.id_rota
WHERE v.id_visita IS NULL
ORDER BY r.data_rota, r.id_rota;
```

Resultado completo: 5 linhas. Exemplo: primeiras 5.

| codigo | data_rota | situacao |
|---|---|---|
| ROT-2026-0021 | 2026-06-21 | Planejada |
| ROT-2026-0022 | 2026-06-22 | Planejada |
| ROT-2026-0023 | 2026-06-23 | Planejada |
| ROT-2026-0024 | 2026-06-24 | Planejada |
| ROT-2026-0025 | 2026-06-25 | Planejada |

## Q14 — Revisões e encaminhamentos

**Pergunta:** Quais tentativas sem acesso foram revisadas e qual foi a decisão?

**Recursos:** INNER JOIN / 3 tabelas.

```sql
SELECT v.codigo, f.numero_tentativa, f.resultado, r.decisao, r.retorno_previsto
FROM visita v
INNER JOIN ficha_visita f ON f.id_visita = v.id_visita
INNER JOIN revisao_ficha r ON r.id_ficha = f.id_ficha
ORDER BY v.id_visita, f.numero_tentativa;
```

Resultado completo: 15 linhas. Exemplo: primeiras 5.

| codigo | numero_tentativa | resultado | decisao | retorno_previsto |
|---|---|---|---|---|
| VIS-2026-0001 | 1 | Fechado | Retornar | 2026-06-01 |
| VIS-2026-0002 | 1 | Ausente | Retornar | 2026-06-02 |
| VIS-2026-0003 | 1 | Fechado | Retornar | 2026-06-03 |
| VIS-2026-0004 | 1 | Ausente | Retornar | 2026-06-04 |
| VIS-2026-0005 | 1 | Fechado | Retornar | 2026-06-05 |

## Q15 — Imóvel efetivo da visita

**Pergunta:** Como localizar tanto visitas de ocorrência quanto visitas preventivas sem duplicar o imóvel?

**Recursos:** LEFT JOIN / CASE / COALESCE.

```sql
SELECT v.codigo, CASE WHEN v.id_ocorrencia IS NULL THEN 'Preventiva' ELSE 'Ocorrencia' END AS origem,
       i.inscricao, b.nome AS bairro
FROM visita v
LEFT JOIN ocorrencia o ON o.id_ocorrencia = v.id_ocorrencia
INNER JOIN imovel i ON i.id_imovel = COALESCE(o.id_imovel, v.id_imovel_preventivo)
INNER JOIN bairro b ON b.id_bairro = i.id_bairro
ORDER BY v.id_visita;
```

Resultado completo: 45 linhas. Exemplo: primeiras 5.

| codigo | origem | inscricao | bairro |
|---|---|---|---|
| VIS-2026-0001 | Ocorrencia | CAD-0001 | Jardim das Acacias |
| VIS-2026-0002 | Ocorrencia | CAD-0002 | Jardim das Acacias |
| VIS-2026-0003 | Ocorrencia | CAD-0003 | Jardim das Acacias |
| VIS-2026-0004 | Ocorrencia | CAD-0004 | Jardim das Acacias |
| VIS-2026-0005 | Ocorrencia | CAD-0005 | Jardim das Acacias |

## Interpretação dos totais

Q07 usa HAVING para excluir imóveis com apenas um caso. Q08 soma só distâncias de rotas concluídas. Q09 lista vínculos, não concede permissões. Q10 soma quantidades positivas diretamente: 5 depósitos, dos quais 2 positivos, contribuem com 2 positivos, não 5. Positivos e eliminados podem se sobrepor.

Q12 procura ausência de qualquer tentativa: ficha sem acesso também conta como tentativa. Q13 considera a alocação atual/última de visitas, não todo histórico. Q14 preserva o número de tentativa. Q15 resolve o alvo exclusivo.

Não juntar vínculos territoriais a contagens de inspeção sem controlar o nível das linhas: um profissional com cinco territórios pode multiplicar indevidamente cada observação por cinco.
