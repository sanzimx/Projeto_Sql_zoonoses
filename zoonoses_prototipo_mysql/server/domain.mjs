import schema from './schema.json' with { type: 'json' };
export {schema};
export class AppError extends Error { constructor(message,status=422){super(message);this.status=status;} }
export const ensure=(ok,message,status=422)=>{if(!ok)throw new AppError(message,status);};
export const id=(x)=>{const v=Number(x);ensure(Number.isSafeInteger(v)&&v>0,'Identificador inválido.');return v;};
export const stamp=(x)=>String(x||'').replace('T',' ').replace(/Z$/,'');
export function validDate(value,datetime=false){
 const pattern=datetime?/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/:/^(\d{4})-(\d{2})-(\d{2})$/;
 const m=String(value).match(pattern);if(!m)return false;
 const [y,mo,d]=m.slice(1,4).map(Number);const dt=new Date(Date.UTC(y,mo-1,d));
 return y>=1000&&dt.getUTCFullYear()===y&&dt.getUTCMonth()===mo-1&&dt.getUTCDate()===d&&(!datetime||(+m[4]<24&&+m[5]<60&&+(m[6]||0)<60));
}
export function normalize(table,body,{partial=false}={}){
 const meta=schema[table];ensure(meta,'Cadastro desconhecido.',404);ensure(body&&typeof body==='object'&&!Array.isArray(body),'Dados inválidos.');
 const allowed=new Set(meta.columns.filter(c=>!c.auto).map(c=>c.name));
 for(const k of Object.keys(body))ensure(allowed.has(k),'Campo não permitido: '+k);
 const out={};
 for(const c of meta.columns){
  if(c.auto)continue;
  let v=body[c.name];
  if(v===undefined&&partial)continue;
  if(v===undefined&&c.default!==null)v=c.default;
  if(v===undefined||v===null||v===''){ensure(!c.required,'Preencha '+c.name+'.');out[c.name]=null;continue;}
  if(c.type==='INT'||c.type.startsWith('DECIMAL')){
   v=Number(v);ensure(Number.isFinite(v),'Número inválido: '+c.name);
   if(c.type==='INT')ensure(Number.isSafeInteger(v)&&v>=0&&v<=2147483647,'Inteiro inválido: '+c.name);
   if(c.ref||c.pk)id(v);
   if(c.type.startsWith('DECIMAL'))ensure(v>=0&&v<=99999.99&&Math.abs(v*100-Math.round(v*100))<1e-7,'Distância deve ter até duas casas decimais.');
  }else{
   ensure(typeof v==='string','Texto inválido: '+c.name);v=v.trim();ensure(v.length>0,'Preencha '+c.name+'.');
   if(c.max)ensure([...v].length<=c.max,'Texto muito longo: '+c.name);
   if(c.type==='DATE'||c.type==='DATETIME'){ensure(validDate(v,c.type==='DATETIME'),'Data inválida: '+c.name);v=stamp(v);if(c.type==='DATETIME'&&v.length===16)v+=':00';}
   if(c.choices)ensure(c.choices.includes(v),'Opção inválida: '+c.name);
  }
  out[c.name]=v;
 }
 if(out.email)ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email),'E-mail inválido.');
 return out;
}
export function validateDeposit(d){
 const clean=normalize('inspecao_deposito',{...d,id_ficha:1});delete clean.id_ficha;
 ensure(clean.quantidade_inspecionada>0,'Informe ao menos um depósito inspecionado.');
 ensure(clean.quantidade_com_larvas<=clean.quantidade_inspecionada&&clean.quantidade_eliminada<=clean.quantidade_inspecionada,'Positivos e eliminados não podem superar o total inspecionado.');
 return clean;
}
export const editable={
 municipio:['nome','uf'],pessoa:['nome','email','telefone','cadastrada_em'],
 profissional:['matricula','cargo','admissao','ativo'],profissional_municipio:[],
 bairro:['nome','zona'],imovel:['inscricao','id_responsavel','logradouro','numero','complemento','tipo'],
 tipo_deposito:['nome','descricao'],solicitacao:['endereco_relatado','descricao'],
 ocorrencia:['categoria','descricao_tecnica','pontuacao'],rota:['codigo','data_rota'],
 visita:['objetivo'],ficha_visita:[],inspecao_deposito:[],revisao_ficha:[]
};
export const managed=['ficha_visita','inspecao_deposito','revisao_ficha'];
