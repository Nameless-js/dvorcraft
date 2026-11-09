import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {put,list,get} from '@vercel/blob';
const sign=value=>createHmac('sha256',process.env.COOKIE_SECRET||process.env.BLOB_READ_WRITE_TOKEN).update(value).digest('hex');
function signed(value){return value+'.'+sign(value);}
function verified(value){if(!value)return null;const i=value.lastIndexOf('.'),text=value.slice(0,i),signature=value.slice(i+1),expected=sign(text);return signature.length===expected.length&&timingSafeEqual(Buffer.from(signature),Buffer.from(expected))?text:null;}
async function read(path){const r=await get(path,{access:'private',useCache:false});return r?new Response(r.stream).json():null;}
async function all(prefix){let cursor,blobs=[];do{const page=await list({prefix,cursor,limit:1000});blobs.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor);return blobs;}
export default async function handler(req,res){
const send=(code,data)=>{res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
try{
const url=new URL(req.url,'https://localhost');
const endpoint=req.query?.endpoint||url.searchParams.get('endpoint');
const path=endpoint?'/api/'+endpoint:url.pathname,body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
const cookie=name=>req.headers.cookie?.match(new RegExp('(?:^|; )'+name+'=([^;]+)'))?.[1];
if(path==='/api/config'){send(200,{key:process.env.DGIS_KEY||''});return;}
if(!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID){send(503,{error:'Хранилище ещё не подключено'});return;}
if(path==='/api/plans'&&req.method==='GET'){const [files,voteFiles]=await Promise.all([all('plans/'),all('votes/')]);const [plans,votes]=await Promise.all([Promise.all(files.map(f=>read(f.pathname))),Promise.all(voteFiles.map(f=>read(f.pathname)))]);send(200,plans.filter(Boolean).map(p=>({...p,votes:votes.filter(v=>v?.id===p.id).length})));return;}
if(path==='/api/plans'&&req.method==='POST'){
const coord=c=>Array.isArray(c)&&c.length===2&&c.every(Number.isFinite)&&Math.abs(c[0])<=180&&Math.abs(c[1])<=90;
if(typeof body.name!=='string'||!body.name.trim()||typeof body.address!=='string'||!Number.isFinite(body.budget)||body.budget<=0||body.budget>1e9||!Array.isArray(body.items)||!body.items.length||body.items.length>500||body.items.some(i=>!Number.isInteger(i.type)||i.type<0||i.type>8||!coord(i.coord))||!Array.isArray(body.zone)||body.zone.length>100||body.zone.some(c=>!coord(c))){send(400,{error:'Проверьте данные варианта'});return;}
const p={id:randomUUID(),name:body.name.trim().slice(0,80),address:body.address.slice(0,180),budget:body.budget,items:body.items.map(i=>({type:i.type,coord:i.coord})),zone:body.zone,catalogVersion:2};await put('plans/'+p.id+'.json',JSON.stringify(p),{access:'private',addRandomSuffix:false,contentType:'application/json'});send(201,p);return;}
if(path==='/api/vote'&&req.method==='POST'){if(typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id)||!await read('plans/'+body.id+'.json')){send(404,{error:'Вариант не найден'});return;}let voter=verified(cookie('voter'));if(!voter){voter=randomUUID();res.setHeader('Set-Cookie',`voter=${signed(voter)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`);}await put('votes/'+voter+'.json',JSON.stringify({id:body.id}),{access:'private',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60,contentType:'application/json'});send(200,{ok:true});return;}
send(404,{error:'Не найдено'});
}catch(e){console.error(e.message);send(500,{error:'Не удалось выполнить запрос. Попробуйте ещё раз.'});}
}


