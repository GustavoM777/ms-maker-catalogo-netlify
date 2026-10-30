export const UNISHOP_ORIGIN='https://ms-maker-central-anuncios.supernewt16.chatgpt.site';
export type IncomingProduct={id:string;name:string;description:string;details:string;category:string;price:number;quantity:number;images:string[]};
export type Transfer={type:'unishop:publish';version:1;requestId:string;product:IncomingProduct};
export function validateTransfer(value:unknown):Transfer{
 if(!value||typeof value!=='object')throw Error('Envio inválido.');
 const v=value as Transfer,p=v.product;
 if(v.type!=='unishop:publish'||v.version!==1||typeof v.requestId!=='string'||v.requestId.length>100||!p||!/^unishop-[a-zA-Z0-9_-]{1,80}$/.test(p.id))throw Error('Identificação inválida do envio.');
 if(typeof p.name!=='string'||!p.name.trim()||p.name.length>150||typeof p.description!=='string'||!p.description.trim()||p.description.length>1500||typeof p.details!=='string'||p.details.length>3000||typeof p.category!=='string'||!p.category.trim()||p.category.length>80)throw Error('Confira os dados públicos do produto na Unishop.');
 if(!Number.isFinite(p.price)||p.price<=0||!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>10000)throw Error('Preço ou quantidade inválidos.');
 if(!Array.isArray(p.images)||p.images.length<1||p.images.length>10||p.images.some(x=>typeof x!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x)||x.length>7*1024*1024))throw Error('Envie de 1 a 10 fotos válidas.');
 return v;
}
