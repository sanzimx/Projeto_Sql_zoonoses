import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {AppError,ensure} from './domain.mjs';
export const authPath=()=>path.resolve(process.env.AUTH_FILE||'data/auth.json');
export function hashPassword(password,salt=randomBytes(24).toString('hex')){return {salt,hash:scryptSync(password,salt,64).toString('hex')};}
export function makeAuth(){
 const direct=!process.env.PUBLIC_URL&&process.env.REQUIRE_LOGIN!=='1';
 const local={username:'Operador local',csrf:randomBytes(24).toString('hex'),direct:true};
 const sessions=new Map(),attempts=new Map();
 function login(req,res){
  const now=Date.now(),ip=req.socket.remoteAddress,bucket=attempts.get(ip)||{count:0,until:now+600000};
  if(bucket.until<now){bucket.count=0;bucket.until=now+600000;}
  ensure(bucket.count<10,'Muitas tentativas. Aguarde dez minutos.',429);bucket.count++;attempts.set(ip,bucket);
  ensure(fs.existsSync(authPath()),'O acesso da aplicação ainda não foi configurado.',503);
  const account=JSON.parse(fs.readFileSync(authPath(),'utf8'));const pass=req.body?.password;
  ensure(typeof pass==='string'&&pass.length<=200&&typeof req.body?.username==='string','Acesso inválido.',401);
  const computed=hashPassword(pass,account.salt).hash;
  ensure(req.body.username===account.username&&timingSafeEqual(Buffer.from(computed,'hex'),Buffer.from(account.hash,'hex')),'Usuário ou senha inválidos.',401);
  attempts.delete(ip);
  for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);
  const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');
  sessions.set(token,{username:account.username,csrf,expires:now+8*3600000});
  res.cookie('zoonoses_session',token,{httpOnly:true,secure:Boolean(process.env.PUBLIC_URL),sameSite:'strict',maxAge:8*3600000,path:'/'});
  res.json({username:account.username,csrf});
 }
 function guard(req,res,next){
  if(direct){
   if(!['GET','HEAD'].includes(req.method)&&req.headers['x-csrf-token']!==local.csrf)return next(new AppError('Atualize a página para continuar.',403));
   req.operator=local;return next();
  }
  const match=req.headers.cookie?.match(/(?:^|;\s*)zoonoses_session=([a-f0-9]{64})(?:;|$)/);const token=match?.[1],session=sessions.get(token);
  if(!session||session.expires<Date.now()){sessions.delete(token);return next(new AppError('Entre novamente para continuar.',401));}
  if(!['GET','HEAD'].includes(req.method)&&req.headers['x-csrf-token']!==session.csrf)return next(new AppError('Sessão de formulário inválida. Atualize a página.',403));
  req.operator=session;req.sessionToken=token;next();
 }
 function logout(req,res){sessions.delete(req.sessionToken);res.clearCookie('zoonoses_session',{path:'/'});res.json({ok:true});}
 return {login,guard,logout,direct};
}
