import {spawn} from 'node:child_process';
const options={stdio:'inherit'};
const api=spawn(process.execPath,['--env-file-if-exists=.env','server/index.mjs'],options);
const ui=spawn(process.execPath,['node_modules/vite/bin/vite.js','--configLoader','native'],options);
const stop=()=>{api.kill();ui.kill()};process.on('SIGINT',stop);process.on('SIGTERM',stop);
api.on('exit',code=>{if(code)ui.kill()});ui.on('exit',code=>{if(code)api.kill()});
