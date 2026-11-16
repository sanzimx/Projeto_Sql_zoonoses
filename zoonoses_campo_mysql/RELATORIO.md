# Zoonoses+ Banco de dados para vigilância e trabalho de campo

Instituição: AFYA Centro Universitário  
Curso: Engenharia da Computação  
Disciplina: Banco de Dados  
Integrante 1: ____________________ (confirmar nome completo)  
Integrante 2: ____________________ (confirmar nome completo)  
Docente: ____________________  
Semestre: ____________________ (confirmar: enunciado 1/2026; referência 2/2026)  
Versão acadêmica: 27/10/2026

## Resumo executivo

Este trabalho apresenta um banco relacional para registrar solicitações dos cidadãos, ocorrências, visitas técnicas e tentativas de inspeção ambiental. Adapta os processos de vigilância e campo do Zoonoses+ ao MySQL, separando relato, análise, planejamento e evidência de cada tentativa. Pessoas compartilham cadastro único, com extensão funcional quando atuam no serviço.

O esquema contém 14 tabelas, 513 registros fictícios e 15 consultas. Duas associações N:N representam vínculos territoriais e inspeções por tipo de depósito. Relações 1:0..1 usam chaves compartilhadas; a justificativa da 3FN explicita dependências funcionais. A conferência auxiliar ocorreu em SQLite em memória; execução efetiva no MySQL permanece pendente.

## Introdução

O trabalho de campo produz dados em momentos distintos. Um relato ainda precisa ser analisado, uma ocorrência pode exigir várias visitas e uma visita pode falhar por ausência de acesso. Misturar esses registros dificulta distinguir demanda recebida, tarefa planejada e ação executada.

A organização relacional permite acompanhar tentativas sem apagar registros anteriores e consultar recorrência de casos, roteiros sem tarefas e depósitos observados. Este trabalho concentra-se nessa organização, sem substituir protocolos técnicos ou reproduzir integralmente o aplicativo.

## Problema e objetivos

O problema é preservar o vínculo entre relatos, casos, tarefas e evidências, evitando repetição de pessoas e contagens incorretas. O objetivo geral é construir um esquema MySQL coerente com esses processos e explicável pela dupla.

Objetivos específicos: distinguir solicitação de ocorrência e visita de ficha; representar prevenção sem caso; organizar territórios e profissionais; registrar contagens diretas; aplicar integridade; desenvolver consultas operacionais; e permitir execução reproduzível e construção manual do DER.

## Metodologia e fontes

Foram lidos integralmente o enunciado e a apresentação de referência e consultados módulos e migrations relevantes do código local. Os processos foram convertidos em regras, dependências, esquema, massa de dados e consultas. É uma adaptação independente: o app usa PostgreSQL/Supabase, a entrega usa SQL para MySQL.

As afirmações de execução MySQL do PDF não foram transferidas para este trabalho. O PDF anuncia 14 consultas, mas exibe Q01–Q13; esta versão entrega 15. Os nomes finais da dupla e o semestre não foram presumidos. FONTES_E_ESCOPO.md registra as diferenças.

## Escopo

São cobertos território, pessoas, profissionais, relatos, casos, rotas, visitas, tentativas, inspeções e revisões. Equipe é cadastro funcional de pessoas, não grupos nomeados. O vínculo territorial é profissional–município.

Das cinco etapas de ficha do app, imóvel/acesso corresponde ao alvo e resultado; inspeção às contagens; tratamento à ação e orientação resumidas; amostras/fotos ficam fora; revisão do preenchimento não se confunde com a decisão posterior de RevisaoFicha. Laboratório, armadilhas, campanhas, mapa, autenticação, autorização efetiva, auditoria completa e offline não foram implementados. A prevenção individual existe como visita sem ocorrência.

## Entidades do modelo

| Tabela | Finalidade | Registros |
|---|---|---|
| municipio | Município do território de atuação; catálogo geográfico didático. | 15 |
| pessoa | Cadastro compartilhado por cidadãos e servidores; um profissional também pode solicitar atendimento. | 40 |
| profissional | Extensão funcional de pessoa, sem duplicar nome ou contato; não representa grupo de equipe. | 15 |
| profissional_municipio | Associação N:N dos territórios cadastrados para atuação de cada profissional. | 76 |
| bairro | Bairro identificado dentro de um município. | 30 |
| imovel | Local confirmado para trabalho de campo, distinto do endereço relatado na solicitação. | 40 |
| solicitacao | Relato recebido do cidadão, com triagem própria; não é a ocorrência técnica. | 35 |
| ocorrencia | Caso técnico aberto por conversão ou identificação direta do serviço. | 30 |
| rota | Planejamento diário atribuído a um profissional, sem grupo fixo de equipe. | 25 |
| visita | Tarefa de campo que pode gerar várias tentativas; o imóvel vem do caso ou do vínculo preventivo exclusivo. | 45 |
| ficha_visita | Registro de uma tentativa finalizada, com identificação do executor e horários reais. | 50 |
| tipo_deposito | Catálogo didático de recipientes e estruturas inspecionáveis; não é uma lista oficial PNCD. | 15 |
| inspecao_deposito | Associação N:N de fichas e tipos, com contagens diretas de depósitos inspecionados e positivos. | 82 |
| revisao_ficha | Decisão sobre uma tentativa sem inspeção; cada ficha recebe no máximo uma revisão final. | 15 |

## Regras de negócio e alcance da integridade

As regras distinguem bloqueios do DDL de consultas que apenas identificam inconsistências. Executar V01–V15 não transforma verificações em bloqueios automáticos.

### RN01 — Cadastro único de pessoa

Nome e contato ficam em pessoa. Um servidor também pode solicitar atendimento, sem duplicação de seus dados.

**Implementação:** PK/FK compartilhada em profissional; email único neste recorte.

### RN02 — Extensão funcional opcional

Cada profissional tem exatamente uma pessoa; cada pessoa pode ter zero ou um profissional.

**Implementação:** PK/FK e matrícula UNIQUE. A FK não obriga a pessoa a ter extensão.

### RN03 — Atuação territorial

Um profissional pode atuar em vários municípios e um município pode ter vários profissionais. A data descreve o vínculo atual, não histórico de transferências.

**Implementação:** PK composta. V13 detecta ausência de vínculo do executor; não concede permissões.

### RN04 — Localização

Cada bairro pertence a um município e cada imóvel a um bairro. O nome do bairro é único dentro de seu município.

**Implementação:** FK e UNIQUE (id_municipio,nome).

### RN05 — Contato do imóvel

O responsável é opcional e pode responder por vários imóveis; não implica propriedade. Não se obriga ausência de responsável por tipo de imóvel.

