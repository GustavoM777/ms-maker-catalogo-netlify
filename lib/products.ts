import catalog from '../data/catalog.json';
export type ProductVariant={quantity:number;price:number;image?:string};
export type Product = {id:string; name:string; description:string; price:number; category:string; image:string; details:string; active:boolean; video?:string; images?:string[]; variants?:ProductVariant[]; deleted?:boolean};
export const initialProducts:Product[] = catalog as Product[];

export const MAX_PRODUCT_IMAGES=10;
export function productImages(p:Pick<Product,'image'|'images'>):string[]{return [...new Set([p.image,...(p.images||[])].filter(Boolean))].slice(0,MAX_PRODUCT_IMAGES);}
export function withProductImages(p:Product,images:string[]):Product{return {...p,image:images[0]||'',images};}
