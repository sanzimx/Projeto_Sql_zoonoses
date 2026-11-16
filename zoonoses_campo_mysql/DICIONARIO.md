# Dicionário de dados

PK identifica a linha; FK referencia outra tabela; UQ significa UNIQUE. Todos os IDs são internos e estáveis. Todas as FKs declaram **ON UPDATE RESTRICT ON DELETE RESTRICT**: alteração de identificadores referenciados e exclusão de pais com dependentes são bloqueadas. Não há exclusão automática de histórico. Esta escolha evita depender de cascatas sobre colunas usadas em CHECKs de vínculo opcional.

NULL é ausência de informação. Estados usam valores sem acentos para facilitar digitação; textos admitem UTF-8. Horários da massa são locais de Minas Gerais, sem conversão automática de fuso em DATETIME.

## municipio

Município do território de atuação; catálogo geográfico didático. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_municipio | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| nome | VARCHAR(80) | — | NOT NULL | Nome do município. |
| uf | CHAR(2) | — | NOT NULL DEFAULT 'MG' | Unidade federativa. |

Restrições de tabela:

- `CONSTRAINT uq_municipio UNIQUE (nome, uf)`

## pessoa

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

## profissional

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

## profissional_municipio

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

## bairro

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

## imovel

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

## solicitacao

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

## ocorrencia

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

## rota

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

## visita

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

## ficha_visita

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

## tipo_deposito

Catálogo didático de recipientes e estruturas inspecionáveis; não é uma lista oficial PNCD. **Massa: 15 registros.**

| Campo | Tipo | Chaves | Restrições de coluna | Significado |
|---|---|---|---|---|
| id_tipo_deposito | INT | PK | AUTO_INCREMENT PRIMARY KEY | Identificador interno, gerado automaticamente. |
| nome | VARCHAR(80) | UQ | NOT NULL UNIQUE | Tipo de depósito. |
| descricao | VARCHAR(200) | — | NOT NULL | Definição operacional para evitar sobreposição na contagem. |

Restrições de tabela:

- Nenhuma além das colunas.

## inspecao_deposito

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

## revisao_ficha

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

