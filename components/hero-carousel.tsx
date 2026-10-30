'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import type {Product} from '../lib/products';
export default function HeroCarousel({products,onSelect}:{products:Product[];onSelect:(p:Product)=>void}){
 const slides=products.filter(p=>p.active&&!p.deleted&&p.image);const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true);const touchStart=useRef<number|null>(null);
 useEffect(()=>{if(!playing||slides.length<2)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%slides.length);},3000);return()=>clearInterval(timer);},[playing,slides.length]);
 if(!slides.length)return null;const current=index%slides.length;const move=(step:number)=>setIndex(i=>(i+step+slides.length)%slides.length);
 return <section className="hero-banner" aria-label="Imagens dos produtos" aria-roledescription="carrossel">
 <div className="hero-banner-viewport" onTouchStart={e=>{touchStart.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>{if(touchStart.current===null)return;const diff=(e.changedTouches[0]?.clientX??touchStart.current)-touchStart.current;if(Math.abs(diff)>45)move(diff<0?1:-1);touchStart.current=null;}}>
 <div className="hero-banner-track" style={{transform:`translate3d(-${current*100}%,0,0)`}}>{slides.map((p,i)=><div key={p.id} className="hero-banner-slide" role="group" aria-roledescription="slide" aria-label={`${i+1} de ${slides.length}`} aria-hidden={i!==current}><button type="button" onClick={()=>onSelect(p)} aria-label={'Ver '+p.name} tabIndex={i===current?0:-1}><img src={p.image} alt={p.name} loading={i<2?'eager':'lazy'} draggable={false}/></button></div>)}</div>
 {slides.length>1&&<><button type="button" className="banner-arrow banner-prev" aria-label="Imagem anterior" onClick={()=>move(-1)}><ChevronLeft size={22}/></button><button type="button" className="banner-arrow banner-next" aria-label="Próxima imagem" onClick={()=>move(1)}><ChevronRight size={22}/></button></>}
 </div>
 {slides.length>1&&<div className="banner-controls"><div className="banner-dots">{slides.map((p,i)=><button type="button" key={p.id} className={i===current?'active':''} aria-label={`Mostrar imagem de ${p.name}`} aria-pressed={i===current} onClick={()=>setIndex(i)}><span/></button>)}</div><button type="button" className="banner-play" aria-label={playing?'Pausar passagem automática':'Retomar passagem automática'} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={16}/>:<Play size={16}/>}</button></div>}
 </section>;
}
