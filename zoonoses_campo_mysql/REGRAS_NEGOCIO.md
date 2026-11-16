# Regras de negócio e alcance da integridade

As regras distinguem bloqueios do DDL de consultas que apenas identificam inconsistências. Executar V01–V15 não transforma verificações em bloqueios automáticos.

## RN01 — Cadastro único de pessoa

Nome e contato ficam em pessoa. Um servidor também pode solicitar atendimento, sem duplicação de seus dados.

**Implementação:** PK/FK compartilhada em profissional; email único neste recorte.

## RN02 — Extensão funcional opcional

Cada profissional tem exatamente uma pessoa; cada pessoa pode ter zero ou um profissional.

**Implementação:** PK/FK e matrícula UNIQUE. A FK não obriga a pessoa a ter extensão.

## RN03 — Atuação territorial

Um profissional pode atuar em vários municípios e um município pode ter vários profissionais. A data descreve o vínculo atual, não histórico de transferências.

**Implementação:** PK composta. V13 detecta ausência de vínculo do executor; não concede permissões.

## RN04 — Localização

Cada bairro pertence a um município e cada imóvel a um bairro. O nome do bairro é único dentro de seu município.

**Implementação:** FK e UNIQUE (id_municipio,nome).

## RN05 — Contato do imóvel

O responsável é opcional e pode responder por vários imóveis; não implica propriedade. Não se obriga ausência de responsável por tipo de imóvel.

**Implementação:** FK opcional de imóvel para pessoa.

## RN06 — Solicitação e ocorrência

O relato recebido é distinto do caso técnico. Há no máximo uma ocorrência por solicitação e casos abertos diretamente sem solicitação.

**Implementação:** FK opcional UNIQUE em ocorrência; V01 confere a conversão.

## RN07 — Endereço relatado

O endereço da solicitação conserva o relato original, que pode ser impreciso. A ocorrência usa o imóvel confirmado; os bairros podem divergir.

**Implementação:** Separação semântica, não cópia sincronizada do endereço cadastral.

## RN08 — Triagem

Pendente não tem analista, data ou parecer. Convertida e Indeferida exigem os três; análise não pode preceder recebimento.

**Implementação:** CHECK de linha; V15 verifica a função do analista.

## RN09 — Caso técnico

Ocorrência tem protocolo único, imóvel, categoria, descrição, abertura, pontuação de 0 a 100 e situação. A pontuação é didática, não escala clínica validada.

**Implementação:** NOT NULL, UNIQUE, FK e CHECK. Valores de situação não garantem transições.

## RN10 — Rota individual

Rota é atribuída a profissional e data; pode haver mais de uma rota no mesmo dia. Não há grupo fixo de equipe.

**Implementação:** FK; sem UNIQUE artificial de profissional/data.

## RN11 — Distância efetiva

Distância pode ser desconhecida em roteiro planejado. Rota concluída exige distância não negativa. Concluir a rota não resolve automaticamente o caso.

**Implementação:** CHECK de linha.

## RN12 — Alvo da visita

Visita de ocorrência obtém o imóvel do caso. Preventiva usa id_imovel_preventivo. Exatamente um vínculo de alvo deve estar preenchido.

**Implementação:** CHECK exclusivo e duas FKs; evita copiar o imóvel determinado pela ocorrência.

## RN13 — Ordem no roteiro

Sem rota, não há ordem. Com rota, a ordem é positiva e única nela. O vínculo representa programação atual/última, não histórico de alocações.

**Implementação:** CHECK e UNIQUE (id_rota,ordem_rota).

## RN14 — Tentativas

Visita pode ter nenhuma ou várias fichas finalizadas. Número positivo único dentro da visita e saída posterior à entrada.

**Implementação:** PK/FK/UNIQUE/CHECK; V05 verifica lacunas e V09 sequência temporal.

## RN15 — Executor real

Ficha registra quem executou a tentativa, independentemente do responsável atual pela rota, que pode mudar.

**Implementação:** FK; V13 confere o território cadastrado.

## RN16 — Inspeção por tipo

Ficha pode ter vários tipos de depósito; cada tipo pode estar em várias fichas. Há uma linha agregada por ficha/tipo.

**Implementação:** PK composta e FKs; V06 identifica inspeção ligada a tentativa sem acesso.

## RN17 — Contagens diretas

Total inspecionado é positivo; positivos e eliminados ficam entre zero e o total. Um depósito pode ser positivo e eliminado, por isso esses subtotais podem se sobrepor.

**Implementação:** CHECKs; não somar positivos+eliminados como categorias exclusivas.

## RN18 — Unidade contada

Quantidade_com_larvas conta depósitos positivos, não larvas. Não identifica espécie nem diagnóstico. Reinspeção é nova observação, não depósito físico único.

**Implementação:** Dicionário e interpretação da Q10.

## RN19 — Revisão da tentativa

Ficha sem inspeção pode ter zero ou uma revisão final, por profissional revisor distinto do executor e com função de gestão.

**Implementação:** PK/FK compartilhada; V07 e V08 verificam condição, tempo e função.

## RN20 — Retorno

Retornar exige data não anterior ao dia da revisão; Arquivar não informa retorno. Nova tentativa exige revisão anterior autorizando retorno.

**Implementação:** CHECK de linha e V10 entre tentativas; não cria rota automaticamente.

## RN21 — Estado da visita

Concluída exige última ficha inspecionada; arquivada exige decisão Arquivar na última ficha.

**Implementação:** V11 e V12 detectam inconsistências, mas não são gatilhos.

## RN22 — Caso concluído e reabertura

Ocorrência concluída tem visita concluída na massa. Não há parecer final de ocorrência nem motor de reabertura. Nova demanda após arquivamento deve gerar nova visita.

**Implementação:** V14 detecta ausência; regra de uso sem garantia de transição automática.

## RN23 — Histórico preservado

Pais referenciados não podem ser excluídos e IDs referenciados não podem ser modificados.

**Implementação:** ON DELETE RESTRICT e ON UPDATE RESTRICT em todas as FKs.

## RN24 — Escopo limitado

Laboratório, armadilhas, fotos, campanhas, mapa, autenticação, auditoria completa e offline ficam fora. Cadastro territorial não implementa autorização.

**Implementação:** Limitação explícita desta adaptação acadêmica.

