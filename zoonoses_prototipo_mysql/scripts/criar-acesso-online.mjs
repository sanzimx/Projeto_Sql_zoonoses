import readline from 'node:readline/promises';
import fs from 'node:fs';
import path from 'node:path';
import {stdin,stdout} from 'node:process';
import {hashPassword,authPath} from '../server/auth.mjs';

const rl=readline.createInterface({input:stdin,output:stdout});
async function secret(prompt){
 const write=rl._writeToOutput;let masked=false;
 rl._writeToOutput=function(s){if(!masked||s===prompt)write.call(this,s);};
 try{const p=rl.question(prompt);masked=true;return await p;}finally{rl._writeToOutput=write;stdout.write('\n');}
}
try{
 if(fs.existsSync(authPath()))throw Error('Já existe um acesso neste local; nenhum arquivo foi alterado.');
 const username=(await rl.question('Nome do usuário: ')).trim();
 const password=await secret('Senha do protótipo online (mínimo 12 caracteres): ');
 const confirm=await secret('Repita a senha: ');
 if(!username||password.length<12||password.length>200||password!==confirm)throw Error('Nome ou confirmação inválidos; use senha entre 12 e 200 caracteres.');
 fs.mkdirSync(path.dirname(authPath()),{recursive:true});
 fs.writeFileSync(authPath(),JSON.stringify({username,...hashPassword(password)}),{flag:'wx',mode:0o600});
 console.log('Acesso criado. A senha não foi salva em texto.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{rl.close();}
