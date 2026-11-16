import {makeApp} from './app.mjs';
import {spawn} from 'node:child_process';
const port=Number(process.env.PORT||4310);
makeApp().listen(port,process.env.HOST||process.env.IP||'127.0.0.1',()=>{
 const url='http://127.0.0.1:'+port;
 console.log('Zoonoses+ local: '+url);
 if(process.platform==='win32'&&process.env.OPEN_BROWSER==='1')spawn('explorer.exe',[url],{windowsHide:true}).on('error',()=>console.log('Abra o endereço acima no navegador.'));
});
