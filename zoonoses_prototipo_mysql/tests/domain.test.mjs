import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,validateDeposit,validDate,id} from '../server/domain.mjs';
import {hashPassword} from '../server/auth.mjs';
test('datas impossíveis e horários inválidos são rejeitados',()=>{
 assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2024-02-29'),true);
 assert.equal(validDate('2026-11-06T24:00',true),false);assert.equal(validDate('2026-11-06T09:30:12',true),true);
});
test('campos desconhecidos, chaves e e-mail inválidos são rejeitados',()=>{
 assert.throws(()=>normalize('pessoa',{nome:'Teste',email:'sem-email',telefone:null,cadastrada_em:'2026-11-06'}));
 assert.throws(()=>normalize('municipio',{nome:'Teste',uf:'MG',injetado:'SELECT 1'}));
 assert.throws(()=>id('1 OR 1=1'));assert.throws(()=>id(-1));
});
test('inspeção conta depósitos positivos e permite sobreposição com eliminados',()=>{
 const d={id_tipo_deposito:1,quantidade_inspecionada:2,quantidade_com_larvas:2,quantidade_eliminada:2,acao:'Remoção'};
 assert.equal(validateDeposit(d).quantidade_eliminada,2);
 assert.throws(()=>validateDeposit({...d,quantidade_com_larvas:3}));
 assert.throws(()=>validateDeposit({...d,quantidade_inspecionada:0}));
});
test('normalização preserva nomes e não transforma texto em data',()=>{
 const d=normalize('pessoa',{nome:'Ana da Silva',email:'ana@example.com',telefone:'',cadastrada_em:'2026-11-06'});
 assert.equal(d.nome,'Ana da Silva');assert.equal(d.telefone,null);
 assert.equal(normalize('municipio',{nome:'Cidade'}).uf,'MG');
});
test('senha usa hash com sal e não armazenamento em texto',()=>{
 const a=hashPassword('exemplo-apenas-teste');const b=hashPassword('exemplo-apenas-teste');
 assert.notEqual(a.hash,b.hash);assert.equal(hashPassword('exemplo-apenas-teste',a.salt).hash,a.hash);
});