**Implementação:** FK opcional de imóvel para pessoa.

### RN06 — Solicitação e ocorrência

O relato recebido é distinto do caso técnico. Há no máximo uma ocorrência por solicitação e casos abertos diretamente sem solicitação.

**Implementação:** FK opcional UNIQUE em ocorrência; V01 confere a conversão.

### RN07 — Endereço relatado

O endereço da solicitação conserva o relato original, que pode ser impreciso. A ocorrência usa o imóvel confirmado; os bairros podem divergir.

**Implementação:** Separação semântica, não cópia sincronizada do endereço cadastral.

### RN08 — Triagem

Pendente não tem analista, data ou parecer. Convertida e Indeferida exigem os três; análise não pode preceder recebimento.

**Implementação:** CHECK de linha; V15 verifica a função do analista.

### RN09 — Caso técnico

Ocorrência tem protocolo único, imóvel, categoria, descrição, abertura, pontuação de 0 a 100 e situação. A pontuação é didática, não escala clínica validada.

**Implementação:** NOT NULL, UNIQUE, FK e CHECK. Valores de situação não garantem transições.

### RN10 — Rota individual

Rota é atribuída a profissional e data; pode haver mais de uma rota no mesmo dia. Não há grupo fixo de equipe.

**Implementação:** FK; sem UNIQUE artificial de profissional/data.

### RN11 — Distância efetiva

Distância pode ser desconhecida em roteiro planejado. Rota concluída exige distância não negativa. Concluir a rota não resolve automaticamente o caso.

**Implementação:** CHECK de linha.

### RN12 — Alvo da visita

Visita de ocorrência obtém o imóvel do caso. Preventiva usa id_imovel_preventivo. Exatamente um vínculo de alvo deve estar preenchido.

**Implementação:** CHECK exclusivo e duas FKs; evita copiar o imóvel determinado pela ocorrência.

### RN13 — Ordem no roteiro

Sem rota, não há ordem. Com rota, a ordem é positiva e única nela. O vínculo representa programação atual/última, não histórico de alocações.

**Implementação:** CHECK e UNIQUE (id_rota,ordem_rota).

### RN14 — Tentativas

Visita pode ter nenhuma ou várias fichas finalizadas. Número positivo único dentro da visita e saída posterior à entrada.

**Implementação:** PK/FK/UNIQUE/CHECK; V05 verifica lacunas e V09 sequência temporal.

### RN15 — Executor real

Ficha registra quem executou a tentativa, independentemente do responsável atual pela rota, que pode mudar.

**Implementação:** FK; V13 confere o território cadastrado.

### RN16 — Inspeção por tipo

Ficha pode ter vários tipos de depósito; cada tipo pode estar em várias fichas. Há uma linha agregada por ficha/tipo.

**Implementação:** PK composta e FKs; V06 identifica inspeção ligada a tentativa sem acesso.

### RN17 — Contagens diretas

Total inspecionado é positivo; positivos e eliminados ficam entre zero e o total. Um depósito pode ser positivo e eliminado, por isso esses subtotais podem se sobrepor.

**Implementação:** CHECKs; não somar positivos+eliminados como categorias exclusivas.

### RN18 — Unidade contada

Quantidade_com_larvas conta depósitos positivos, não larvas. Não identifica espécie nem diagnóstico. Reinspeção é nova observação, não depósito físico único.

**Implementação:** Dicionário e interpretação da Q10.

### RN19 — Revisão da tentativa

Ficha sem inspeção pode ter zero ou uma revisão final, por profissional revisor distinto do executor e com função de gestão.

**Implementação:** PK/FK compartilhada; V07 e V08 verificam condição, tempo e função.

### RN20 — Retorno

Retornar exige data não anterior ao dia da revisão; Arquivar não informa retorno. Nova tentativa exige revisão anterior autorizando retorno.

**Implementação:** CHECK de linha e V10 entre tentativas; não cria rota automaticamente.

### RN21 — Estado da visita

Concluída exige última ficha inspecionada; arquivada exige decisão Arquivar na última ficha.

**Implementação:** V11 e V12 detectam inconsistências, mas não são gatilhos.

### RN22 — Caso concluído e reabertura

Ocorrência concluída tem visita concluída na massa. Não há parecer final de ocorrência nem motor de reabertura. Nova demanda após arquivamento deve gerar nova visita.

**Implementação:** V14 detecta ausência; regra de uso sem garantia de transição automática.

### RN23 — Histórico preservado

Pais referenciados não podem ser excluídos e IDs referenciados não podem ser modificados.

**Implementação:** ON DELETE RESTRICT e ON UPDATE RESTRICT em todas as FKs.

### RN24 — Escopo limitado

Laboratório, armadilhas, fotos, campanhas, mapa, autenticação, auditoria completa e offline ficam fora. Cadastro territorial não implementa autorização.

**Implementação:** Limitação explícita desta adaptação acadêmica.


## DER físico

![DER físico completo](diagramas/der_completo.png)

O desenho mostra todas as tabelas e colunas. PK indica chave primária, FK referência e UQ unicidade simples. As regras compostas completas estão no dicionário. Perto do pai, a cardinalidade informa quantos pais cada filho pode ter; perto do filho, quantos filhos cada pai pode ter. 0..1 é opcional unitário; 0..N é opcional múltiplo; 1 é obrigatório unitário. FK não obriga um pai a possuir filhos.

Pessoa–Profissional e Ficha–Revisão são 1:0..1. As duas N:N são resolvidas pelas associativas. Município–Bairro, Bairro–Imóvel, Pessoa–Solicitação, Imóvel–Ocorrência, Profissional–Rota e Visita–Ficha são exemplos 1:N. Os vínculos opcionais de alvo da visita são exclusivos; cada linha isolada não expressa essa regra conjunta.

O editável está em diagramas/zoonoses_campo.drawio. GUIA_DRAWIO.md orienta a construção manual. A imagem deriva da mesma definição dos scripts, não de engenharia reversa de MySQL executado.

## Dicionário de dados

PK identifica a linha; FK referencia outra tabela; UQ significa UNIQUE. Todos os IDs são internos e estáveis. Todas as FKs declaram **ON UPDATE RESTRICT ON DELETE RESTRICT**: alteração de identificadores referenciados e exclusão de pais com dependentes são bloqueadas. Não há exclusão automática de histórico. Esta escolha evita depender de cascatas sobre colunas usadas em CHECKs de vínculo opcional.

NULL é ausência de informação. Estados usam valores sem acentos para facilitar digitação; textos admitem UTF-8. Horários da massa são locais de Minas Gerais, sem conversão automática de fuso em DATETIME.

