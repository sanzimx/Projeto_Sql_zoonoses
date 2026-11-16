# Conferência do diagrama corrigido — 05/11/2026

## Causa e correção

O arquivo anterior guardava vários campos em um único atributo XML, com quebras de linha literais. A leitura do XML normaliza essas quebras para espaços, causando concatenação. A imagem anterior renderizada por outra ferramenta não revelou esse defeito do arquivo editável.

O revisado usa um contêiner por entidade, cabeçalho separado e células independentes para Chave, Atributo e Tipo. Cada atributo tem sua própria linha. Largura de 480; colunas de 76/263/141; linhas de 27; fonte Arial 14. Os conectores têm caminhos ortogonais explícitos, símbolos ER e rótulos vinculados às próprias ligações.

## Verificação real

O arquivo multipágina final foi carregado em https://app.diagrams.net/ em uma sessão isolada de Chrome headless. As quatro abas foram abertas pela interface. Foram capturadas vistas ajustadas e vistas a 100%, e inspecionadas as imagens. Todos os nomes de atributos e tipos foram encontrados no SVG renderizado pelo editor; a largura medida dos textos cabe nas respectivas colunas.

Os PNG/SVG distribuídos foram extraídos do SVG efetivamente produzido pelo Draw.io e rasterizados no Chrome, sem usar a imagem do gerador anterior como prova. As capturas a 100% mostram recortes da área de trabalho; os arquivos PNG principais mostram cada página inteira.

| Página | Entidades | Relações | Evidência ajustada | Evidência a 100% |
|---|---:|---:|---|---|
| DER completo | 14 | 21 | [ajuste](der_completo_ajuste.png) | [100%](der_completo_100.png) |
| Território e pessoas | 6 | 6 | [ajuste](territorio_pessoas_ajuste.png) | [100%](territorio_pessoas_100.png) |
| Demanda e programação | 8 | 12 | [ajuste](demanda_visitas_ajuste.png) | [100%](demanda_visitas_100.png) |
| Tentativas e inspeções | 6 | 6 | [ajuste](tentativas_inspecao_ajuste.png) | [100%](tentativas_inspecao_100.png) |

Também foram conferidos nomes, tipos, PK/FK/UQ, nulabilidade, origem/destino e cardinalidades de todas as relações no XML. Os quatro arquivos SQL são idênticos byte a byte aos do ZIP anterior à correção visual. O projeto antigo zoonoses_academico foi preservado.

## Reabrir

No Draw.io, use Arquivo → Abrir de → Dispositivo e escolha **zoonoses_campo_revisado.drawio**, na pasta diagramas. O arquivo zoonoses_campo.drawio também contém a correção. Ambos têm quatro páginas e conteúdo idêntico. A aba antiga aberta no navegador não se atualiza quando o arquivo do disco é substituído.

Use as páginas de detalhe para leitura e apresentação; a visão geral exige ampliação para ler todos os atributos. Ao mover entidades manualmente, ajuste os pontos de dobra dos conectores se necessário. A cópia anterior está preservada fora da entrega, no ZIP zoonoses_campo_diagramas_antes_correcao_20261105.zip, na pasta Projeto_SQL.

## Complemento de 06/11/2026 — quatro ajustes do DER

O editável revisado e as imagens PNG/SVG contêm notas de unicidade composta junto às respectivas tabelas: municipio(nome, uf), bairro(id_municipio, nome), visita(id_rota, ordem_rota) e ficha_visita(id_visita, numero_tentativa). Essas notas representam UNIQUE composto, sem tornar cada coluna individualmente única.

Junto a visita consta: “Exatamente um alvo: ocorrência OU imóvel preventivo. Nunca ambos; nunca nenhum.” As páginas de detalhe identificam-se como recortes e remetem as relações externas ao DER completo. R17 usa o verbo “executa”; R21 usa “revisa”. Permanecem quatro páginas, 14 tabelas e 21 relações na página completa, sem alteração no SQL ou nos tipos.

As notas acrescentam 25 pixels por linha à altura das caixas. Para reproduzir as posições e alturas finais, use o editável revisado como referência; as coordenadas anteriores deste documento descrevem a base anterior às notas.

O XML e as imagens finais foram conferidos nesta conclusão. A evidência de abertura no Draw.io em conferencia_editor registra a sessão anterior; não houve nova sessão interativa do editor nesta etapa. As notas e rótulos estão presentes nos PNG/SVG atuais, inclusive no detalhe de tentativas inspecionado visualmente.
