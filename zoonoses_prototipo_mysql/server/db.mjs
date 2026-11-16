import mysql from 'mysql2/promise';
import {ensure} from './domain.mjs';
let pool;
export function getPool(){
 if(!pool){
  ensure(process.env.DB_USER&&process.env.DB_PASSWORD&&process.env.DB_NAME,'Configure a conexão com o banco de dados.',503);
  ensure(/^[a-zA-Z0-9_]+$/.test(process.env.DB_NAME),'Nome do banco inválido.',503);
  pool=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,ssl:process.env.DB_SSL==='1'?{rejectUnauthorized:true}:undefined,connectionLimit:6,dateStrings:true,decimalNumbers:true,multipleStatements:false,charset:'utf8mb4',connectTimeout:5000});
 }
 return pool;
}
export async function transaction(fn){
 const c=await getPool().getConnection();
 try{await c.query("SET time_zone = '-03:00'");await c.beginTransaction();const result=await fn(c);await c.commit();return result;}
 catch(e){await c.rollback();throw e;}finally{c.release();}
}
export const rows=async(c,sql,args=[])=> (await c.execute(sql,args))[0];
export const one=async(c,sql,args=[])=> (await rows(c,sql,args))[0];
export async function insert(c,table,data){
 const keys=Object.keys(data);const [result]=await c.execute('INSERT INTO '+table+' ('+keys.join(',')+') VALUES ('+keys.map(()=>'?').join(',')+')',keys.map(k=>data[k]));
 return result.insertId;
}
export async function change(c,table,key,values){
 const fields=Object.keys(values);ensure(fields.length,'Nenhuma alteração informada.');
 const ks=Object.keys(key);return c.execute('UPDATE '+table+' SET '+fields.map(k=>k+'=?').join(',')+' WHERE '+ks.map(k=>k+'=?').join(' AND '),[...fields.map(k=>values[k]),...ks.map(k=>key[k])]);
}
