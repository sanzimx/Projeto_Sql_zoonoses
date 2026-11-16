import test from 'node:test';
import assert from 'node:assert/strict';
import {makeApp} from '../server/app.mjs';
import {get} from 'node:http';

test('modo local abre sem conta e mantém proteção contra gravação externa',async()=>{
 delete process.env.REQUIRE_LOGIN;
 const server=makeApp().listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const session=await (await fetch(base+'/api/session')).json();
  assert.equal(session.direct,true);assert.ok(session.csrf);
  assert.equal((await fetch(base+'/api/meta')).status,200);
  assert.equal((await fetch(base+'/api/anything',{method:'POST'})).status,403);
  assert.equal((await fetch(base+'/api/anything',{method:'POST',headers:{'X-CSRF-Token':session.csrf}})).status,404);
  assert.equal((await fetch(base+'/api/session',{headers:{Origin:'https://externo.example'}})).status,403);
  const foreignHostStatus=await new Promise((resolve,reject)=>get(base+'/api/session',{headers:{Host:'externo.example'}},res=>{res.resume();resolve(res.statusCode)}).on('error',reject));
  assert.equal(foreignHostStatus,403);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
