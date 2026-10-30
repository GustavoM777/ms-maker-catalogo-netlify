import {timingSafeEqual} from 'node:crypto';
export function isAdmin(request:Request) {
 const expected=process.env.ADMIN_PASSWORD,supplied=request.headers.get('authorization');
 if(!expected||!supplied)return false;
 const a=Buffer.from('Bearer '+expected),b=Buffer.from(supplied);
 return a.length===b.length&&timingSafeEqual(a,b);
}
