// Keep every request below serverless request limits, including 50 MB videos.
export async function uploadMedia(file:Blob,password:string,kind:'image'|'video'){
 const headers={authorization:'Bearer '+password,'Content-Type':'application/json'};
 const start=await fetch('/api/upload',{method:'POST',headers,body:JSON.stringify({action:'start',type:file.type,size:file.size,kind})});
 const session=await start.json();
 if(!start.ok)throw Error(session.error||'Não foi possível iniciar o envio.');
 for(let index=0;index<session.chunks;index++){
  const part=file.slice(index*session.chunkSize,Math.min(file.size,(index+1)*session.chunkSize));
  const r=await fetch(`/api/upload?id=${session.id}&index=${index}`,{method:'PUT',headers:{authorization:'Bearer '+password},body:part});
  if(!r.ok){const d=await r.json();throw Error(d.error||'Falha ao enviar uma parte do arquivo.');}
 }
 const finish=await fetch('/api/upload',{method:'POST',headers,body:JSON.stringify({action:'finish',id:session.id})});
 const result=await finish.json();if(!finish.ok||!result.url)throw Error(result.error||'Não foi possível concluir o envio.');
 return result.url as string;
}