### municipio

Município do território de atuação; catálogo geográfico didático. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_municipio | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| nome | VARCHAR(80) | — | NOT NULL | Nome do município. |
| uf | CHAR(2) | — | NOT NULL DEFAULT 'MG' | Unidade federativa. |

Restrições de tabela:

- `CONSTRAINT uq_municipio UNIQUE (nome, uf)`

### pessoa

Cadastro compartilhado por cidadãos e servidores; um profissional também pode solicitar atendimento. **Massa: 40 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_pessoa | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| nome | VARCHAR(100) | — | NOT NULL | Nome completo fictício. |
| email | VARCHAR(120) | UQ | NOT NULL UNIQUE | Contato fictício em example.com; chave alternativa neste recorte. |
| telefone | VARCHAR(20) | — | NULL | Contato opcional; sem números reais na massa. |
| cadastrada_em | DATE | — | NOT NULL | Data do cadastro. |

Restrições de tabela:

- Nenhuma além das colunas.

### profissional

Extensão funcional de pessoa, sem duplicar nome ou contato; não representa grupo de equipe. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_profissional | INT | PK,FK | PRIMARY KEY | Identificador da pessoa que exerce função no serviço. |
| matricula | VARCHAR(20) | UQ | NOT NULL UNIQUE | Matrícula fictícia do servidor. |
| cargo | VARCHAR(20) | — | NOT NULL CHECK (cargo IN ('Agente','Supervisor','Administrador')) | Função funcional, não implementação de autorização. |
| admissao | DATE | — | NOT NULL | Data de admissão. |
| ativo | CHAR(1) | — | NOT NULL DEFAULT 'S' CHECK (ativo IN ('S','N')) | Situação funcional atual. |

Restrições de tabela:

- `CONSTRAINT fk_profissional_id_profissional FOREIGN KEY (id_profissional) REFERENCES pessoa (id_pessoa) ON UPDATE RESTRICT ON DELETE RESTRICT`

### profissional_municipio

Associação N:N dos territórios cadastrados para atuação de cada profissional. **Massa: 76 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_profissional | INT | PK,FK | NOT NULL | Profissional vinculado. |
| id_municipio | INT | PK,FK | NOT NULL | Território vinculado. |
| vinculado_em | DATE | — | NOT NULL | Data de início do vínculo atual. |

Restrições de tabela:

- `PRIMARY KEY (id_profissional, id_municipio)`
- `CONSTRAINT fk_profissional_municipio_id_profissional FOREIGN KEY (id_profissional) REFERENCES profissional (id_profissional) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_profissional_municipio_id_municipio FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio) ON UPDATE RESTRICT ON DELETE RESTRICT`

### bairro

Bairro identificado dentro de um município. **Massa: 30 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_bairro | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| id_municipio | INT | FK | NOT NULL | Município ao qual pertence. |
| nome | VARCHAR(80) | — | NOT NULL | Nome do bairro fictício. |
| zona | VARCHAR(10) | — | NOT NULL CHECK (zona IN ('Urbana','Rural')) | Zona territorial. |

Restrições de tabela:

- `CONSTRAINT uq_bairro UNIQUE (id_municipio, nome)`
- `CONSTRAINT fk_bairro_id_municipio FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio) ON UPDATE RESTRICT ON DELETE RESTRICT`

### imovel

Local confirmado para trabalho de campo, distinto do endereço relatado na solicitação. **Massa: 40 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_imovel | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| inscricao | VARCHAR(20) | UQ | NOT NULL UNIQUE | Código de cadastro interno, não inscrição oficial. |
| id_bairro | INT | FK | NOT NULL | Bairro do imóvel. |
| id_responsavel | INT | FK | NULL | Pessoa de contato atual, quando conhecida; não presume propriedade. |
| logradouro | VARCHAR(100) | — | NOT NULL | Endereço fictício. |
| numero | VARCHAR(12) | — | NOT NULL | Número ou S/N. |
| complemento | VARCHAR(80) | — | NULL | Referência complementar. |
| tipo | VARCHAR(20) | — | NOT NULL CHECK (tipo IN ('Residencial','Comercial','Terreno','Publico','Estrategico')) | Uso do imóvel. |

Restrições de tabela:

- `CONSTRAINT fk_imovel_id_bairro FOREIGN KEY (id_bairro) REFERENCES bairro (id_bairro) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_imovel_id_responsavel FOREIGN KEY (id_responsavel) REFERENCES pessoa (id_pessoa) ON UPDATE RESTRICT ON DELETE RESTRICT`

### solicitacao

Relato recebido do cidadão, com triagem própria; não é a ocorrência técnica. **Massa: 35 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_solicitacao | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| protocolo | VARCHAR(20) | UQ | NOT NULL UNIQUE | Protocolo de entrada. |
| id_solicitante | INT | FK | NOT NULL | Pessoa solicitante; anonimato fora do recorte. |
| id_bairro | INT | FK | NOT NULL | Bairro informado pelo cidadão. |
| endereco_relatado | VARCHAR(180) | — | NOT NULL | Texto original do endereço, sujeito a confirmação. |
| descricao | VARCHAR(300) | — | NOT NULL | Problema relatado. |
| recebida_em | DATETIME | — | NOT NULL | Momento de recebimento. |
| situacao | VARCHAR(12) | — | NOT NULL DEFAULT 'Pendente' CHECK (situacao IN ('Pendente','Convertida','Indeferida')) | Resultado atual da triagem. |
| id_analista | INT | FK | NULL | Profissional que analisou. |
| analisada_em | DATETIME | — | NULL | Momento da análise. |
| parecer | VARCHAR(200) | — | NULL | Justificativa da análise. |

Restrições de tabela:

- `CONSTRAINT fk_solicitacao_id_solicitante FOREIGN KEY (id_solicitante) REFERENCES pessoa (id_pessoa) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_solicitacao_id_bairro FOREIGN KEY (id_bairro) REFERENCES bairro (id_bairro) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_solicitacao_id_analista FOREIGN KEY (id_analista) REFERENCES profissional (id_profissional) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT ck_solicitacao_analise CHECK ((situacao = 'Pendente' AND id_analista IS NULL AND analisada_em IS NULL AND parecer IS NULL) OR (situacao <> 'Pendente' AND id_analista IS NOT NULL AND analisada_em IS NOT NULL AND parecer IS NOT NULL AND analisada_em >= recebida_em))`

### ocorrencia

