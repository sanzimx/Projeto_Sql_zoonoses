# Apresentação e estudo

## Roteiro de 15 minutos

| Tempo | Quem | Demonstração |
|---|---|---|
| 0:00–1:30 | Integrante 1 | Problema de relatos, casos e tentativas dispersas; adaptação acadêmica MySQL do processo Zoonoses+. |
| 1:30–3:00 | Integrante 1 | DER: Pessoa/Profissional e N:N territorial, sem equipes artificiais. |
| 3:00–4:30 | Integrante 2 | Solicitação→Ocorrência→Visita→Ficha; preventiva e alvo exclusivo. |
| 4:30–5:30 | Integrante 2 | N:N de inspeção, contagem positiva direta e revisão por tentativa. |
| 5:30–7:00 | Ambos | SHOW TABLES, SHOW CREATE TABLE visita e contagens do script03. |
| 7:00–9:30 | Integrante 1 | Executar Q01–Q05, pergunta, operador e resultado. |
| 9:30–12:30 | Integrante 2 | Executar Q06–Q10; explicar agrupamento, HAVING e agregadores. |
| 12:30–14:00 | Ambos | Q11 e Q12; Q14/Q15 se houver tempo, Q13 disponível na arguição. |
| 14:00–15:00 | Ambos | Uma decomposição em 3FN, limitações e evolução. |

Reservar mais 5 minutos para arguição. Preparar o banco antes da apresentação e deixar as 15 consultas abertas. As 10 obrigatórias são o núcleo da demonstração. Ambos devem dominar todas, inclusive os resultados esperados e a distinção entre execução auxiliar e MySQL real.

## Entendendo o processo

Um cidadão relata água parada. A solicitação conserva o que ele informou. A análise pode gerar uma ocorrência ligada ao imóvel confirmado. Planeja-se uma visita. Se o local estiver fechado, a ficha 1 registra a tentativa sem acesso; uma revisão pode autorizar retorno; a ficha 2 registra a tentativa seguinte, sem apagar a primeira.

Uma preventiva começa sem ocorrência. Seu imóvel é preenchido em id_imovel_preventivo. Quando há ocorrência, o imóvel é obtido do caso e o campo preventivo fica NULL. A Q15 unifica a consulta por COALESCE. O CHECK não permite ambos vazios nem ambos preenchidos.

Se há 5 baldes, dos quais 2 positivos e 1 eliminado, não existem 8 baldes: as contagens descrevem propriedades que podem se sobrepor. Nova inspeção é nova observação temporal. Positividade não identifica espécie de larva ou diagnóstico.

## Perguntas para a arguição

1. **Por que 14 tabelas?** Separam dependências e ciclos distintos, mantendo o recorte explicável pela dupla.
2. **Quais as N:N?** Profissional–Município e Ficha–TipoDeposito; cada associação usa chave composta.
3. **Qual a 1:1?** Pessoa tem 0..1 Profissional; Profissional tem 1 Pessoa. Ficha tem 0..1 Revisão.
4. **Por que não 15 papéis?** Função tem domínio curto; fabricar categorias para alcançar registros não faria sentido.
5. **Solicitação é ocorrência?** Não. O relato pode aguardar análise ou ser indeferido; caso técnico tem outro ciclo.
6. **Visita é ficha?** Não. A tarefa admite várias tentativas; cada ficha registra uma execução finalizada.
7. **CHECK impõe transições?** Não. Valida valores da linha. V01–V15 detectam inconsistências entre linhas, sem bloqueá-las.
8. **Por que RESTRICT?** Preserva pais referenciados e usa identificadores estáveis, sem exclusão em cascata.
9. **O que comprova 3FN?** Dependências funcionais e decomposição, não simplesmente IDs automáticos.
10. **Por que alvo exclusivo?** Evita duplicar o imóvel determinado pela ocorrência dentro da visita.
11. **WHERE e HAVING?** WHERE filtra linhas; HAVING filtra grupos, como imóveis com mais de um caso.
12. **Por que LEFT JOIN?** Preserva tarefas sem ficha para que a ausência possa ser consultada.
13. **Por que evitar juntar duas N:N sem cuidado?** As linhas podem multiplicar e inflar totais.
14. **Foi executado no MySQL?** Nesta entrega, não. Só declare isso após repetir os scripts no motor e registrar evidências.
15. **O que ficou fora?** Laboratório, armadilhas, fotos, campanhas, autorização, mapa, auditoria completa e offline.

## Exercícios

- Desenhar os dois caminhos de uma visita até seu imóvel.
- Encontrar uma pessoa que também seja profissional e solicitante nos INSERTs.
- Distinguir quantidade de fichas, visitas, imóveis e depósitos observados.
- Alterar o intervalo da Q03 e prever o resultado.
- Explicar a sequência de tentativas da Q14.
- Executar um teste negativo, identificar a restrição e fazer ROLLBACK.
- Montar o DER manualmente com GUIA_DRAWIO.md e comparar com o editável.
