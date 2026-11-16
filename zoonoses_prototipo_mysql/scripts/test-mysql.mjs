// Integration harness. It refuses the user's port/database and never drops a database.
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {hashPassword} from '../server/auth.mjs';
import {makeApp} from '../server/app.mjs';
import {getPool} from '../server/db.mjs';
import schema from '../server/schema.json' with {type:'json'};
const configPath='test-runtime/mysql-test-config.json';
process.env.REQUIRE_LOGIN='1'; // Retain coverage of the optional authenticated mode.
if(!fs.existsSync(configPath))throw Error('Teste exige instância isolada e configuração local em test-runtime. Leia docs/TESTES.md.');
const credentials=JSON.parse(fs.readFileSync(configPath,'utf8'));
const admin=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root',password:credentials.rootPassword,multipleStatements:true,dateStrings:true});
let server;const results=[];
try{
 const [[loc]]=await admin.query('SELECT @@datadir AS dir,@@port AS port,VERSION() AS version');
 assert.equal(loc.port,3307);assert.match(loc.dir.replaceAll('\\','/'),/zoonoses_prototipo_mysql\/test-runtime\/mysql-data\//i);
 const suffix=Date.now().toString(36)+randomBytes(2).toString('hex'),database='zoonoses_campo_teste_'+suffix,user='ztest_'+suffix;
 let sql=fs.readFileSync('../zoonoses_campo_mysql/sql/01_criacao_povoamento.sql','utf8').replaceAll('zoonoses_campo_mysql',database);
 await admin.query(sql);
 await admin.query('CREATE USER ?@? IDENTIFIED BY ?',[user,'localhost',credentials.appPassword]);
 await admin.query('GRANT SELECT, INSERT, UPDATE, DELETE ON '+database+'.* TO ?@?',[user,'localhost']);
 Object.assign(process.env,{DB_PORT:'3307',DB_USER:user,DB_PASSWORD:credentials.appPassword,DB_NAME:database,AUTH_FILE:path.resolve('test-runtime/auth-test.json')});
 fs.writeFileSync(process.env.AUTH_FILE,JSON.stringify({username:'operador_teste',...hashPassword(credentials.loginPassword)}));
 fs.writeFileSync('test-runtime/.env.test',Object.entries({DB_PORT:'3307',DB_USER:user,DB_PASSWORD:credentials.appPassword,DB_NAME:database,AUTH_FILE:process.env.AUTH_FILE,PORT:'4310'}).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n'));
 server=makeApp().listen(4311,'127.0.0.1');await new Promise(resolve=>server.on('listening',resolve));
 let cookie='',csrf='';
 async function req(url,method='GET',body,expected=200,headers={}){
  const res=await fetch('http://127.0.0.1:4311/api'+url,{method,headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf,...headers},body:body===undefined?undefined:JSON.stringify(body)});
  const json=await res.json();assert.equal(res.status,expected,method+' '+url+': '+JSON.stringify(json));
  if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];
  return json;
 }
 async function check(name,fn){await fn();results.push(name);console.log('PASS '+name)}
 const scalar=async q=>(await admin.query(q))[0][0];
 await check('schema MySQL real: 14 tabelas e 513 registros',async()=>{
  const [rr]=await admin.query('SHOW TABLES');assert.equal(rr.length,14);
  let n=0;for(const t of Object.keys(schema))n+=(await scalar('SELECT COUNT(*) AS n FROM '+t)).n;assert.equal(n,513);
 });
 await check('autenticação obrigatória, senha inválida e CSRF',async()=>{
  await req('/dashboard','GET',undefined,401);await req('/login','POST',{username:'operador_teste',password:'incorreta'},401);
  const login=await req('/login','POST',{username:'operador_teste',password:credentials.loginPassword});csrf=login.csrf;
  await req('/tables/municipio','POST',{nome:'Não gravar',uf:'MG'},403,{'X-CSRF-Token':''});
 });
 await check('14 consultas de cadastros, dashboard, buscas parametrizadas e 15 relatórios',async()=>{
  const dashboard=await req('/dashboard');assert.equal(dashboard.counts.ficha_visita,50);
  for(const t of Object.keys(schema))assert.ok((await req('/tables/'+t)).total>=15);
  const injection=await req('/tables/pessoa?q='+encodeURIComponent("' OR 1=1 --"));assert.equal(injection.total,0);
  for(let i=1;i<=15;i++)assert.ok((await req('/reports/'+i)).rows.length>0);
 });
 let person,solic,occ,visit,route,ficha;
 await check('CRUD de pessoa e bloqueio de campo controlado',async()=>{
  person=(await req('/tables/pessoa','POST',{nome:'Ana de Teste',email:suffix+'@example.com',telefone:null,cadastrada_em:'2026-11-06'},201)).id;
  await req('/tables/pessoa/'+person,'PATCH',{nome:'Ana da Silva'});
  assert.equal((await scalar('SELECT nome FROM pessoa WHERE id_pessoa='+person)).nome,'Ana da Silva');
  await req('/tables/ocorrencia','POST',{situacao:'Concluida'},422);
 });
 await check('conversão atômica, profissional autorizado e dupla conversão bloqueada',async()=>{
  solic=(await req('/tables/solicitacao','POST',{id_solicitante:person,id_bairro:1,endereco_relatado:'Rua de teste 10',descricao:'Acúmulo de água'},201)).id;
  const triage={decisao:'Convertida',id_analista:13,parecer:'Confirmado em triagem',id_imovel:1,categoria:'Agua parada',descricao_tecnica:'Teste de atendimento',pontuacao:70};
  await req('/solicitacoes/'+solic+'/triagem','POST',{...triage,id_analista:1},422);
  await req('/solicitacoes/'+solic+'/triagem','POST',{...triage,id_imovel:999999},404);
  assert.equal((await scalar('SELECT situacao FROM solicitacao WHERE id_solicitacao='+solic)).situacao,'Pendente');
  occ=(await req('/solicitacoes/'+solic+'/triagem','POST',triage)).id_ocorrencia;
  await req('/solicitacoes/'+solic+'/triagem','POST',triage,409);
 });
 await check('visita com alvo exclusivo e agendamento territorial',async()=>{
  await req('/tables/visita','POST',{id_ocorrencia:occ,id_imovel_preventivo:1,objetivo:'Inválida'},422);
  visit=(await req('/tables/visita','POST',{id_ocorrencia:occ,id_imovel_preventivo:null,objetivo:'Inspecionar recipientes'},201)).id;
  const day=(await scalar('SELECT DATE_FORMAT(CURRENT_DATE(),"%Y-%m-%d") AS d')).d;
  route=(await req('/tables/rota','POST',{id_profissional:1,data_rota:day},201)).id;
  await req('/visitas/'+visit+'/agendamento','POST',{id_rota:route,ordem_rota:1});
 });
 async function time(){await new Promise(r=>setTimeout(r,1200));const {s}=await scalar("SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') AS s");return s;}
 await admin.query("SET time_zone = '-03:00'");
 const start=await time();const end=await time();
 await check('tentativa sem acesso, depósitos proibidos e rollback',async()=>{
  const b={id_executor:1,entrada_em:start,saida_em:end,resultado:'Fechado',observacoes:'Imóvel fechado',depositos:[]};
  await req('/visitas/'+visit+'/fichas','POST',{...b,depositos:[{id_tipo_deposito:1,quantidade_inspecionada:1,quantidade_com_larvas:0,quantidade_eliminada:0,acao:'Teste'}]},422);
  ficha=(await req('/visitas/'+visit+'/fichas','POST',b,201)).id_ficha;
  assert.equal((await scalar('SELECT situacao FROM visita WHERE id_visita='+visit)).situacao,'Aguardando revisao');
 });
 await check('revisão por gestor e autorização de retorno',async()=>{
  const day=(await scalar('SELECT DATE_FORMAT(CURRENT_DATE(),"%Y-%m-%d") AS d')).d;
  await req('/fichas/'+ficha+'/revisao','POST',{id_revisor:1,decisao:'Retornar',parecer:'Voltar',retorno_previsto:day},422);
  await req('/fichas/'+ficha+'/revisao','POST',{id_revisor:13,decisao:'Retornar',parecer:'Voltar para inspeção',retorno_previsto:day});
  assert.equal((await scalar('SELECT situacao FROM visita WHERE id_visita='+visit)).situacao,'Pendente');
  await req('/visitas/'+visit+'/agendamento','POST',{id_rota:route,ordem_rota:1});
 });
 const start2=await time(),end2=await time();
 await check('retorno com inspeção, limites de contagem e concorrência',async()=>{
  const dep={id_tipo_deposito:1,quantidade_inspecionada:2,quantidade_com_larvas:1,quantidade_eliminada:1,acao:'Eliminação de recipiente'};
  const body={id_executor:1,entrada_em:start2,saida_em:end2,resultado:'Inspecionada',observacoes:'Inspeção completa',depositos:[dep]};
  await req('/visitas/'+visit+'/fichas','POST',{...body,depositos:[{...dep,quantidade_com_larvas:3}]},422);
  const responses=await Promise.all([1,2].map(()=>fetch('http://127.0.0.1:4311/api/visitas/'+visit+'/fichas',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:JSON.stringify(body)})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
  assert.equal((await scalar('SELECT COUNT(*) AS n FROM ficha_visita WHERE id_visita='+visit)).n,2);
  const h=await req('/visitas/'+visit+'/historico');assert.equal(h.fichas[1].depositos.length,1);
 });
 await check('conclusão da rota e ocorrência; histórico não excluível',async()=>{
  await req('/rotas/'+route+'/concluir','POST',{distancia_km:4.25});
  await req('/ocorrencias/'+occ+'/concluir','POST',{});
  await req('/tables/ficha_visita/'+ficha,'DELETE',undefined,422);
  assert.equal((await scalar('SELECT situacao FROM ocorrencia WHERE id_ocorrencia='+occ)).situacao,'Concluida');
 });
 await check('15 verificações de coerência continuam sem resultados',async()=>{
  const src=fs.readFileSync('../zoonoses_campo_mysql/sql/03_verificacao.sql','utf8');
  const checks=[...src.matchAll(/-- V\d+:.*?\n(SELECT .*?;)/gs)].map(m=>m[1]);assert.equal(checks.length,15);
  for(const q of checks)assert.equal((await admin.query(q))[0].length,0,q);
 });
 await check('logout revoga sessão',async()=>{await req('/logout','POST',{});await req('/dashboard','GET',undefined,401)});
 fs.mkdirSync('docs',{recursive:true});
 fs.writeFileSync('docs/resultado-testes-mysql.json',JSON.stringify({date:new Date().toISOString(),mysql:loc.version,port:3307,database,initial:{tables:14,rows:513},checks:results,personalDatabaseAccessed:false},null,2));
 console.log('Integração validada em instância isolada. Banco pessoal não acessado.');
}finally{if(server)await new Promise(r=>server.close(r));await admin.end();await getPool().end();}
