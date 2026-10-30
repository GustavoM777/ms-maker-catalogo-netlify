import {store,validId,type MediaManifest} from './storage';
import {parseVideoRange} from './video-range';
export async function mediaResponse(request:Request,id:string,kind:'image'|'video'){
 if(!validId(id))return new Response('Not found',{status:404});
 const media=store('media');
 const manifest=await media.get('files/'+id,{type:'json'}) as MediaManifest|null;
 if(!manifest||!manifest.type.startsWith(kind+'/'))return new Response('Not found',{status:404});
 const headers=new Headers({'Content-Type':manifest.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});
 const rangeHeader=request.headers.get('range');
 const range=rangeHeader?parseVideoRange(rangeHeader,manifest.size):undefined;
 if(range===null){headers.set('Content-Range','bytes */'+manifest.size);return new Response(null,{status:416,headers});}
 const offset=range?.offset||0,length=range?.length||manifest.size,end=offset+length;
 headers.set('Content-Length',String(length));
 if(range)headers.set('Content-Range',`bytes ${offset}-${end-1}/${manifest.size}`);
 if(request.method==='HEAD')return new Response(null,{status:range?206:200,headers});
 let index=Math.floor(offset/manifest.chunkSize);
 const body=new ReadableStream<Uint8Array>({async pull(controller){
  try{
   const part=await media.get(`parts/${id}/${index}`,{type:'arrayBuffer'});
   if(!part)throw Error('Missing media part');
   const start=index*manifest.chunkSize;
   controller.enqueue(new Uint8Array(part).slice(Math.max(0,offset-start),Math.min(part.byteLength,end-start)));
   index++;
   if(index*manifest.chunkSize>=end)controller.close();
  }catch(error){controller.error(error);}
 }});
 return new Response(body,{status:range?206:200,headers});
}
