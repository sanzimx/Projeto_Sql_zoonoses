import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEnv} from 'node:util';
import {formatEnv} from '../scripts/env-format.mjs';

test('configuração preserva caracteres especiais da senha no leitor real do Node',()=>{
 for(const value of [' abc#def ',String.raw`senha\nova`,"uma'aspas",'duas"aspas',"uma'e\"duas",'$senha`especial']){
  assert.equal(parseEnv(formatEnv({DB_PASSWORD:value})).DB_PASSWORD,value);
 }
 assert.throws(()=>formatEnv({DB_PASSWORD:'linha\nnova'}),/incompatível/);
});
