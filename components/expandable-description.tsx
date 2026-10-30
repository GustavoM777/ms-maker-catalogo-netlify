'use client';
import {useId,useState} from 'react';
export default function ExpandableDescription({text,limit=160,className=''}:{text:string;limit?:number;className?:string}){
 const [expanded,setExpanded]=useState(false);const id=useId();const full=text.trim();if(!full)return null;
 const long=full.length>limit;let excerpt=full.slice(0,limit);const boundary=excerpt.lastIndexOf(' ');if(boundary>limit*.65)excerpt=excerpt.slice(0,boundary);
 return <div className={'expandable-description '+className}><p id={id}>{expanded||!long?full:excerpt.trimEnd()+'…'}</p>{long&&<button type="button" className="description-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{expanded?'Ver menos':'Ver mais'}</button>}</div>;
}
