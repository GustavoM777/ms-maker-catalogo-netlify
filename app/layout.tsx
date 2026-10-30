import type {Metadata,Viewport} from 'next';
import './globals.css';
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#0c2b3c'};
export const metadata:Metadata={title:'MS Maker3D | Presentes que têm a sua cara',description:'Decoração, presentes e peças personalizadas. Escolha seu favorito e faça seu pedido pelo WhatsApp.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
