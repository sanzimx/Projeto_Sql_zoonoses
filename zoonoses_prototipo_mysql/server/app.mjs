import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {schema,ensure,id,normalize,editable,managed,AppError} from './domain.mjs';
import {getPool,transaction,rows,one,insert,change} from './db.mjs';
import {makeAuth,authPath} from './auth.mjs';
import * as flow from './workflows.mjs';
import reports from './reports.json' with {type:'json'};
const labels=['Ocorrências prioritárias','Solicitações por endereço','Ocorrências por período','Tipos de imóvel','Solicitações pendentes','Profissionais e pessoas','Reincidência por imóvel','Distâncias por profissional','Atuação por município','Inspeções por depósito','Ocorrências acima da média','Visitas sem tentativa','Rotas sem visitas','Revisões de fichas','Alvos das visitas'];
const controlled={solicitacao:['situacao','id_analista','analisada_em','parecer'],ocorrencia:['situacao','id_solicitacao'],rota:['situacao','distancia_km'],visita:['situacao','id_rota','ordem_rota']};
const canDelete=new Set(['municipio','pessoa','profissional','profissional_municipio','bairro','imovel','tipo_deposito']);
const parseKey=(t,str)=>{const parts=str.split(',');ensure(parts.length===schema[t].keys.length,'Chave inválida.');return Object.fromEntries(schema[t].keys.map((k,i)=>[k,id(parts[i])]));};
const where=k=>Object.keys(k).map(c=>c+'=?').join(' AND ');
export function makeApp(){
 const publicUrl=process.env.PUBLIC_URL?new URL(process.env.PUBLIC_URL):null;
 if(publicUrl&&(publicUrl.protocol!=='https:'||publicUrl.username||publicUrl.password||publicUrl.pathname!=='/'||publicUrl.search||publicUrl.hash))throw new Error('PUBLIC_URL deve ser a origem HTTPS do site.');
 const app=express(),auth=makeAuth();app.disable('x-powered-by');
 app.use((req,res,next)=>{
  const host=req.headers.host||'';
  const allowedHost=publicUrl?host===publicUrl.host:/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host);
  if(!allowedHost)return res.status(403).json({error:'Endereço não permitido.'});
  const origins=publicUrl?[publicUrl.origin]:['127.0.0.1','localhost'].flatMap(host=>[process.env.PORT||'4310','5173'].map(port=>'http://'+host+':'+port));
  if(req.headers.origin&&!origins.includes(req.headers.origin))return res.status(403).json({error:'Origem não permitida.'});
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
 });
 app.use(express.json({limit:'128kb'}));
 app.get('/api/health',(req,res)=>res.json({configured:Boolean(process.env.DB_USER&&process.env.DB_PASSWORD&&process.env.DB_NAME&&(auth.direct||fs.existsSync(authPath()))),service:'Zoonoses+ MySQL'}));
 if(!auth.direct)app.post('/api/login',auth.login);
 app.use('/api',auth.guard);
 app.get('/api/session',(req,res)=>res.json({username:req.operator.username,csrf:req.operator.csrf,direct:auth.direct}));
 if(!auth.direct)app.post('/api/logout',auth.logout);
 app.get('/api/meta',(req,res)=>res.json({tables:schema,editable,controlled,managed,canDelete:[...canDelete],reports:labels}));
 app.get('/api/dashboard',async(req,res)=>{
  const db=getPool();const counts={};
  for(const n of Object.keys(schema)){counts[n]=(await one(db,'SELECT COUNT(*) AS n FROM '+n)).n;}
  const statuses=await rows(db,'SELECT situacao,COUNT(*) AS total FROM visita GROUP BY situacao');
  const pending=await rows(db,"SELECT id_solicitacao,protocolo,descricao,recebida_em FROM solicitacao WHERE situacao='Pendente' ORDER BY recebida_em LIMIT 6");
  const cases=await rows(db,"SELECT id_ocorrencia,protocolo,categoria,pontuacao,situacao FROM ocorrencia WHERE situacao IN ('Aberta','Em acompanhamento') ORDER BY pontuacao DESC LIMIT 6");
  const [version]=await rows(db,'SELECT VERSION() AS version');
  res.json({counts,statuses,pending,cases,version:version.version});
 });
 app.get('/api/lookups',async(req,res)=>{
  const db=getPool(),out={};const sources={
   municipio:"SELECT id_municipio AS id,CONCAT(nome,' / ',uf) AS label FROM municipio",
   pessoa:"SELECT id_pessoa AS id,CONCAT(nome,' · #',id_pessoa) AS label FROM pessoa",
   profissional:"SELECT p.id_profissional AS id,CONCAT(s.nome,' · ',p.cargo,IF(p.ativo='S','',' · inativo')) AS label,p.cargo,p.ativo FROM profissional p JOIN pessoa s ON s.id_pessoa=p.id_profissional",
   bairro:"SELECT b.id_bairro AS id,CONCAT(b.nome,' · ',m.nome) AS label FROM bairro b JOIN municipio m ON m.id_municipio=b.id_municipio",
   imovel:"SELECT id_imovel AS id,CONCAT(inscricao,' · ',logradouro,', ',numero) AS label FROM imovel",
   solicitacao:"SELECT id_solicitacao AS id,protocolo AS label FROM solicitacao",
   ocorrencia:"SELECT id_ocorrencia AS id,CONCAT(protocolo,' · ',situacao) AS label FROM ocorrencia",
   rota:"SELECT id_rota AS id,CONCAT(codigo,' · ',data_rota,' · ',situacao) AS label FROM rota",
   visita:"SELECT id_visita AS id,CONCAT(codigo,' · ',situacao) AS label FROM visita",
   ficha_visita:"SELECT id_ficha AS id,CONCAT('Ficha #',id_ficha,' · ',resultado) AS label FROM ficha_visita",
   tipo_deposito:"SELECT id_tipo_deposito AS id,nome AS label FROM tipo_deposito"
  };
  for(const [k,q] of Object.entries(sources))out[k]=await rows(db,q+' ORDER BY id LIMIT 2000');
  res.json(out);
 });
 app.get('/api/tables/:table',async(req,res)=>{
  const t=req.params.table;ensure(schema[t],'Cadastro não encontrado.',404);
  const page=Math.min(100000,Math.max(1,Math.floor(Number(req.query.page)||1))),limit=30,search=String(req.query.q||'').slice(0,100);
  const cols=schema[t].columns.filter(c=>c.type.startsWith('VARCHAR')||c.type==='INT').map(c=>c.name);
  const filters=search?' WHERE '+cols.map(c=>'CAST('+c+' AS CHAR) LIKE ?').join(' OR '):'';
  const args=search?cols.map(()=>'%'+search.replaceAll('\\','\\\\').replaceAll('%','\\%').replaceAll('_','\\_')+'%'):[];
  const db=getPool();const count=(await one(db,'SELECT COUNT(*) AS n FROM '+t+filters,args)).n;
  const projection=t==='ficha_visita'?'*, EXISTS(SELECT 1 FROM revisao_ficha r WHERE r.id_ficha=ficha_visita.id_ficha) AS revisada':'*';
  const data=await rows(db,'SELECT '+projection+' FROM '+t+filters+' ORDER BY '+schema[t].keys.join(',')+' LIMIT '+limit+' OFFSET '+((Math.floor(page)-1)*limit),args);
  res.json({rows:data,total:count,page:Math.floor(page),pages:Math.max(1,Math.ceil(count/limit))});
 });
 app.post('/api/tables/:table',async(req,res)=>{
  const t=req.params.table;ensure(schema[t],'Cadastro não encontrado.',404);ensure(!managed.includes(t),'Use o fluxo de campo para registrar esta informação.');
  if(t==='visita')return res.status(201).json(await flow.createVisit(req.body));
  const result=await transaction(async c=>{
   const body={...req.body};
   for(const k of controlled[t]||[])ensure(!(k in body),'O campo '+k+' é controlado pelo fluxo.');
   const now=(await one(c,"SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS value")).value;
   if(t==='solicitacao')Object.assign(body,{protocolo:body.protocolo||flow.code('SOL'),recebida_em:now,situacao:'Pendente',id_analista:null,analisada_em:null,parecer:null});
   if(t==='ocorrencia')Object.assign(body,{protocolo:body.protocolo||flow.code('OC'),aberta_em:now,situacao:'Aberta',id_solicitacao:null});
   if(t==='rota')Object.assign(body,{codigo:body.codigo||flow.code('ROT'),situacao:'Planejada',distancia_km:null});
   const clean=normalize(t,body);if(t==='ocorrencia')ensure(clean.pontuacao<=100,'Pontuação deve estar entre 0 e 100.');
   if(t==='rota'){const p=await one(c,"SELECT ativo FROM profissional WHERE id_profissional=?",[clean.id_profissional]);ensure(p?.ativo==='S','O responsável pela rota deve estar ativo.');}
   return {id:await insert(c,t,clean)};
  });res.status(201).json(result);
 });
 app.patch('/api/tables/:table/:key',async(req,res)=>{
  const t=req.params.table;ensure(schema[t],'Cadastro não encontrado.',404);const key=parseKey(t,req.params.key);
  ensure(Object.keys(req.body).every(k=>editable[t].includes(k)),'Há campos que somente o fluxo pode alterar.');
  const values=normalize(t,req.body,{partial:true});
  await transaction(async c=>{
   const old=await one(c,'SELECT * FROM '+t+' WHERE '+where(key)+' FOR UPDATE',Object.values(key));ensure(old,'Registro não encontrado.',404);
   if(t==='solicitacao')ensure(old.situacao==='Pendente','Uma solicitação analisada não pode ser editada.');
   if(t==='ocorrencia'){ensure(['Aberta','Em acompanhamento'].includes(old.situacao),'Ocorrência encerrada.');if(values.pontuacao!==undefined)ensure(values.pontuacao<=100,'Pontuação deve estar entre 0 e 100.');}
   if(t==='rota'){ensure(old.situacao==='Planejada','Rota encerrada.');const count=await one(c,'SELECT COUNT(*) AS n FROM visita WHERE id_rota=?',[old.id_rota]);ensure(!count.n||!values.data_rota||values.data_rota===old.data_rota,'Crie outra rota para mudar a data de visitas já vinculadas.');}
   if(t==='profissional'&&(values.cargo||values.admissao)){
    const used=await one(c,'SELECT (SELECT COUNT(*) FROM ficha_visita WHERE id_executor=?)+(SELECT COUNT(*) FROM revisao_ficha WHERE id_revisor=?)+(SELECT COUNT(*) FROM solicitacao WHERE id_analista=?) AS n',[old.id_profissional,old.id_profissional,old.id_profissional]);
    ensure(!used.n||((!values.cargo||values.cargo===old.cargo)&&(!values.admissao||values.admissao===old.admissao)),'Função e admissão de profissional com histórico ficam preservadas.');
   }
   await change(c,t,key,values);
  });res.json({ok:true});
 });
 app.delete('/api/tables/:table/:key',async(req,res)=>{
  const t=req.params.table;ensure(canDelete.has(t),'Histórico operacional não pode ser excluído.');const key=parseKey(t,req.params.key);
  await transaction(async c=>{
   if(t==='profissional_municipio'){
    const found=await one(c,'SELECT f.id_ficha FROM ficha_visita f JOIN visita v ON v.id_visita=f.id_visita LEFT JOIN ocorrencia o ON o.id_ocorrencia=v.id_ocorrencia JOIN imovel i ON i.id_imovel=COALESCE(o.id_imovel,v.id_imovel_preventivo) JOIN bairro b ON b.id_bairro=i.id_bairro WHERE f.id_executor=? AND b.id_municipio=? LIMIT 1',[key.id_profissional,key.id_municipio]);
    ensure(!found,'O vínculo territorial já possui histórico de execução.');
   }
   const [result]=await c.execute('DELETE FROM '+t+' WHERE '+where(key),Object.values(key));ensure(result.affectedRows,'Registro não encontrado.',404);
  });res.json({ok:true});
 });
 app.post('/api/solicitacoes/:id/triagem',async(req,res)=>res.json(await flow.triage(req.params.id,req.body)));
 app.post('/api/visitas/:id/agendamento',async(req,res)=>res.json(await flow.schedule(req.params.id,req.body)));
 app.post('/api/visitas/:id/fichas',async(req,res)=>res.status(201).json(await flow.registerAttempt(req.params.id,req.body)));
 app.post('/api/fichas/:id/revisao',async(req,res)=>res.json(await flow.review(req.params.id,req.body)));
 app.post('/api/ocorrencias/:id/concluir',async(req,res)=>res.json(await flow.closeCase(req.params.id)));
 app.post('/api/rotas/:id/concluir',async(req,res)=>res.json(await flow.closeRoute(req.params.id,req.body)));
 app.get('/api/visitas/:id/historico',async(req,res)=>{
  const db=getPool(),v=await one(db,'SELECT * FROM visita WHERE id_visita=?',[id(req.params.id)]);ensure(v,'Visita não encontrada.',404);
  const fichas=await rows(db,'SELECT f.*,p.nome AS executor,r.decisao,r.parecer,r.retorno_previsto FROM ficha_visita f JOIN pessoa p ON p.id_pessoa=f.id_executor LEFT JOIN revisao_ficha r ON r.id_ficha=f.id_ficha WHERE f.id_visita=? ORDER BY numero_tentativa',[v.id_visita]);
  for(const f of fichas)f.depositos=await rows(db,'SELECT d.*,t.nome AS tipo FROM inspecao_deposito d JOIN tipo_deposito t ON t.id_tipo_deposito=d.id_tipo_deposito WHERE d.id_ficha=?',[f.id_ficha]);
  res.json({visita:v,fichas});
 });
 app.get('/api/reports/:index',async(req,res)=>{
  const n=id(req.params.index);ensure(n<=reports.length,'Relatório não encontrado.',404);const result=await rows(getPool(),reports[n-1]);res.json({title:labels[n-1],rows:result});
 });
 app.use('/api',(req,res)=>res.status(404).json({error:'Operação não encontrada.'}));
 if(fs.existsSync(path.resolve('dist'))){app.use(express.static(path.resolve('dist')));app.get('/{*path}',(req,res)=>res.sendFile(path.resolve('dist/index.html')));}
 app.use((e,req,res,next)=>{
  let status=e.status||500,message=e.message;
  if(e.code==='ER_DUP_ENTRY'){status=409;message='Já existe um registro com essa identificação ou combinação de campos.';}
  else if(['ER_ROW_IS_REFERENCED_2','ER_NO_REFERENCED_ROW_2'].includes(e.code)){status=409;message='Há vínculos com outros registros. Confira os cadastros relacionados.';}
  else if(['ER_CHECK_CONSTRAINT_VIOLATED','ER_CONSTRAINT_FAILED'].includes(e.code)){status=422;message='Os dados não atendem às regras do banco. Confira valores, datas e vínculos.';}
  else if(['ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT'].includes(e.code)){status=409;message='Outro atendimento foi atualizado ao mesmo tempo. Atualize e tente novamente.';}
  else if(['ECONNREFUSED','ETIMEDOUT','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR'].includes(e.code)){status=503;message='Não foi possível conectar ao MySQL. Confira o serviço e a configuração local.';}
  else if(!(e instanceof AppError)&&status>=500){message='Não foi possível concluir a operação. Confira a configuração ou contate o responsável.';console.error('Falha:',e.code||e.name);}
  res.status(status).json({error:message});
 });
 return app;
}