Caso técnico aberto por conversão ou identificação direta do serviço. **Massa: 30 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_ocorrencia | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| protocolo | VARCHAR(20) | UQ | NOT NULL UNIQUE | Identificador público fictício do caso. |
| id_solicitacao | INT | FK,UQ | NULL UNIQUE | Solicitação de origem, quando houver; uma conversão por solicitação. |
| id_imovel | INT | FK | NOT NULL | Imóvel confirmado para o caso. |
| categoria | VARCHAR(20) | — | NOT NULL CHECK (categoria IN ('Agua parada','Residuos','Vetores','Animal sinantropico','Outros')) | Classificação operacional resumida. |
| descricao_tecnica | VARCHAR(300) | — | NOT NULL | Descrição técnica do problema. |
| aberta_em | DATETIME | — | NOT NULL | Data e hora de abertura. |
| pontuacao | INT | — | NOT NULL CHECK (pontuacao BETWEEN 0 AND 100) | Prioridade didática atribuída; não é escala clínica validada. |
| situacao | VARCHAR(20) | — | NOT NULL DEFAULT 'Aberta' CHECK (situacao IN ('Aberta','Em acompanhamento','Concluida','Cancelada')) | Estado atual; transições não são garantidas pelo CHECK. |

Restrições de tabela:

- `CONSTRAINT fk_ocorrencia_id_solicitacao FOREIGN KEY (id_solicitacao) REFERENCES solicitacao (id_solicitacao) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_ocorrencia_id_imovel FOREIGN KEY (id_imovel) REFERENCES imovel (id_imovel) ON UPDATE RESTRICT ON DELETE RESTRICT`

### rota

Planejamento diário atribuído a um profissional, sem grupo fixo de equipe. **Massa: 25 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_rota | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| codigo | VARCHAR(20) | UQ | NOT NULL UNIQUE | Identificação da rota. |
| id_profissional | INT | FK | NOT NULL | Profissional responsável pelo planejamento de campo. |
| data_rota | DATE | — | NOT NULL | Dia planejado. |
| situacao | VARCHAR(12) | — | NOT NULL DEFAULT 'Planejada' CHECK (situacao IN ('Planejada','Concluida','Cancelada')) | Situação do roteiro diário, não do caso técnico. |
| distancia_km | DECIMAL(7,2) | — | NULL CHECK (distancia_km IS NULL OR distancia_km >= 0) | Distância efetivamente registrada; NULL quando não medida. |

Restrições de tabela:

- `CONSTRAINT fk_rota_id_profissional FOREIGN KEY (id_profissional) REFERENCES profissional (id_profissional) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT ck_rota_distancia CHECK (situacao <> 'Concluida' OR distancia_km IS NOT NULL)`

### visita

Tarefa de campo que pode gerar várias tentativas; o imóvel vem do caso ou do vínculo preventivo exclusivo. **Massa: 45 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_visita | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| codigo | VARCHAR(20) | UQ | NOT NULL UNIQUE | Identificador da tarefa. |
| id_ocorrencia | INT | FK | NULL | Caso atendido; NULL em visita preventiva. |
| id_imovel_preventivo | INT | FK | NULL | Imóvel apenas quando não há ocorrência; evita duplicar o imóvel do caso. |
| id_rota | INT | FK | NULL | Rota atual ou última atribuída; não preserva o histórico de replanejamentos. |
| ordem_rota | INT | — | NULL | Posição no roteiro, quando atribuído. |
| criada_em | DATETIME | — | NOT NULL | Momento da criação. |
| objetivo | VARCHAR(200) | — | NOT NULL | Finalidade da tarefa. |
| situacao | VARCHAR(20) | — | NOT NULL DEFAULT 'Pendente' CHECK (situacao IN ('Pendente','Agendada','Aguardando revisao','Concluida','Arquivada')) | Situação operacional atual. |

Restrições de tabela:

- `CONSTRAINT fk_visita_id_ocorrencia FOREIGN KEY (id_ocorrencia) REFERENCES ocorrencia (id_ocorrencia) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_visita_id_imovel_preventivo FOREIGN KEY (id_imovel_preventivo) REFERENCES imovel (id_imovel) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_visita_id_rota FOREIGN KEY (id_rota) REFERENCES rota (id_rota) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT uq_visita_ordem UNIQUE (id_rota, ordem_rota)`
- `CONSTRAINT ck_visita_alvo CHECK ((id_ocorrencia IS NOT NULL AND id_imovel_preventivo IS NULL) OR (id_ocorrencia IS NULL AND id_imovel_preventivo IS NOT NULL))`
- `CONSTRAINT ck_visita_rota CHECK ((id_rota IS NULL AND ordem_rota IS NULL) OR (id_rota IS NOT NULL AND ordem_rota IS NOT NULL AND ordem_rota > 0))`

### ficha_visita

Registro de uma tentativa finalizada, com identificação do executor e horários reais. **Massa: 50 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_ficha | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| id_visita | INT | FK | NOT NULL | Tarefa à qual pertence. |
| numero_tentativa | INT | — | NOT NULL CHECK (numero_tentativa > 0) | Número único dentro da visita; ausência de lacunas é verificada por consulta. |
| id_executor | INT | FK | NOT NULL | Profissional que executou a tentativa, independentemente do responsável atual da rota. |
| entrada_em | DATETIME | — | NOT NULL | Início da tentativa. |
| saida_em | DATETIME | — | NOT NULL | Fim da tentativa. |
| resultado | VARCHAR(15) | — | NOT NULL CHECK (resultado IN ('Inspecionada','Fechado','Recusa','Ausente','Outro')) | Resultado de acesso/execução. |
| recebido_por | VARCHAR(100) | — | NULL | Nome informado do acompanhante, quando houver. |
| orientacao | VARCHAR(250) | — | NULL | Orientação efetivamente registrada. |
| observacoes | VARCHAR(300) | — | NOT NULL | Descrição de campo. |

Restrições de tabela:

- `CONSTRAINT fk_ficha_visita_id_visita FOREIGN KEY (id_visita) REFERENCES visita (id_visita) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_ficha_visita_id_executor FOREIGN KEY (id_executor) REFERENCES profissional (id_profissional) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT uq_ficha_tentativa UNIQUE (id_visita, numero_tentativa)`
- `CONSTRAINT ck_ficha_horario CHECK (saida_em > entrada_em)`

### tipo_deposito

Catálogo didático de recipientes e estruturas inspecionáveis; não é uma lista oficial PNCD. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_tipo_deposito | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| nome | VARCHAR(80) | UQ | NOT NULL UNIQUE | Tipo de depósito. |
| descricao | VARCHAR(200) | — | NOT NULL | Definição operacional para evitar sobreposição na contagem. |

