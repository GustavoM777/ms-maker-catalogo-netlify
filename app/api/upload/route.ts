import {isAdmin} from '../../../lib/admin';
import {store,CHUNK_SIZE,validId,type MediaManifest} from '../../../lib/storage';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const error=(message:string,status=400)=>Response.json({error:message},{status});
export async function POST(request:Request){
 if(!isAdmin(request))return error('Senha incorreta.',401);
 if(!request.headers.get('content-type')?.includes('application/json'))return error('Selecione um arquivo.');
 try{
 const data=await request.json();const media=store('media');
 if(data.action==='start'){
  const {size,type,kind}=data;
  const types=kind==='video'?['video/mp4','video/webm']:['image/jpeg','image/png','image/webp'];
  if(!['image','video'].includes(kind)||!types.includes(type)||!Number.isSafeInteger(size)||size<1||size>(kind==='video'?50:5)*1024*1024)return error('Use fotos até 5 MB ou vídeos MP4/WebM até 50 MB.');
  const id=crypto.randomUUID(),chunks=Math.ceil(size/CHUNK_SIZE);
  await media.setJSON('pending/'+id,{size,type,chunks,chunkSize:CHUNK_SIZE});return Response.json({id,chunks,chunkSize:CHUNK_SIZE});
 }
 if(data.action==='finish'&&typeof data.id==='string'&&validId(data.id)){
  const manifest=await media.get('pending/'+data.id,{type:'json'}) as MediaManifest|null;
  if(!manifest)return error('Envio não encontrado.');
  for(let i=0;i<manifest.chunks;i++)if(!await media.getMetadata(`parts/${data.id}/${i}`))return error('O arquivo ainda não foi enviado por completo.');
  await media.setJSON('files/'+data.id,manifest);await media.delete('pending/'+data.id);
  return Response.json({url:(manifest.type.startsWith('video/')?'/api/video/':'/api/image/')+data.id});
 }
 return error('Envio inválido.');
 }catch{return error('Não foi possível enviar o arquivo. Tente novamente.',500);}
}
export async function PUT(request:Request){
 if(!isAdmin(request))return error('Senha incorreta.',401);
 const url=new URL(request.url),id=url.searchParams.get('id')||'',raw=url.searchParams.get('index')||'';
 if(!validId(id)||!/^\d+$/.test(raw))return error('Parte inválida.');
 const index=Number(raw);
 try{
  const media=store('media'),manifest=await media.get('pending/'+id,{type:'json'}) as MediaManifest|null;
  if(!manifest||index>=manifest.chunks)return error('Envio não encontrado.');
  const expected=Math.min(manifest.chunkSize,manifest.size-index*manifest.chunkSize);
  if(Number(request.headers.get('content-length'))>CHUNK_SIZE)return error('Parte muito grande.',413);
  const bytes=await request.arrayBuffer();if(bytes.byteLength!==expected)return error('Tamanho da parte inválido.');
  await media.set(`parts/${id}/${index}`,bytes);return Response.json({ok:true});
 }catch{return error('Não foi possível enviar esta parte.',500);}
}
