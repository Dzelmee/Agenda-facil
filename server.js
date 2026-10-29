import http from 'node:http';
import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {join, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const ROOT=dirname(fileURLToPath(import.meta.url));
const cfg=JSON.parse(await readFile(join(ROOT,'config.json'),'utf8'));
const DB=join(ROOT,'data','records.json');
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const MAX_BODY=32*1024;
let queue=Promise.resolve();
async function readDB(){try{return JSON.parse(await readFile(DB,'utf8'))}catch(e){if(e.code==='ENOENT')return [];throw e}}
function mutate(fn){const result=queue.then(async()=>{const records=await readDB();const response=fn(records);await mkdir(dirname(DB),{recursive:true});const temp=DB+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(records,null,2));await rename(temp,DB);return response});queue=result.catch(()=>{});return result}
function respond(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload))}
function validate(body){if(!body||typeof body!=='object'||Array.isArray(body))return 'Dados inválidos';for(const f of cfg.fields){const v=body[f.key];if(typeof v!=='string'||!v.trim()||v.length>160)return `Campo inválido: ${f.label}`;if(f.type==='select'&&!f.options.includes(v))return `Opção inválida: ${f.label}`}return null}
async function bodyJSON(req){let s='';for await(const chunk of req){s+=chunk;if(Buffer.byteLength(s)>MAX_BODY){const e=new Error('Corpo muito grande');e.status=413;throw e}}try{return JSON.parse(s)}catch{const e=new Error('JSON inválido');e.status=400;throw e}}
export function createServer(){return http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const path=url.pathname;
if(path==='/api/health'&&req.method==='GET')return respond(res,200,{ok:true,project:cfg.name});
if(path==='/api/records'&&req.method==='GET'){await queue;return respond(res,200,await readDB())}
if(path==='/api/records'&&req.method==='POST'){const body=await bodyJSON(req);const error=validate(body);if(error)return respond(res,400,{error});const record=await mutate(items=>{const value={id:randomUUID(),...Object.fromEntries(cfg.fields.map(f=>[f.key,body[f.key].trim()])),createdAt:new Date().toISOString()};items.unshift(value);return value});return respond(res,201,record)}
const match=path.match(/^\/api\/records\/([0-9a-f-]{36})$/i);
if(match&&req.method==='PUT'){const body=await bodyJSON(req);const error=validate(body);if(error)return respond(res,400,{error});const updated=await mutate(items=>{const index=items.findIndex(r=>r.id===match[1]);if(index<0)return null;items[index]={...items[index],...Object.fromEntries(cfg.fields.map(f=>[f.key,body[f.key].trim()])),updatedAt:new Date().toISOString()};return items[index]});return updated?respond(res,200,updated):respond(res,404,{error:'Registro não encontrado'})}
if(match&&req.method==='DELETE'){const removed=await mutate(items=>{const index=items.findIndex(r=>r.id===match[1]);if(index<0)return false;items.splice(index,1);return true});return removed?respond(res,200,{deleted:true}):respond(res,404,{error:'Registro não encontrado'})}
if(path.startsWith('/api/'))return respond(res,404,{error:'Rota não encontrada'});
if(req.method!=='GET'&&req.method!=='HEAD')return respond(res,405,{error:'Método não permitido'});
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'};
const file=files[path];if(!file){res.writeHead(404);return res.end('Not found')}
const data=await readFile(join(ROOT,'public',file));res.writeHead(200,{'Content-Type':TYPES[extname(file)],'X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
}catch(e){if(e.code==='ENOENT'){res.writeHead(404);return res.end('Not found')}respond(res,e.status||500,{error:e.status?e.message:'Erro interno do servidor'});if(!e.status)console.error(e)}})}
if(!process.env.NODE_TEST_CONTEXT&&process.argv[1]&&fileURLToPath(import.meta.url)===join(ROOT,'server.js')){const port=Number(process.env.PORT||3000);createServer().listen(port,()=>console.log(`${cfg.name} disponível em http://localhost:${port}`))}