Restrições de tabela:

- Nenhuma além das colunas.

### inspecao_deposito

Associação N:N de fichas e tipos, com contagens diretas de depósitos inspecionados e positivos. **Massa: 82 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_ficha | INT | PK,FK | NOT NULL | Ficha de uma tentativa inspecionada. |
| id_tipo_deposito | INT | PK,FK | NOT NULL | Tipo encontrado naquela tentativa. |
| quantidade_inspecionada | INT | — | NOT NULL CHECK (quantidade_inspecionada > 0) | Total contado; cada depósito físico contado uma vez por tentativa. |
| quantidade_com_larvas | INT | — | NOT NULL DEFAULT 0 CHECK (quantidade_com_larvas >= 0) | Número de depósitos com presença observada de larvas; não quantidade de larvas. |
| quantidade_eliminada | INT | — | NOT NULL DEFAULT 0 CHECK (quantidade_eliminada >= 0) | Número de depósitos eliminados naquela tentativa. |
| acao | VARCHAR(200) | — | NOT NULL | Medida registrada, sem prescrição química no recorte. |

Restrições de tabela:

- `PRIMARY KEY (id_ficha, id_tipo_deposito)`
- `CONSTRAINT fk_inspecao_deposito_id_ficha FOREIGN KEY (id_ficha) REFERENCES ficha_visita (id_ficha) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_inspecao_deposito_id_tipo_deposito FOREIGN KEY (id_tipo_deposito) REFERENCES tipo_deposito (id_tipo_deposito) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT ck_inspecao_limites CHECK (quantidade_com_larvas <= quantidade_inspecionada AND quantidade_eliminada <= quantidade_inspecionada)`

### revisao_ficha

Decisão sobre uma tentativa sem inspeção; cada ficha recebe no máximo uma revisão final. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_ficha | INT | PK,FK | PRIMARY KEY | Chave compartilhada com a ficha revisada. |
| id_revisor | INT | FK | NOT NULL | Profissional responsável pela análise. |
| revisada_em | DATETIME | — | NOT NULL | Momento da decisão. |
| decisao | VARCHAR(10) | — | NOT NULL CHECK (decisao IN ('Retornar','Arquivar')) | Encaminhamento da tentativa. |
| parecer | VARCHAR(250) | — | NOT NULL | Justificativa. |
| retorno_previsto | DATE | — | NULL | Data sugerida para retorno; não cria rota automaticamente. |

Restrições de tabela:

- `CONSTRAINT fk_revisao_ficha_id_ficha FOREIGN KEY (id_ficha) REFERENCES ficha_visita (id_ficha) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT fk_revisao_ficha_id_revisor FOREIGN KEY (id_revisor) REFERENCES profissional (id_profissional) ON UPDATE RESTRICT ON DELETE RESTRICT`
- `CONSTRAINT ck_revisao_retorno CHECK ((decisao = 'Retornar' AND retorno_previsto IS NOT NULL AND retorno_previsto >= DATE(revisada_em)) OR (decisao = 'Arquivar' AND retorno_previsto IS NULL))`

## Normalização até a terceira forma normal

### Dependências funcionais

Criar IDs não comprova 3FN. É necessário identificar quais atributos determinam outros segundo as regras do domínio.

Considere a planilha inicial Campo(id_ficha, numero_tentativa, id_visita, objetivo, id_executor, nome_executor, matricula, id_imovel, inscricao, logradouro, id_bairro, nome_bairro, id_municipio, nome_municipio, tipos_deposito). A última coluna contém uma lista como “2 baldes, dos quais 1 positivo; 3 pneus, dos quais 2 positivos”. A planilha mistura tarefa, tentativa, executor e observações.

### Primeira forma normal

A lista é substituída por linhas com chave (id_ficha,id_tipo_deposito). Cada quantidade é atômica; vínculos não são guardados em texto separado por vírgulas. Observações são texto livre, não listas estruturadas de relações. Nome completo é atômico para o uso adotado.

### Segunda forma normal

Na relação expandida, os horários e o resultado dependem apenas de id_ficha; nome e descrição do tipo dependem apenas de id_tipo_deposito. São dependências parciais da chave composta. A decomposição resulta em FichaVisita(id_ficha,id_visita,numero_tentativa,id_executor,entrada_em,saida_em,resultado,recebido_por,orientacao,observacoes), TipoDeposito(id_tipo_deposito,nome,descricao) e InspecaoDeposito(id_ficha,id_tipo_deposito,quantidade_inspecionada,quantidade_com_larvas,quantidade_eliminada,acao).

Contagens e ação dependem do par inteiro, pois o mesmo tipo tem valores diferentes em cada tentativa. A interseção entre a associação e cada cadastro contém a chave do cadastro; a junção por essa chave recompõe as informações sem gerar combinações indevidas.

### Terceira forma normal

A cadeia id_ficha → id_executor → nome_executor é removida: dados pessoais ficam em Pessoa, e matrícula/cargo/admissão ficam na extensão Profissional. Não se repetem contatos quando um profissional também é solicitante.

A cadeia id_imovel → id_bairro → id_municipio → nome_municipio é decomposta em Imovel, Bairro e Municipio. ProfissionalMunicipio tem (id_profissional,id_municipio) determinando a data do vínculo.

Guardar id_ocorrencia e o mesmo id_imovel em Visita criaria id_visita → id_ocorrencia → id_imovel. Por isso a visita de caso guarda só id_ocorrencia. O campo id_imovel_preventivo só existe quando não há ocorrência, validado por exclusividade. A Q15 recupera o imóvel com COALESCE. No ramo preventivo, o imóvel depende diretamente da visita.

Endereço_relatado é a declaração original do cidadão, que pode divergir do imóvel confirmado. Não é uma cópia sincronizada do cadastro, portanto não se aplica id_imovel → endereco_relatado. Solicitação e ocorrência têm momentos e protocolos próprios.

Não se armazenam duração calculada, total de tentativas, nomes de pessoas nas fichas, nome de bairro no imóvel ou percentual de positividade. Ação e recebido_por são descrições do evento, não duplicações de cadastro funcional.

### Dependências por relação

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

### Anomalias evitadas e limites

Um tipo pode ser cadastrado antes de ser inspecionado; a atualização de contato ocorre uma vez; excluir uma linha de inspeção não apaga o catálogo. As dependências ficam nas relações responsáveis e as FKs recompõem os vínculos. Regras temporais entre relações não decorrem da 3FN e continuam precisando das verificações documentadas.

O cadastro e os vínculos territoriais são atuais. Não se reconstrói toda mudança histórica de endereço, função ou autorização. Uma evolução de auditoria exigiria relações temporais próprias, não cópias indiscriminadas de nomes.

