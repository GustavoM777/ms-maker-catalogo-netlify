import {readProducts,writeProduct} from '../../../lib/storage';
import {initialProducts, MAX_PRODUCT_IMAGES, type Product} from '../../../lib/products';
import {isAdmin} from '../../../lib/admin';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 try {const saved=await readProducts();
 const map=new Map(initialProducts.map(p=>[p.id,p])); for(const product of saved)map.set(product.id,product);
 return Response.json({products:[...map.values()].filter(p=>!p.deleted&&(isAdmin(request)||p.active))},{headers:{'Cache-Control':'no-store'}});
 }catch {return Response.json({error:'Não foi possível carregar o catálogo. Tente novamente.'},{status:503});}
}
export async function POST(request:Request) {
 if(!isAdmin(request))return Response.json({error:'Senha incorreta.'},{status:401});
 try {const p=await request.json() as Product;
 if(typeof p.id!=='string'||!p.id||p.id.length>100||typeof p.name!=='string'||!p.name.trim()||p.name.length>150||typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<0||typeof p.category!=='string'||typeof p.description!=='string'||typeof p.details!=='string'||typeof p.image!=='string'||!/^\/(products\/|api\/image\/)[a-zA-Z0-9_.-]+$/.test(p.image)) return Response.json({error:'Confira os campos e adicione uma foto válida.'},{status:400});
 if(p.video!==undefined && (typeof p.video!=='string'||(p.video!==''&&!/^\/(api\/video\/[a-f0-9-]{36}|videos\/[a-f0-9-]{36}\.(mp4|webm))$/.test(p.video))))return Response.json({error:'Envie um vídeo válido pelo painel.'},{status:400});
 if(p.images!==undefined&&(!Array.isArray(p.images)||p.images.length<1||p.images.length>MAX_PRODUCT_IMAGES||p.images.some(url=>typeof url!=='string'||!/^\/(products\/|api\/image\/)[a-zA-Z0-9_.-]+$/.test(url))||p.images[0]!==p.image||new Set(p.images).size!==p.images.length))return Response.json({error:'Use até 10 fotos válidas e escolha a primeira como capa.'},{status:400});
 if(p.variants!==undefined&&(!Array.isArray(p.variants)||p.variants.length>20||p.variants.some(v=>!Number.isInteger(v.quantity)||v.quantity<1||!Number.isFinite(v.price)||v.price<0||(v.image!==undefined&&!/^\/(products\/|api\/image\/)[a-zA-Z0-9_.-]+$/.test(v.image)))))return Response.json({error:'Confira as quantidades e os preços dos kits.'},{status:400});
 const clean:Product={id:p.id,name:p.name.trim(),description:p.description.slice(0,1500),price:p.variants?.length?Math.min(...p.variants.map(v=>v.price)):p.price,category:p.category.slice(0,80),image:p.image,details:p.details.slice(0,3000),active:p.active===true,video:p.video||'',images:p.images||[p.image],variants:p.variants||[],deleted:p.deleted===true};
 await writeProduct(clean);return Response.json({ok:true});
 }catch{return Response.json({error:'Não foi possível salvar. Tente novamente.'},{status:500});}
}
