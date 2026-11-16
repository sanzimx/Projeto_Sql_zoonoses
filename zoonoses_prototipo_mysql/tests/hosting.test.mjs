import test from 'node:test';
import assert from 'node:assert/strict';
import {request} from 'node:http';
import {makeApp} from '../server/app.mjs';

test('hospedagem exige login e restringe domínio e origem',async()=>{
 process.env.PUBLIC_URL='https://zoonoses.example';
 process.env.REQUIRE_LOGIN='0';
 const server=makeApp().listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const call=(headers={})=>new Promise((resolve,reject)=>{
  const req=request({hostname:'127.0.0.1',port:server.address().port,path:'/api/session',headers:{Host:'zoonoses.example',...headers}},res=>{res.resume();resolve(res.statusCode);});
  req.on('error',reject);req.end();
 });
 try{
  assert.equal(await call(),401);
  assert.equal(await call({Host:'outro.example'}),403);
  assert.equal(await call({Origin:'https://outro.example'}),403);
  assert.equal(await call({Origin:'https://zoonoses.example'}),401);
 }finally{await new Promise(resolve=>server.close(resolve));delete process.env.PUBLIC_URL;delete process.env.REQUIRE_LOGIN;}
});

test('hospedagem rejeita endereço sem HTTPS',()=>{
 process.env.PUBLIC_URL='http://zoonoses.example';
 try{assert.throws(()=>makeApp(),/HTTPS/);}finally{delete process.env.PUBLIC_URL;}
});