## Implementação e povoamento

O script 01 cria banco e tabelas InnoDB com utf8mb4, PK/FK, NOT NULL, UNIQUE, CHECK e DEFAULT. Entidades usam INT AUTO_INCREMENT; extensões e associações usam chaves compartilhadas ou compostas. As FKs usam RESTRICT para preservar referências e identificadores estáveis.

A massa contém 513 linhas, mínimo de 15 por tabela. Nomes municipais são referência geográfica; bairros, endereços, pessoas, matrículas e operações são fictícios, não estatísticas reais. Emails usam example.com e telefones desconhecidos ficam NULL. Há solicitações pendentes/indeferidas, casos diretos, preventivas, tentativas frustradas, retentativas e rotas vazias. A data de referência é 30/06/2026.

CHECK valida domínios e relações da linha; não garante transições entre estados. O script 03 detecta inconsistências entre tabelas; o script 04 demonstra rejeições em transações revertidas. Não foram criados gatilhos ou políticas de acesso.

## Catálogo das 15 consultas

Q01–Q05 são simples; Q06–Q10 são os cinco INNER JOIN obrigatórios; Q11–Q15 complementam a análise. Os resultados são **esperados e conferidos em SQLite em memória**, não capturas do MySQL. A formatação decimal pode variar. NULL significa ausência de valor. Critérios de desempate tornam a ordem previsível.

### Q01 — Prioridade de casos abertos

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

### Q02 — Busca de endereço

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

### Q03 — Tentativas no período

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

### Q04 — Tipos de imóvel com contato

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

### Q05 — Solicitações em triagem

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

### Q06 — Pessoas e atuação funcional

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

### Q07 — Casos recorrentes por imóvel

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

### Q08 — Distâncias efetivamente registradas

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

### Q09 — Territórios por profissional

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

### Q10 — Depósitos e positividade observada

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

### Q11 — Pontuação acima da média

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

### Q12 — Visitas sem tentativa

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

### Q13 — Rotas sem tarefas

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

### Q14 — Revisões e encaminhamentos

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

### Q15 — Imóvel efetivo da visita

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

### Interpretação dos totais

Q07 usa HAVING para excluir imóveis com apenas um caso. Q08 soma só distâncias de rotas concluídas. Q09 lista vínculos, não concede permissões. Q10 soma quantidades positivas diretamente: 5 depósitos, dos quais 2 positivos, contribuem com 2 positivos, não 5. Positivos e eliminados podem se sobrepor.

Q12 procura ausência de qualquer tentativa: ficha sem acesso também conta como tentativa. Q13 considera a alocação atual/última de visitas, não todo histórico. Q14 preserva o número de tentativa. Q15 resolve o alvo exclusivo.

Não juntar vínculos territoriais a contagens de inspeção sem controlar o nível das linhas: um profissional com cinco territórios pode multiplicar indevidamente cada observação por cinco.
## Execução passo a passo no MySQL

### Preparar

1. Use uma instância de estudo do **MySQL 8.0.16 ou superior**, preferencialmente 8.4. Não use o Supabase/PostgreSQL do aplicativo. O projeto não precisa de site, Node ou Python para executar.
2. Abra o MySQL Workbench e uma conexão local. O Workbench é o cliente; um servidor deve estar disponível. Nenhum servidor foi instalado nesta preparação.
3. Em uma aba SQL, execute `SELECT VERSION(), @@sql_mode;` e registre a versão. Confirme que a conexão é de estudo. MariaDB ou SQLite não comprovam execução em MySQL.
4. A conta precisa de permissão para criar banco e tabelas. O nome novo é **zoonoses_campo_mysql**, separado de **zoonoses_academico**. Antes da criação, execute apenas a consulta de leitura abaixo:

```sql
SELECT SCHEMA_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'zoonoses_campo_mysql';
```

Se retornar uma linha, pare: esse nome já existe. Não execute o arquivo 01 nessa conexão. Use outra instância de estudo ou escolha outro nome e substitua todas as referências nos quatro scripts, inclusive o filtro CONSTRAINT_SCHEMA do arquivo 03. A consulta só mostra esquemas visíveis à conta; o CREATE DATABASE continua sendo a verificação definitiva.

No menu **Query**, habilite **Stop Script Execution On Errors** antes de executar o arquivo 01. Para conferir esse comportamento sem alterar dados, abra uma aba temporária e execute as duas instruções abaixo juntas. A primeira deve falhar; a segunda não deve produzir resultado:

```sql
SELECT 1 + ;
SELECT 'NAO_DEVE_EXECUTAR' AS teste_parada;
```

Se a segunda instrução executar, ajuste a opção de parada e repita o teste antes de prosseguir. Não basta o CREATE DATABASE falhar: um cliente que continua após erros pode executar o USE seguinte e atingir um banco já existente. Esse teste é de configuração do cliente e não faz parte dos nove testes de restrições.

### Criar e povoar

5. No Workbench, clique **File → Open SQL Script** (Arquivo → Abrir script SQL) e abra `sql/01_criacao_povoamento.sql`.
6. Após confirmar nome disponível e parada no primeiro erro, execute o arquivo completo sem selecionar apenas um trecho. Leia a área **Action Output** e não ignore erros.
7. O arquivo contém CREATE DATABASE, 14 CREATE TABLE e INSERT INTO explícitos. O povoamento usa START TRANSACTION e COMMIT. DDL faz commit implícito; falha na criação pode deixar parte do esquema criada.
8. Se um INSERT falhar, interrompa o processamento e execute ROLLBACK na mesma sessão se a transação ainda estiver aberta. Não continue até COMMIT ignorando erros. Não há manipulador automático de exceções no arquivo.
9. Atualize Schemas, expanda zoonoses_campo_mysql e confira suas tabelas. Execute `USE zoonoses_campo_mysql; SHOW TABLES;`.
10. A criação é para a primeira execução em banco vazio, não uma migração. Se o nome já existir, o CREATE DATABASE falha. Não apague bancos automaticamente. Para outro ensaio, use outra instância de estudo ou altere o nome de maneira consistente nos quatro arquivos.

### Conferir

