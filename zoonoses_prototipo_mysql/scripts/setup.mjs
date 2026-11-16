import readline from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import fs from 'node:fs';
import mysql from 'mysql2/promise';
import {formatEnv} from './env-format.mjs';
import {parseEnv} from 'node:util';
const rl=readline.createInterface({input:stdin,output:stdout});
async function secret(prompt){
 // Mask terminal echo while readline reads the answer.
 const write=rl._writeToOutput;let masked=false;
 rl._writeToOutput=function(s){if(!masked||s===prompt)write.call(this,s);};
 try{const p=rl.question(prompt);masked=true;return await p;}finally{rl._writeToOutput=write;stdout.write('\n');}
}
try{
 console.log('Configuração local do Zoonoses+ — nenhuma tabela será criada, apagada ou povoada.');
 if(fs.existsSync('.env')){const yes=await rl.question('Já existe uma configuração. Substituir? Digite SIM: ');if(yes!=='SIM')process.exit(0);}
 const port=(await rl.question('Porta MySQL [3306]: ')).trim()||'3306';
 const user=(await rl.question('Usuário MySQL [zoonoses_app]: ')).trim()||'zoonoses_app';
 const password=await secret('Senha MySQL (não exibida): ');
 const database=(await rl.question('Banco existente [zoonoses_campo_mysql]: ')).trim()||'zoonoses_campo_mysql';
 if(!/^\d+$/.test(port)||!/^\w+$/.test(database)||!password)throw Error('Configuração incompleta.');
 const connection=await mysql.createConnection({host:'127.0.0.1',port:Number(port),user,password,database});
 try{const [tables]=await connection.query('SHOW TABLES');const required=JSON.parse(fs.readFileSync('server/schema.json','utf8'));const actual=new Set(tables.map(t=>Object.values(t)[0]));if(Object.keys(required).some(t=>!actual.has(t)))throw Error('Este banco não contém as 14 tabelas esperadas.');console.log('Conexão confirmada; as 14 tabelas foram encontradas.');}finally{await connection.end();}
 const previous=fs.existsSync('.env')?parseEnv(fs.readFileSync('.env','utf8')):{};
 const values={DB_PORT:port,DB_USER:user,DB_PASSWORD:password,DB_NAME:database,PORT:'4310',...(previous.REQUIRE_LOGIN!==undefined?{REQUIRE_LOGIN:previous.REQUIRE_LOGIN}:{}),...(previous.AUTH_FILE?{AUTH_FILE:previous.AUTH_FILE}:{})};
 const envText=formatEnv(values);
 fs.writeFileSync('.env',envText,{mode:0o600});
 console.log('Configuração salva localmente. Execute npm run build e npm start. Abra http://127.0.0.1:4310');
}catch(e){console.error('Configuração não concluída:',e.code||e.message);process.exitCode=1;}finally{rl.close();}
