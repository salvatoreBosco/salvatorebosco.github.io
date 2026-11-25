import React,{useEffect,useRef,useState} from 'react';
import {copy,type Lang} from './data';
import type {JourneyEngine} from './journey3d';
import {checkpoints} from './journeyLogic';

export function ExperienceApp({lang,active,classicContent}:{lang:Lang;active:boolean;classicContent:React.ReactNode}){
 const it=lang==='it',t=copy[lang];
 const stations=[
  {date:'2014 – 2019',title:it?'Diploma':'Diploma',organization:'ITIS Magistri Cumacini',detail:t.diploma},
  {date:'2020 – '+t.current,title:it?'Università':'University',organization:'Politecnico di Milano',detail:t.degree},
  {date:'09.2022 – 08.2023',title:it?'Tirocinio':'Internship',organization:'TEA WEB SAS · Como',detail:t.intern},
  {date:'09.2023 – '+t.current,title:'Full-stack Developer',organization:'TEA WEB SAS · Como',detail:t.experienceText}
 ];
 const [mode,setMode]=useState<'3d'|'list'>(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'list':'3d');
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const [near,setNear]=useState(-1),[selected,setSelected]=useState<number|null>(null);
 const host=useRef<HTMLDivElement>(null),game=useRef<HTMLDivElement>(null),engine=useRef<JourneyEngine|undefined>(undefined),keys=useRef(new Set<string>());
 const activeRef=useRef(active);activeRef.current=active;
 const selectedRef=useRef(selected);selectedRef.current=selected;
 const visibleRef=useRef(!document.hidden);
 const nearRef=useRef(-1);
 function stop(){keys.current.clear();engine.current?.setDirection(0,0)}
 function updateDirection(){const k=keys.current;engine.current?.setDirection(Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft')),Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup')))}
 useEffect(()=>{
  if(mode!=='3d'||!host.current)return;let disposed=false;let e:JourneyEngine|undefined;setStatus('loading');setNear(-1);nearRef.current=-1;setSelected(null);
  import('./journey3d').then(mod=>{
   if(disposed||!host.current)return;
   try{e=mod.createJourney(host.current,idx=>{nearRef.current=idx;setNear(idx)},()=>{if(!disposed){setStatus('error');e?.setActive(false)}});engine.current=e;setStatus('ready');e.setActive(activeRef.current&&visibleRef.current)}
   catch{if(!disposed)setStatus('error')}
  }).catch(()=>{if(!disposed)setStatus('error')});
  return()=>{disposed=true;e?.dispose();if(engine.current===e)engine.current=undefined;keys.current.clear()};
 },[mode,lang]);
 useEffect(()=>{stop();engine.current?.setActive(active&&mode==='3d'&&selected===null&&!document.hidden&&status==='ready')},[active,mode,selected,status]);
 useEffect(()=>{
  const blur=()=>stop();
  const visibility=()=>{visibleRef.current=!document.hidden;stop();engine.current?.setActive(activeRef.current&&visibleRef.current&&selectedRef.current===null)};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility)}
 },[]);
 const allowed=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
 function keyDown(e:React.KeyboardEvent<HTMLDivElement>){
  if(!active||mode!=='3d'||status!=='ready'||e.altKey||e.ctrlKey||e.metaKey)return;
  const k=e.key.toLowerCase();if(k==='escape'&&selected!==null){e.preventDefault();setSelected(null);return}
  if(selected!==null||e.target instanceof HTMLButtonElement)return;
  if(allowed.includes(k)){e.preventDefault();e.stopPropagation();keys.current.add(k);updateDirection()}
  else if(k==='e'&&nearRef.current>=0){e.preventDefault();stop();setSelected(nearRef.current)}
 }
 function keyUp(e:React.KeyboardEvent<HTMLDivElement>){const k=e.key.toLowerCase();if(allowed.includes(k)){e.preventDefault();keys.current.delete(k);updateDirection()}}
 function visit(i:number){if(status!=='ready'){setSelected(i);return}setSelected(null);engine.current?.go(i);game.current?.focus({preventScroll:true})}
 function touch(e:React.PointerEvent<HTMLButtonElement>,x:number,z:number){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);engine.current?.setDirection(x,z)}
 const list=mode==='list'||status==='error';
 return <section className="journey-app" aria-label={it?'Percorso 3D':'3D journey'}>
  <header className="journey-toolbar"><div><span>SB.OS / JOURNEY</span><strong>{it?'Il mio percorso':'My journey'}</strong></div><div className="journey-mode"><button aria-pressed={mode==='3d'} onClick={()=>{if(status==='error'&&mode==='3d'){setMode('list');return}setMode('3d')}}>3D</button><button aria-pressed={mode==='list'} onClick={()=>setMode('list')}>{it?'Timeline':'Timeline'}</button></div></header>
  {mode==='3d'&&<div ref={game} tabIndex={0} className="journey-game" onKeyDown={keyDown} onKeyUp={keyUp} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))stop()}} aria-label={it?'Area di gioco. WASD o frecce per muoversi, E per interagire.':'Game area. WASD or arrows to move, E to interact.'}>
   <div className="journey-canvas" ref={host} onPointerDown={()=>game.current?.focus({preventScroll:true})}/>
   {status==='loading'&&<div className="journey-message" role="status">{it?'Caricamento del mondo 3D…':'Loading the 3D world…'}</div>}
   {status==='error'&&<div className="journey-message" role="status">{it?'WebGL non disponibile. Usa la timeline.':'WebGL unavailable. Use the timeline.'}</div>}
   {status==='ready'&&<><div className="journey-hud"><span>{it?'ESPLORAZIONE':'EXPLORATION'}</span><span>{near>=0?stations[near].organization:it?'Segui il percorso luminoso':'Follow the illuminated path'}</span></div><button className="journey-reset" onClick={()=>{setSelected(null);engine.current?.reset();game.current?.focus({preventScroll:true})}}>{it?'Ricomincia':'Restart'}</button>
    <div className="journey-controls" aria-label={it?'Controlli movimento':'Movement controls'}>{[[0,-1,'↑'],[-1,0,'←'],[0,1,'↓'],[1,0,'→']].map(([x,z,label])=><button key={label} aria-label={String(label)} onPointerDown={e=>touch(e,Number(x),Number(z))} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>{label}</button>)}</div>
    <div className="journey-interact">{near>=0?<button onClick={()=>{stop();setSelected(near)}}>E · {it?'Scopri esperienza':'Explore experience'}</button>:<span>{it?'WASD / frecce · avvicinati a una tappa':'WASD / arrows · approach a station'}</span>}</div>
   </>}
   {selected!==null&&!list&&<div className="journey-detail"><span>{stations[selected].date}</span><h3>{stations[selected].title}</h3><strong>{stations[selected].organization}</strong><p>{stations[selected].detail}</p><button autoFocus onClick={()=>{setSelected(null);requestAnimationFrame(()=>game.current?.focus({preventScroll:true}))}}>{it?'Continua il percorso':'Continue journey'}</button></div>}
  </div>}
  {!list&&<nav className="journey-stations" aria-label={it?'Tappe del percorso':'Journey stations'}>{checkpoints.map((c,i)=><button key={c.id} aria-current={near===i?'step':undefined} onClick={()=>visit(i)}><span>0{i+1}</span><strong>{stations[i].title}</strong><small>{stations[i].date}</small></button>)}</nav>}
  {list&&<div className="journey-list">{classicContent}</div>}
 </section>;
}
