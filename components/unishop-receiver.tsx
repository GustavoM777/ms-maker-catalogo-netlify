'use client';
import {uploadMedia} from '../lib/upload-client';
import {useEffect,useRef,useState} from 'react';
import {UNISHOP_ORIGIN,validateTransfer,type Transfer} from '../lib/unishop-transfer';
import type {Product} from '../lib/products';
export default function UnishopReceiver({logged,password,onDone,onBusy}:{logged:boolean;password:string;onDone:()=>Promise<void>;onBusy:(busy:boolean)=>void}){
 const [pending,setPending]=useState<Transfer|null>(null),[status,setStatus]=useState('');
 const active=useRef<string|null>(null),handled=useRef(new Set<string>()),callbacks=useRef({onDone,onBusy});callbacks.current={onDone,onBusy};
 useEffect(()=>{
 if(!window.opener)return;
 const reply=(data:unknown)=>window.opener?.postMessage(data,UNISHOP_ORIGIN);
 const ready=()=>reply({type:'maker:ready'});
 const receive=(event:MessageEvent)=>{
 if(event.origin!==UNISHOP_ORIGIN||event.source!==window.opener)return;
 if(event.data?.type==='unishop:ping'){ready();return;}
 if(event.data?.type!=='unishop:publish')return;
 let packet:Transfer;try{packet=validateTransfer(event.data);}catch(error){reply({type:'maker:error',requestId:event.data?.requestId,message:(error as Error).message});return;}
 if(handled.current.has(packet.requestId))return;
 if(active.current&&active.current!==packet.requestId){reply({type:'maker:error',requestId:packet.requestId,message:'Outro envio está em andamento neste painel.'});return;}
 active.current=packet.requestId;setPending(packet);setStatus('Produto recebido da Unishop. Entre no painel para publicar automaticamente pelo preço escolhido.');reply({type:'maker:received',requestId:packet.requestId});
 };
 window.addEventListener('message',receive);ready();const interval=setInterval(ready,1500);
 return()=>{window.removeEventListener('message',receive);clearInterval(interval);};
 },[]);
 useEffect(()=>{
 if(!logged||!password||!pending||handled.current.has(pending.requestId))return;
 const packet=pending;handled.current.add(packet.requestId);callbacks.current.onBusy(true);
 const headers={authorization:'Bearer '+password};
 const reply=(data:unknown)=>window.opener?.postMessage({...data as object,requestId:packet.requestId},UNISHOP_ORIGIN);
 (async()=>{
 try{
 const p=packet.product;
 // Retrieve the current record to preserve an existing video. The ID is stable across retries.
 const list=await fetch('/api/products',{headers});if(!list.ok)throw Error('Entre novamente no painel para concluir o envio.');
 const data=await list.json() as {products:Product[]};const existing=data.products.find(x=>x.id===p.id);
 const images:string[]=[];
 for(let i=0;i<p.images.length;i++){
 setStatus(`Enviando ${p.name}: foto ${i+1} de ${p.images.length}…`);
 const blob=await(await fetch(p.images[i])).blob();if(!['image/jpeg','image/png','image/webp'].includes(blob.type)||blob.size>5*1024*1024||blob.size===0)throw Error('Uma foto é inválida ou excede 5 MB.');
 images.push(await uploadMedia(blob,password,'image'));
 }
 const item:Product={id:p.id,name:p.name,description:p.description,details:p.details,category:p.category,price:p.price,image:images[0],images,video:existing?.video||'',active:true,variants:[]};
 const response=await fetch('/api/products',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(item)});const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||'Não foi possível publicar o produto.');
 setStatus(`${existing?'Produto atualizado':'Produto publicado'}: ${p.name}, ${p.quantity} ${p.quantity===1?'unidade':'unidades'}, ${p.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}. Já disponível no catálogo.`);
 reply({type:'maker:done',productId:p.id});try{await callbacks.current.onDone();}catch{/* Publication already succeeded; a list refresh failure must not report a failed publish. */}
 }catch(error){const message=(error as Error).message;setStatus('Envio não concluído: '+message+' Volte à Unishop para tentar novamente.');reply({type:'maker:error',message});}
 finally{active.current=null;callbacks.current.onBusy(false);setPending(null);}
 })();
 },[logged,password,pending]);
 if(!status)return null;
 return <section className="notice" role="status"><strong>Envio da Unishop Brasil</strong><p>{status}</p>{pending&&<p>{pending.product.name} · {pending.product.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} · {pending.product.quantity} unidade(s)</p>}<a href="/" target="_blank" rel="noopener noreferrer">Abrir catálogo MS Maker3D</a></section>;
}
