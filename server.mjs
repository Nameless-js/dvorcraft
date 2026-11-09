import http from 'node:http';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
try { for(const line of (await fs.readFile('.env','utf8')).split(/\r?\n/)){const i=line.indexOf('=');if(i>0)process.env[line.slice(0,i).trim()]??=line.slice(i+1).trim();} } catch {}
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
await fs.mkdir('data',{recursive:true});
let db;try{db=JSON.parse(await fs.readFile('data/plans.json','utf8'));}catch{db={plans:[],votes:{}};}
let queue=Promise.resolve();
function persist(){const snapshot=JSON.stringify(db);queue=queue.then(()=>fs.writeFile('data/plans.json',snapshot));return queue;}
http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');
const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
let body={};if(req.method==='POST'){let raw='';for await(const part of req){raw+=part;if(raw.length>200000){send(413,{error:'Слишком большой запрос'});return;}}try{body=JSON.parse(raw||'{}');}catch{send(400,{error:'Некорректный запрос'});return;}}
if(url.pathname.startsWith('/api/')){
if(url.pathname==='/api/config'){send(200,{key:process.env.DGIS_KEY||''});return;}
if(url.pathname==='/api/plans'&&req.method==='GET'){send(200,db.plans.map(p=>({...p,votes:Object.values(db.votes).filter(v=>v===p.id).length})));return;}
if(url.pathname==='/api/plans'&&req.method==='POST'){
if(typeof body.name!=='string'||!body.name.trim()||typeof body.address!=='string'||!Number.isFinite(body.budget)||body.budget<=0||!Array.isArray(body.items)||body.items.length>500||body.items.some(i=>!Number.isInteger(i.type)||i.type<0||i.type>8||!Array.isArray(i.coord)||i.coord.length!==2||!i.coord.every(Number.isFinite))||!Array.isArray(body.zone)||body.zone.length>100||body.zone.some(c=>!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite))){send(400,{error:'Проверьте данные варианта'});return;}
const plan={id:randomUUID(),name:body.name.slice(0,80),address:body.address.slice(0,180),budget:body.budget,items:body.items,zone:body.zone};db.plans.push(plan);await persist();send(201,plan);return;}
if(url.pathname==='/api/vote'&&req.method==='POST'){if(!db.plans.some(p=>p.id===body.id)){send(404,{error:'Вариант не найден'});return;}let voter=req.headers.cookie?.match(/(?:^|; )voter=([^;]+)/)?.[1];if(!voter){voter=randomUUID();res.setHeader('Set-Cookie',`voter=${voter}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000`);}db.votes[voter]=body.id;await persist();send(200,{ok:true});return;}
send(404,{error:'Не найдено'});return;}
const files={'/':'index.html','/app.js':'app.js','/yard-models.js':'yard-models.js','/style.css':'style.css','/camry.css':'camry.css','/walk.css':'walk.css','/walk.bundle.js':'walk.bundle.js','/guide.js':'guide.js','/guide.css':'guide.css'};
let file=files[url.pathname];if(!file&&/^\/(models|vendor)\/[a-z0-9-]+\.(glb|svg|json|js)$/.test(url.pathname))file=url.pathname.slice(1);if(!file){res.writeHead(404);res.end();return;}
const ext=file.split('.').pop(),mime={js:'text/javascript',css:'text/css',html:'text/html',svg:'image/svg+xml',glb:'model/gltf-binary',json:'application/json'};res.setHeader('Content-Type',(mime[ext]||'application/octet-stream')+(ext==='glb'?'':'; charset=utf-8'));res.end(await fs.readFile(new URL('./public/'+file,import.meta.url)));
}catch(error){console.error(error.message);res.writeHead(500);res.end('Ошибка сервера');}}).listen(port,host,()=>console.log(`YardCraft: http://${host}:${port}`));