11. Execute `sql/03_verificacao.sql`: contagens devem coincidir com VALIDACAO.md; V01–V15 devem retornar zero linhas. Nessas verificações, zero significa nenhuma inconsistência encontrada.
12. Abra `sql/02_consultas.sql` e execute Q01–Q15 selecionando um SELECT completo por vez. Todas retornam dados na massa original. Compare com CATALOGO_CONSULTAS.md e `resultados/Qxx_esperado.csv`.
13. Examine estruturas com `SHOW CREATE TABLE visita;`, `SHOW CREATE TABLE profissional;` e `SHOW CREATE TABLE inspecao_deposito;`.
14. Abra `sql/04_testes_restricoes.sql`. **Execute um bloco por vez, não o arquivo inteiro automaticamente.** T01–T09 devem gerar rejeições. Se o cliente parar no erro, execute manualmente o ROLLBACK correspondente. T10 verifica padrões e também termina em ROLLBACK.
15. Rode novamente 03_verificacao.sql para confirmar que a massa não mudou. Guarde versão, contagens, resultados e evidências dos erros reais antes de afirmar validação no MySQL.

### Cliente mysql como alternativa

O roteiro principal é o Workbench. Se usar o cliente mysql, faça primeiro as mesmas verificações de conexão de estudo e nome disponível. Execute o arquivo 01 em modo batch, sem --force. No Prompt de Comando do Windows (cmd.exe), a partir da pasta zoonoses_campo_mysql:

```bat
mysql --host=127.0.0.1 --port=3306 --user=SEU_USUARIO --password --default-character-set=utf8mb4 < sql\01_criacao_povoamento.sql
```

Substitua SEU_USUARIO e a porta pelos dados da instância local de estudo. A senha é solicitada pelo cliente; não a escreva na linha de comando. O redirecionamento `<` deste exemplo é do cmd.exe, não do PowerShell. Confira o resultado e o código de saída (`echo %ERRORLEVEL%`) antes de executar qualquer próximo arquivo. Só após sucesso, execute 03 e 02 da mesma maneira, trocando o caminho do arquivo.

Não use --force nem opções/configurações que mandem continuar após erros. Não execute o arquivo 04 em lote: seus erros são esperados e cada bloco precisa de ROLLBACK explícito. A alternativa com SOURCE foi retirada deste guia para evitar confundir execução interativa com a parada em erros do modo batch.

