import {parseEnv} from 'node:util';

export function formatEnv(values){
 return Object.entries(values).map(([key,value])=>{
  const text=String(value);
  for(const quote of ["'",'"','`']){
   const line=key+'='+quote+text+quote;
   if(!text.includes(quote)&&!/[\r\n]/.test(text)&&parseEnv(line)[key]===text)return line;
  }
  throw Error('O valor de '+key+' contém uma combinação de caracteres incompatível com o arquivo .env. Use um valor sem quebras de linha e sem os três tipos de aspas juntos.');
 }).join('\n')+'\n';
}
