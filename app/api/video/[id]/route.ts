import {mediaResponse} from '../../../../lib/media-response';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return mediaResponse(request,(await context.params).id,'video');}
export const HEAD=GET;