Referências: [parada por erro no Workbench](https://dev.mysql.com/doc/workbench/en/wb-sql-editor-main-menu.html) e [opções do cliente mysql](https://dev.mysql.com/doc/refman/8.4/en/mysql-command-options.html).

### Providências acadêmicas

Preencha nomes completos, docente e semestre após confirmação. O enunciado é de 1/2026 e informa 02/07/2026, enquanto o PDF cita 2/2026. Confirme o calendário e o tema com o docente. O PDF menciona Luis Henrique Souza e Samuel Amaral, mas isso não confirma a identificação final. O repositório público ainda precisa ser criado e enviado pela dupla após revisão; nada foi publicado.
## Validação realizada e limites

Data: 27/10/2026.

**MySQL não executado.** Não foram localizados mysql, mysqld ou Docker no PATH, serviço MySQL/MariaDB na consulta de serviços ou instalação nas pastas usuais verificadas. Isso não prova ausência de qualquer instalação ou servidor remoto. Não houve instalação nem acesso ao banco de produção.

A conferência usou SQLite em memória, convertendo INT AUTO_INCREMENT PRIMARY KEY para INTEGER PRIMARY KEY e removendo ENGINE=InnoDB. A criação/seleção do banco MySQL foi tratada fora do teste auxiliar. FKs permaneceram habilitadas. O teste não certifica collation, DECIMAL, permissões, sintaxe exclusiva ou transações do MySQL.

| Tabela | Registros |
|---|---|
| municipio | 15 |
| pessoa | 40 |
| profissional | 15 |
| profissional_municipio | 76 |
| bairro | 30 |
| imovel | 40 |
| solicitacao | 35 |
| ocorrencia | 30 |
| rota | 25 |
| visita | 45 |
| ficha_visita | 50 |
| revisao_ficha | 15 |
| tipo_deposito | 15 |
| inspecao_deposito | 82 |

**Total: 513 registros.**

- Todos os INSERTs foram aceitos; nenhuma tabela abaixo de 15 registros.
- PRAGMA foreign_key_check não apontou referências inválidas.
- As 15 consultas de negócio retornaram linhas.
- V01–V15 retornaram zero linhas.
- Os nove testes negativos foram rejeitados e revertidos em savepoints.
- Os padrões S em profissional e Planejada em rota foram confirmados e revertidos.

| Consulta | Linhas |
|---|---|
| Q01 | 5 |
| Q02 | 13 |
| Q03 | 17 |
| Q04 | 5 |
| Q05 | 10 |
| Q06 | 15 |
| Q07 | 10 |
| Q08 | 15 |
| Q09 | 76 |
| Q10 | 15 |
| Q11 | 15 |
| Q12 | 5 |
| Q13 | 5 |
| Q14 | 15 |
| Q15 | 45 |

### Erros observados no teste auxiliar

| Teste | Erro SQLite |
|---|---|
| Pontuação fora do domínio | CHECK constraint failed: pontuacao BETWEEN 0 AND 100 |
| Horários invertidos | CHECK constraint failed: ck_ficha_horario |
| Larvas acima do total | CHECK constraint failed: ck_inspecao_limites |
| Dois alvos na mesma visita | CHECK constraint failed: ck_visita_alvo |
| Referência inexistente | FOREIGN KEY constraint failed |
| Email duplicado | UNIQUE constraint failed: pessoa.email |
| Segunda extensão profissional da mesma pessoa | UNIQUE constraint failed: profissional.id_profissional |
| Excluir município referenciado | FOREIGN KEY constraint failed |
| Descrição ausente | NOT NULL constraint failed: ocorrencia.descricao_tecnica |

Não apresentar esses erros como códigos do MySQL. Repita os scripts 03 e 04 no motor obrigatório e registre a versão. As consultas V detectam inconsistências, não impedem gravações. Não existem gatilhos de transição ou autorização.

As FKs declaram ON UPDATE RESTRICT e ON DELETE RESTRICT, evitando cascatas sobre campos usados nos CHECKs. Datas são fixas, com referência operacional em 30/06/2026, para resultados reproduzíveis. Os CSVs são exemplos calculados, não exportações de MySQL.

## Revisão de 05/11/2026

A nova busca não localizou mysql, mysqld, mariadb ou docker no PATH; nenhum serviço com nome/descrição MySQL ou MariaDB; nem processos mysqld, mariadbd ou MySQLWorkbench em execução. Também não foram encontradas as pastas C:\Program Files\MySQL, C:\Program Files (x86)\MySQL, C:\xampp\mysql\bin ou C:\Program Files\MariaDB. Isso não exclui uma instalação em outro caminho ou um servidor remoto. Nenhum servidor foi acessado, instalado ou configurado.

O teste auxiliar em SQLite foi repetido a partir dos SQLs entregues: 14 tabelas, 513 registros, 15 consultas iguais aos CSVs, 15 verificações sem inconsistências, nove rejeições esperadas e dois valores padrão confirmados. Os testes foram revertidos, sem alteração da massa.

Foi corrigida uma lacuna no guia de execução: conferir previamente o nome do banco e habilitar/testar a parada no primeiro erro antes do script de criação. A alternativa de terminal agora usa modo batch. O relatório incorpora as mesmas instruções. Os arquivos SQL 01 e 04 tiveram apenas comentários ajustados; comandos, estrutura e dados permanecem iguais aos da entrega anterior.

O guia Draw.io foi conferido contra os nomes e a quantidade de campos das 14 tabelas. O editável tem quatro páginas com 21/6/12/6 ligações e não foi aberto no editor nesta revisão. Não foram encontradas divergências que exigissem alterar o guia ou os diagramas. Os arquivos do projeto antigo continuam idênticos ao ZIP original.

**MySQL segue não executado.** Próximo passo: disponibilizar uma instância local de estudo MySQL 8.0.16+ e seguir EXECUCAO_MYSQL.md. Não é necessário fornecer senha nesta documentação. Os resultados auxiliares não substituem a validação no MySQL.

## Discussão

A principal dificuldade de modelagem foi preservar distinções próximas: solicitação não é caso, visita não é tentativa e revisão não conclui automaticamente a ocorrência. A escolha de alvo exclusivo evita cópia transitiva do imóvel na visita. A contagem positiva direta evita supor que todos os depósitos de um tipo tenham larvas a partir de um indicador sim/não.

Não há histórico completo de replanejamento, alterações cadastrais ou autorização. As verificações não substituem um fluxo transacional. A conferência auxiliar não certifica o MySQL; a dupla deve executar os scripts e registrar evidências no motor exigido.

## Considerações finais

O modelo organiza vigilância e trabalho de campo em 14 relações com responsabilidades definidas. As chaves permitem acompanhar a origem do caso, suas tarefas, tentativas e inspeções, mantendo pessoas e territórios em cadastros próprios. A normalização reduz repetição e explicita as dependências usadas nas consultas.

O trabalho entrega scripts, dados, consultas com exemplos, verificações, documentação e guia para desenhar o DER. Evoluções possíveis incluem histórico de estados e rotas, controle transacional, laboratório e arquivos de campo, preservando a integridade e o escopo explicável pela dupla. Aprovação do tema, identificação, calendário, execução MySQL e publicação acadêmica seguem como providências a confirmar.

## Referências

- AFYA. Projeto Final da Disciplina, enunciado fornecido, 1/2026.
- Zoonoses+ — Projeto Final de Banco de Dados. Apresentação fornecida como referência, 26 páginas.
- Código local Zoonoses+, módulos e migrations descritos em [FONTES_E_ESCOPO.md](FONTES_E_ESCOPO.md).
- Oracle. [MySQL 8.4 — CREATE TABLE](https://dev.mysql.com/doc/refman/8.4/en/create-table.html).
- Oracle. [MySQL 8.4 — FOREIGN KEY](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html).
- Oracle. [MySQL 8.4 — CHECK](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html).
- Oracle. [MySQL 8.4 — funções de agregação](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html).
- draw.io. [Notação pé de galinha](https://www.drawio.com/docs/tutorials/crows-foot-notation/).
- draw.io. [Formatos de exportação](https://www.drawio.com/docs/manual/export/export-diagram/).

Consulta documental em 27/10/2026. Assistência de IA utilizada na preparação e conferência. A dupla deve revisar e compreender cada comando, conforme permitido no enunciado.

## Revisão visual do DER — 05/11/2026

As quatro páginas do DER foram corrigidas no arquivo [editável revisado](diagramas/zoonoses_campo_revisado.drawio). Cada entidade agora possui cabeçalho e três colunas com células independentes: Chave, Atributo e Tipo. Os nomes, tipos e as 21 relações do modelo completo foram preservados. As imagens incorporadas acima foram substituídas pelas imagens geradas a partir da renderização real no Draw.io. Consulte o [registro da conferência](diagramas/conferencia_editor/VALIDACAO_DIAGRAMA.md).

Atualização recebida no chat: MySQL 8.0.46 instalado e scripts 01/03/02 executados pelo usuário; imagens confirmaram 14 tabelas/513 registros e rejeições T01–T03. Os demais testes e as contagens após testes foram relatados pelo usuário. Não se afirma verificação individual dos demais testes nesta revisão visual. As notas de ausência do motor registram a situação anterior.

## Complemento de 06/11/2026 — quatro ajustes do DER

O editável revisado e as imagens PNG/SVG contêm notas de unicidade composta junto às respectivas tabelas: municipio(nome, uf), bairro(id_municipio, nome), visita(id_rota, ordem_rota) e ficha_visita(id_visita, numero_tentativa). Essas notas representam UNIQUE composto, sem tornar cada coluna individualmente única.

Junto a visita consta: “Exatamente um alvo: ocorrência OU imóvel preventivo. Nunca ambos; nunca nenhum.” As páginas de detalhe identificam-se como recortes e remetem as relações externas ao DER completo. R17 usa o verbo “executa”; R21 usa “revisa”. Permanecem quatro páginas, 14 tabelas e 21 relações na página completa, sem alteração no SQL ou nos tipos.

As notas acrescentam 25 pixels por linha à altura das caixas. Para reproduzir as posições e alturas finais, use o editável revisado como referência; as coordenadas anteriores deste documento descrevem a base anterior às notas.

O XML e as imagens finais foram conferidos nesta conclusão. A evidência de abertura no Draw.io em conferencia_editor registra a sessão anterior; não houve nova sessão interativa do editor nesta etapa. As notas e rótulos estão presentes nos PNG/SVG atuais, inclusive no detalhe de tentativas inspecionado visualmente.

## Protótipo funcional e teste isolado — 06/11/2026

O protótipo em ../zoonoses_prototipo_mysql foi validado em MySQL 8.0.46 isolado, porta 3307. O teste confirmou massa inicial de 14 tabelas e 513 registros; executou o ciclo solicitação, ocorrência, rota, visita sem acesso, revisão, retorno com inspeção e conclusão; verificou transações, concorrência, autenticação e as 15 consultas de coerência vazias ao final. Evidência: ../zoonoses_prototipo_mysql/docs/resultado-testes-mysql.json. Isso complementa os testes auxiliares históricos acima, sem representar acesso independente ao banco pessoal na porta 3306. O schema acadêmico foi preservado.
