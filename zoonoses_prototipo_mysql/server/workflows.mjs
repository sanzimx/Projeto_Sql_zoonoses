import {ensure,id,normalize,validateDeposit,stamp,validDate} from './domain.mjs';
import {transaction,rows,one,insert,change} from './db.mjs';
import {randomBytes} from 'node:crypto';
export const code=(prefix)=>prefix+'-'+Date.now().toString(36).toUpperCase()+'-'+randomBytes(2).toString('hex').toUpperCase();
async function professional(c,value,{manager=false,municipality,at}={}){
 const p=await one(c,'SELECT * FROM profissional WHERE id_profissional=? FOR UPDATE',[id(value)]);
 ensure(p&&p.ativo==='S','Profissional inexistente ou inativo.');
 if(at)ensure(p.admissao<=at.slice(0,10),'A execução não pode ser anterior à admissão.');
 if(manager)ensure(['Supervisor','Administrador'].includes(p.cargo),'A decisão exige supervisor ou administrador.');
 if(municipality){const v=await one(c,'SELECT * FROM profissional_municipio WHERE id_profissional=? AND id_municipio=?',[p.id_profissional,municipality]);ensure(v&&(!at||v.vinculado_em<=at.slice(0,10)),'O profissional não possui vínculo territorial válido para a data.');}
 return p;
}
async function property(c,value){
 const p=await one(c,'SELECT i.*, b.id_municipio FROM imovel i JOIN bairro b ON b.id_bairro=i.id_bairro WHERE i.id_imovel=?',[id(value)]);
 ensure(p,'Imóvel não encontrado.',404);return p;
}
async function target(c,v){
 if(v.id_ocorrencia){const o=await one(c,'SELECT * FROM ocorrencia WHERE id_ocorrencia=?',[v.id_ocorrencia]);ensure(o,'Ocorrência não encontrada.');return {property:await property(c,o.id_imovel),occurrence:o};}
 return {property:await property(c,v.id_imovel_preventivo),occurrence:null};
}
export async function triage(sid,b){
 return transaction(async c=>{
  const s=await one(c,'SELECT * FROM solicitacao WHERE id_solicitacao=? FOR UPDATE',[id(sid)]);
  ensure(s&&s.situacao==='Pendente','A solicitação não está pendente.',409);
  await professional(c,b.id_analista,{manager:true});ensure(typeof b.parecer==='string'&&b.parecer.trim().length>0&&b.parecer.length<=200,'Informe o parecer, até 200 caracteres.');
  const now=(await one(c,"SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS value")).value;
  ensure(now>=s.recebida_em,'Recebimento posterior à análise.');
  ensure(['Convertida','Indeferida'].includes(b.decisao),'Decisão inválida.');
  let oid=null;
  if(b.decisao==='Convertida'){
   await property(c,b.id_imovel);
   const data=normalize('ocorrencia',{protocolo:code('OC'),id_solicitacao:s.id_solicitacao,id_imovel:b.id_imovel,categoria:b.categoria,descricao_tecnica:b.descricao_tecnica,pontuacao:b.pontuacao,aberta_em:now,situacao:'Aberta'});
   ensure(data.pontuacao<=100,'Pontuação deve estar entre 0 e 100.');
   oid=await insert(c,'ocorrencia',data);
  }
  await change(c,'solicitacao',{id_solicitacao:s.id_solicitacao},{situacao:b.decisao,id_analista:id(b.id_analista),analisada_em:now,parecer:b.parecer.trim()});
  return {ok:true,id_ocorrencia:oid};
 });
}
export async function createVisit(b){
 return transaction(async c=>{
  const data=normalize('visita',{codigo:code('VIS'),id_ocorrencia:b.id_ocorrencia||null,id_imovel_preventivo:b.id_imovel_preventivo||null,id_rota:null,ordem_rota:null,criada_em:(await one(c,"SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS value")).value,objetivo:b.objetivo,situacao:'Pendente'});
  ensure(Boolean(data.id_ocorrencia)!==Boolean(data.id_imovel_preventivo),'Escolha exatamente um alvo para a visita.');
  const t=await target(c,data);ensure(!t.occurrence||['Aberta','Em acompanhamento'].includes(t.occurrence.situacao),'A ocorrência já está encerrada.');
  return {id:await insert(c,'visita',data)};
 });
}
export async function schedule(vid,b){
 return transaction(async c=>{
  const v=await one(c,'SELECT * FROM visita WHERE id_visita=? FOR UPDATE',[id(vid)]);ensure(v,'Visita não encontrada.',404);
  ensure(['Pendente','Agendada'].includes(v.situacao),'Essa visita não pode ser agendada neste estado.',409);
  const route=await one(c,'SELECT * FROM rota WHERE id_rota=? FOR UPDATE',[id(b.id_rota)]);ensure(route&&route.situacao==='Planejada','Escolha uma rota planejada.');
  ensure(route.data_rota>=v.criada_em.slice(0,10),'A rota não pode ser anterior à criação da visita.');
  const t=await target(c,v);ensure(!t.occurrence||['Aberta','Em acompanhamento'].includes(t.occurrence.situacao),'Ocorrência encerrada.');
  await professional(c,route.id_profissional,{municipality:t.property.id_municipio,at:route.data_rota});
  const last=await one(c,'SELECT f.*, r.decisao, r.retorno_previsto FROM ficha_visita f LEFT JOIN revisao_ficha r ON r.id_ficha=f.id_ficha WHERE f.id_visita=? ORDER BY f.numero_tentativa DESC LIMIT 1',[v.id_visita]);
  if(last)ensure(last.decisao==='Retornar'&&route.data_rota>=last.retorno_previsto,'A rota deve respeitar a autorização e a data de retorno.');
  await change(c,'visita',{id_visita:v.id_visita},{id_rota:route.id_rota,ordem_rota:id(b.ordem_rota),situacao:'Agendada'});
  return {ok:true};
 });
}
export async function registerAttempt(vid,b){
 return transaction(async c=>{
  const v=await one(c,'SELECT * FROM visita WHERE id_visita=? FOR UPDATE',[id(vid)]);ensure(v,'Visita não encontrada.',404);
  ensure(['Pendente','Agendada'].includes(v.situacao),'A visita está encerrada ou aguarda revisão.',409);
  const t=await target(c,v);ensure(!t.occurrence||['Aberta','Em acompanhamento'].includes(t.occurrence.situacao),'Ocorrência encerrada.');
  const last=await one(c,'SELECT * FROM ficha_visita WHERE id_visita=? ORDER BY numero_tentativa DESC LIMIT 1 FOR UPDATE',[v.id_visita]);
  const data=normalize('ficha_visita',{id_visita:v.id_visita,numero_tentativa:(last?.numero_tentativa||0)+1,id_executor:b.id_executor,entrada_em:b.entrada_em,saida_em:b.saida_em,resultado:b.resultado,recebido_por:b.recebido_por||null,orientacao:b.orientacao||null,observacoes:b.observacoes});
  ensure(data.entrada_em>=v.criada_em&&data.saida_em>data.entrada_em,'Confira os horários: início após a criação e saída após a entrada.');
  const now=(await one(c,"SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS value")).value;ensure(data.saida_em<=now,'Uma tentativa finalizada não pode estar no futuro.');
  await professional(c,data.id_executor,{municipality:t.property.id_municipio,at:data.entrada_em});
  if(last){
   const rev=await one(c,'SELECT * FROM revisao_ficha WHERE id_ficha=?',[last.id_ficha]);
   ensure(rev?.decisao==='Retornar'&&data.entrada_em.slice(0,10)>=rev.retorno_previsto&&data.entrada_em>=rev.revisada_em&&data.entrada_em>last.saida_em,'O retorno deve respeitar a revisão e os horários anteriores.');
  }
  ensure(Array.isArray(b.depositos)&&b.depositos.length<=100,'Lista de depósitos inválida.');
  ensure(data.resultado==='Inspecionada'||b.depositos.length===0,'Tentativa sem inspeção não pode registrar depósitos.');
  const deposits=b.depositos.map(validateDeposit);ensure(new Set(deposits.map(d=>d.id_tipo_deposito)).size===deposits.length,'Não repita o tipo de depósito na mesma ficha.');
  const fid=await insert(c,'ficha_visita',data);
  for(const d of deposits)await insert(c,'inspecao_deposito',{id_ficha:fid,...d});
  await change(c,'visita',{id_visita:v.id_visita},{situacao:data.resultado==='Inspecionada'?'Concluida':'Aguardando revisao'});
  if(v.id_ocorrencia)await change(c,'ocorrencia',{id_ocorrencia:v.id_ocorrencia},{situacao:'Em acompanhamento'});
  return {id_ficha:fid};
 });
}
export async function review(fid,b){
 return transaction(async c=>{
  // Lock order: visit, then its attempt, as in registerAttempt.
  const found=await one(c,'SELECT id_visita FROM ficha_visita WHERE id_ficha=?',[id(fid)]);ensure(found,'Ficha não encontrada.',404);
  const v=await one(c,'SELECT * FROM visita WHERE id_visita=? FOR UPDATE',[found.id_visita]);
  const f=await one(c,'SELECT * FROM ficha_visita WHERE id_ficha=? FOR UPDATE',[id(fid)]);
  ensure(v.situacao==='Aguardando revisao'&&f.resultado!=='Inspecionada','Esta ficha não aguarda revisão.',409);
  const latest=await one(c,'SELECT MAX(numero_tentativa) AS n FROM ficha_visita WHERE id_visita=?',[v.id_visita]);ensure(f.numero_tentativa===latest.n,'Somente a última tentativa pode ser revisada.');
  const t=await target(c,v);await professional(c,b.id_revisor,{manager:true,municipality:t.property.id_municipio});
  ensure(id(b.id_revisor)!==f.id_executor,'O executor não pode revisar a própria ficha.');
  const now=(await one(c,"SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS value")).value;
  const data=normalize('revisao_ficha',{id_ficha:f.id_ficha,id_revisor:b.id_revisor,revisada_em:now,decisao:b.decisao,parecer:b.parecer,retorno_previsto:b.decisao==='Retornar'?b.retorno_previsto:null});
  ensure(now>=f.saida_em,'A revisão não pode preceder a tentativa.');
  ensure(data.decisao!=='Retornar'||data.retorno_previsto>=now.slice(0,10),'O retorno não pode ser anterior à revisão.');
  await insert(c,'revisao_ficha',data);
  await change(c,'visita',{id_visita:v.id_visita},{situacao:data.decisao==='Retornar'?'Pendente':'Arquivada',...(data.decisao==='Retornar'?{id_rota:null,ordem_rota:null}:{})});
  return {ok:true};
 });
}
export async function closeCase(oid){
 return transaction(async c=>{
  const o=await one(c,'SELECT * FROM ocorrencia WHERE id_ocorrencia=? FOR UPDATE',[id(oid)]);ensure(o&&['Aberta','Em acompanhamento'].includes(o.situacao),'Ocorrência não está aberta.',409);
  const visits=await rows(c,'SELECT * FROM visita WHERE id_ocorrencia=? FOR UPDATE',[o.id_ocorrencia]);
  ensure(visits.some(v=>v.situacao==='Concluida'),'É necessária uma visita concluída.');
  ensure(visits.every(v=>['Concluida','Arquivada'].includes(v.situacao)),'Há visitas pendentes nesta ocorrência.');
  await change(c,'ocorrencia',{id_ocorrencia:o.id_ocorrencia},{situacao:'Concluida'});return {ok:true};
 });
}
export async function closeRoute(rid,b){
 return transaction(async c=>{
  const route=await one(c,'SELECT * FROM rota WHERE id_rota=? FOR UPDATE',[id(rid)]);ensure(route?.situacao==='Planejada','A rota não está planejada.',409);
  const visits=await rows(c,'SELECT * FROM visita WHERE id_rota=? FOR UPDATE',[route.id_rota]);ensure(visits.length,'A rota não possui visitas.');
  for(const v of visits){const attempt=await one(c,'SELECT id_ficha FROM ficha_visita WHERE id_visita=? AND DATE(entrada_em)=? LIMIT 1',[v.id_visita,route.data_rota]);ensure(attempt,'Todas as visitas da rota precisam de tentativa no dia planejado.');}
  const data=normalize('rota',{distancia_km:b.distancia_km},{partial:true});ensure(data.distancia_km!==null&&data.distancia_km!==undefined,'Informe a distância realizada.');
  await change(c,'rota',{id_rota:route.id_rota},{situacao:'Concluida',distancia_km:data.distancia_km});return {ok:true};
 });
}
