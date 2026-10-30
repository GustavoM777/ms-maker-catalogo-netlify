import {getStore} from '@netlify/blobs';
import type {Product} from './products';
// Site-wide stores survive deploys. Isolate previews from production data.
export function store(name:string){
 const context=process.env.CONTEXT;
 const suffix=context&&context!=='production'?'-'+(process.env.DEPLOY_ID||context):'';
 return getStore({name:'maker-'+name+suffix,consistency:'strong'});
}
export async function readProducts():Promise<Product[]>{
 const db=store('products');
 const {blobs}=await db.list();
 const products=await Promise.all(blobs.map(b=>db.get(b.key,{type:'json'}) as Promise<Product|null>));
 return products.filter((p):p is Product=>!!p);
}
export async function writeProduct(product:Product){await store('products').setJSON(product.id,product);}
export const CHUNK_SIZE=2*1024*1024;
export type MediaManifest={size:number;type:string;chunks:number;chunkSize:number};
export function validId(id:string){return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);}
