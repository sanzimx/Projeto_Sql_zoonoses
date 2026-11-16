# Normalização até a terceira forma normal

## Dependências funcionais

Criar IDs não comprova 3FN. É necessário identificar quais atributos determinam outros segundo as regras do domínio.

Considere a planilha inicial Campo(id_ficha, numero_tentativa, id_visita, objetivo, id_executor, nome_executor, matricula, id_imovel, inscricao, logradouro, id_bairro, nome_bairro, id_municipio, nome_municipio, tipos_deposito). A última coluna contém uma lista como “2 baldes, dos quais 1 positivo; 3 pneus, dos quais 2 positivos”. A planilha mistura tarefa, tentativa, executor e observações.

## Primeira forma normal

A lista é substituída por linhas com chave (id_ficha,id_tipo_deposito). Cada quantidade é atômica; vínculos não são guardados em texto separado por vírgulas. Observações são texto livre, não listas estruturadas de relações. Nome completo é atômico para o uso adotado.

## Segunda forma normal

Na relação expandida, os horários e o resultado dependem apenas de id_ficha; nome e descrição do tipo dependem apenas de id_tipo_deposito. São dependências parciais da chave composta. A decomposição resulta em FichaVisita(id_ficha,id_visita,numero_tentativa,id_executor,entrada_em,saida_em,resultado,recebido_por,orientacao,observacoes), TipoDeposito(id_tipo_deposito,nome,descricao) e InspecaoDeposito(id_ficha,id_tipo_deposito,quantidade_inspecionada,quantidade_com_larvas,quantidade_eliminada,acao).

Contagens e ação dependem do par inteiro, pois o mesmo tipo tem valores diferentes em cada tentativa. A interseção entre a associação e cada cadastro contém a chave do cadastro; a junção por essa chave recompõe as informações sem gerar combinações indevidas.

## Terceira forma normal

A cadeia id_ficha → id_executor → nome_executor é removida: dados pessoais ficam em Pessoa, e matrícula/cargo/admissão ficam na extensão Profissional. Não se repetem contatos quando um profissional também é solicitante.

A cadeia id_imovel → id_bairro → id_municipio → nome_municipio é decomposta em Imovel, Bairro e Municipio. ProfissionalMunicipio tem (id_profissional,id_municipio) determinando a data do vínculo.

Guardar id_ocorrencia e o mesmo id_imovel em Visita criaria id_visita → id_ocorrencia → id_imovel. Por isso a visita de caso guarda só id_ocorrencia. O campo id_imovel_preventivo só existe quando não há ocorrência, validado por exclusividade. A Q15 recupera o imóvel com COALESCE. No ramo preventivo, o imóvel depende diretamente da visita.

Endereço_relatado é a declaração original do cidadão, que pode divergir do imóvel confirmado. Não é uma cópia sincronizada do cadastro, portanto não se aplica id_imovel → endereco_relatado. Solicitação e ocorrência têm momentos e protocolos próprios.

Não se armazenam duração calculada, total de tentativas, nomes de pessoas nas fichas, nome de bairro no imóvel ou percentual de positividade. Ação e recebido_por são descrições do evento, não duplicações de cadastro funcional.

## Dependências por relação

| Relação | Chaves e observações | Dependência |
|---|---|---|
| municipio | id_municipio; (nome,uf) | Cada chave determina seus atributos. |
| pessoa | id_pessoa; email | Nome, contato e data dependem de cada chave. |
| profissional | id_profissional; matricula | Cargo, admissão e ativo dependem de cada chave. |
| profissional_municipio | (id_profissional,id_municipio) | O par determina vinculado_em. |
| bairro | id_bairro; (id_municipio,nome) | Cada chave determina zona. |
| imovel | id_imovel; inscricao | Cada chave determina localização, tipo e contato. |
| solicitacao | id_solicitacao; protocolo | Cada chave determina relato, origem e análise. |
| ocorrencia | id_ocorrencia; protocolo | Dados dependem do caso; id_solicitacao é único quando presente, mas nullable não é chave candidata total. |
| rota | id_rota; codigo | Responsável, data, situação e distância dependem da rota. |
| visita | id_visita; codigo | Objetivo e alvo exclusivo dependem da visita; rota/ordem é único quando presente. |
| ficha_visita | id_ficha; (id_visita,numero_tentativa) | Cada chave determina executor, horários e resultado. |
| tipo_deposito | id_tipo_deposito; nome | Cada chave determina descrição. |
| inspecao_deposito | (id_ficha,id_tipo_deposito) | O par determina contagens e ação. |
| revisao_ficha | id_ficha | Revisor, decisão, parecer e retorno dependem da ficha revisada. |

## Anomalias evitadas e limites

Um tipo pode ser cadastrado antes de ser inspecionado; a atualização de contato ocorre uma vez; excluir uma linha de inspeção não apaga o catálogo. As dependências ficam nas relações responsáveis e as FKs recompõem os vínculos. Regras temporais entre relações não decorrem da 3FN e continuam precisando das verificações documentadas.

O cadastro e os vínculos territoriais são atuais. Não se reconstrói toda mudança histórica de endereço, função ou autorização. Uma evolução de auditoria exigiria relações temporais próprias, não cópias indiscriminadas de nomes.
