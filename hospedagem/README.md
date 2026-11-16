# Hospedagem

Protótipo publicado em https://zoonoses.alwaysdata.net/ com Node.js 24 e MariaDB 11.8.9. As 14 tabelas e 513 registros foram confirmados, assim como login, painel, cadastros e 15 relatórios.

O código é publicado manualmente. Alterar o GitHub não atualiza automaticamente o site.

## Publicar uma versão

Na pasta zoonoses_prototipo_mysql, executar npm ci e npm run build. Enviar dist, server, package.json e package-lock.json para a pasta da aplicação no servidor. Executar npm ci --omit=dev. Preservar .env e data/auth.json, que ficam somente no servidor. Reiniciar o site no painel da hospedagem.

No Alwaysdata: serviço Node.js, diretório deploy/zoonoses, comando node --env-file=.env server/index.mjs e ambiente HOST=::. O serviço fornece PORT. HTTPS está habilitado.

PUBLIC_URL deve corresponder à origem HTTPS do site. Configurar DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD no servidor. REQUIRE_LOGIN=1 e AUTH_FILE=data/auth.json. Para uma instalação nova, criar o acesso com node --env-file=.env scripts/criar-acesso-online.mjs.

## Desenvolvimento local com banco online

Configurar DB_HOST=mysql-zoonoses.alwaysdata.net, DB_NAME=zoonoses_campo e DB_USER com o usuário do banco. Inserir a senha apenas no .env local. Não definir PUBLIC_URL para a execução local. Executar npm ci, npm run build e npm start. A versão local usa os mesmos dados do site se apontar para o mesmo banco. Para testes que alteram dados, prefira banco separado.

As credenciais não fazem parte deste repositório.
