const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Samuel Dias/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const credentials=JSON.parse(fs.readFileSync('test-runtime/mysql-test-config.json','utf8'));
const out='docs/capturas';fs.mkdirSync(out,{recursive:true});
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4310';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function navigate(name,heading){await page.locator('nav').getByRole('button',{name,exact:true}).click();await page.getByRole('heading',{name:heading||name,exact:true}).waitFor();await page.locator('.data-card,.dash-grid,.report-note').first().waitFor();await page.waitForTimeout(200);}
 async function save(){await page.getByRole('button',{name:'Confirmar e salvar',exact:true}).click();await page.locator('.dialog').waitFor({state:'hidden'});}
 try{
  await page.goto(base);
  if(process.env.TEST_REQUIRE_LOGIN==='1'){
  await page.getByRole('heading',{name:'Acessar o painel'}).waitFor();
  await page.waitForTimeout(700);console.log('Login viewport',await page.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})));await page.screenshot({path:out+'/login.png'});
  await page.getByLabel('Usuário',{exact:true}).fill('operador_teste');await page.getByLabel('Senha',{exact:true}).fill(credentials.loginPassword);
  await page.getByRole('button',{name:'Entrar no Zoonoses+'}).click();
  }
  await page.getByRole('heading',{name:'Resumo e alertas'}).waitFor();await page.locator('.stats').waitFor();
  await page.screenshot({path:out+'/painel.png'});
  if(process.env.TEST_REQUIRE_LOGIN!=='1')assert.equal(await page.getByRole('button',{name:'Sair',exact:true}).count(),0);
  console.log('PASS Acesso ao painel MySQL');
  const menus=[['Solicitações'],['Ocorrências'],['Rotas do dia','Rotas'],['Visitas técnicas','Visitas'],['Fichas de campo'],['Revisões'],['Pessoas'],['Profissionais'],['Áreas de atuação'],['Imóveis'],['Municípios'],['Bairros'],['Tipos de depósito'],['Inspeções','Inspeções de depósitos']];
  for(const [name,heading] of menus){await navigate(name,heading);assert.equal(await page.locator('.error').count(),0,name);}
  console.log('PASS Navegação e dados das 14 tabelas');
  await navigate('Pessoas');await page.getByRole('button',{name:'Novo cadastro'}).click();
  const suffix=Date.now().toString(36),personName='Pessoa Navegador '+suffix;
  await page.locator('#field-nome').fill(personName);await page.locator('#field-email').fill(suffix+'@example.com');
  await save();const search=page.getByRole('textbox',{name:'Pesquisar registros'});await search.fill(personName);await page.waitForTimeout(700);
  assert.equal(await page.locator('tbody tr').count(),1);assert.equal(await search.inputValue(),personName);
  await page.locator('tbody tr').getByRole('button',{name:'Editar',exact:true}).click();
  assert.equal(await page.locator('#field-nome').inputValue(),personName);
  await page.locator('#field-telefone').fill('31900000000');await save();
  console.log('PASS Criar/editar pessoa, nome com espaços, busca sem perder campo');
  await navigate('Visitas técnicas','Visitas');await page.getByRole('button',{name:'Novo cadastro'}).click();
  await page.locator('#field-id_imovel_preventivo').selectOption('1');
  const objective='Inspeção pelo navegador '+suffix;await page.locator('#field-objetivo').fill(objective);await save();
  await page.getByRole('textbox',{name:'Pesquisar registros'}).fill(objective);await page.waitForTimeout(700);
  await page.locator('tbody tr').getByRole('button',{name:'Registrar tentativa'}).click();
  await page.locator('#field-id_executor').selectOption('1');await page.locator('#field-observacoes').fill('Inspeção registrada pelo fluxo visual.');
  await page.getByRole('button',{name:'Adicionar tipo'}).click();
  await page.locator('#deposit-0-id_tipo_deposito').selectOption('1');await page.locator('#deposit-0-acao').fill('Eliminação de recipiente.');
  await page.waitForTimeout(1200);
  const end=new Date();const local=end.toLocaleDateString('sv-SE')+'T'+end.toTimeString().slice(0,8);
  await page.locator('#field-saida_em').fill(local);
  await page.screenshot({path:out+'/ficha.png'});
  await save();await page.waitForTimeout(500);
  assert.match(await page.locator('tbody tr').innerText(),/Concluida/);
  await page.locator('tbody tr').getByRole('button',{name:'Histórico'}).click();await page.locator('.history article').waitFor();
  assert.match(await page.locator('.history').innerText(),/Eliminação de recipiente/);
  await page.getByRole('button',{name:'Fechar',exact:true}).click();
  console.log('PASS Visita preventiva, ficha com depósito e histórico pela interface');
  await page.locator('nav').getByRole('button',{name:'Relatórios',exact:true}).click();
  await page.locator('.report-note').waitFor();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar CSV'}).click();const file=await download;assert.match(file.suggestedFilename(),/\.csv$/);
  await page.screenshot({path:out+'/relatorios.png'});
  await navigate('Resumo e alertas');await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(400); // Allow the sidebar breakpoint transition to finish before capture.
  await page.screenshot({path:out+'/mobile.png'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Mobile horizontal overflow');
  await page.getByRole('button',{name:'Abrir menu'}).click();await page.locator('nav').getByRole('button',{name:'Visitas técnicas',exact:true}).click();
  await page.getByRole('heading',{name:'Visitas',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Table causes page overflow');
  console.log('PASS Exportação CSV, menu mobile e ausência de overflow externo');
  assert.deepEqual(errors,[]);
  fs.writeFileSync('docs/resultado-testes-browser.json',JSON.stringify({date:new Date().toISOString(),base,viewports:['1440x1000','390x844'],checks:[process.env.TEST_REQUIRE_LOGIN==='1'?'login':'acesso local direto sem login','dashboard','14 cadastros','CRUD pessoa','busca','visita preventiva','ficha e depósito','histórico','CSV','mobile'],pageErrors:errors,personalDatabaseAccessed:false},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
