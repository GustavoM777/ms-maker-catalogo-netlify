import {BlobsServer} from '@netlify/blobs/server';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const dir=await mkdtemp(join(tmpdir(),'maker-test-'));
const blobs=new BlobsServer({directory:dir,logger:()=>{}});const address=await blobs.start();
const context=Buffer.from(JSON.stringify({siteID:'test-site',token:'local-test',apiURL:`http://localhost:${address.port}`,edgeURL:`http://localhost:${address.port}`,uncachedEdgeURL:`http://localhost:${address.port}`})).toString('base64');
let child;let output='';
try{
 child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4173'],{env:{...process.env,ADMIN_PASSWORD:'test-only-password',NETLIFY_BLOBS_CONTEXT:context},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',b=>{output+=b});child.stderr.on('data',b=>{output+=b});
 const base='http://127.0.0.1:4173';for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const headers={authorization:'Bearer test-only-password','Content-Type':'application/json'};
 const get=()=>fetch(base+'/api/products');
 let r=await get();assert.equal(r.status,200,await r.clone().text());let catalog=(await r.json()).products;assert.equal(catalog.length,7);
 assert.equal((await fetch(base+'/admin')).status,200);
 for(const p of catalog){for(const path of [p.image,...(p.images||[]),p.video,...(p.variants||[]).map(v=>v.image)].filter(Boolean)){assert.equal((await fetch(base+path,{method:'HEAD'})).status,200,path);}}
 assert.equal((await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 const product={...catalog[0],id:'validation-product',name:'Validation',active:false};
 assert.equal((await fetch(base+'/api/products',{method:'POST',headers,body:JSON.stringify(product)})).status,200);
 assert.equal((await (await get()).json()).products.some(p=>p.id===product.id),false);
 assert.equal((await (await fetch(base+'/api/products',{headers})).json()).products.some(p=>p.id===product.id),true);
 assert.equal((await fetch(base+'/api/upload',{method:'POST',headers:{authorization:headers.authorization},body:new FormData()})).status,400);
 const bytes=new Uint8Array(5*1024*1024+123).fill(37);
 r=await fetch(base+'/api/upload',{method:'POST',headers,body:JSON.stringify({action:'start',kind:'video',type:'video/mp4',size:bytes.length})});assert.equal(r.status,200);const session=await r.json();
 const finish=()=>fetch(base+'/api/upload',{method:'POST',headers,body:JSON.stringify({action:'finish',id:session.id})});assert.equal((await finish()).status,400);
 for(let i=0;i<session.chunks;i++){r=await fetch(base+`/api/upload?id=${session.id}&index=${i}`,{method:'PUT',headers:{authorization:headers.authorization},body:bytes.slice(i*session.chunkSize,(i+1)*session.chunkSize)});assert.equal(r.status,200,await r.clone().text());}
 const media=await (await finish()).json();assert.ok(media.url);
 r=await fetch(base+media.url,{headers:{Range:'bytes=2097140-2097180'}});assert.equal(r.status,206);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes.slice(2097140,2097181));
 r=await fetch(base+media.url,{headers:{Range:'bytes=-20'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,20);
 assert.equal((await fetch(base+media.url,{headers:{Range:'bytes=999999999-'}})).status,416);
 assert.equal((await fetch(base+media.url,{method:'HEAD'})).headers.get('content-length'),String(bytes.length));
 const deleteProduct={...product,deleted:true};assert.equal((await fetch(base+'/api/products',{method:'POST',headers,body:JSON.stringify(deleteProduct)})).status,200);
 assert.equal((await (await fetch(base+'/api/products',{headers})).json()).products.some(p=>p.id===product.id),false);
 console.log('PASS: 7 produtos, mídias locais, painel, autenticação, gravação, ocultação, exclusão e upload multipart com reprodução parcial.');
}catch(e){console.error(output);throw e;}finally{if(child){child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));}await blobs.stop();await rm(dir,{recursive:true,force:true});}
