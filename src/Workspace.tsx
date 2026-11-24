import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {copy, type Lang} from './data';
import './workspace.css';
import {scene, clamp} from './scene';

type AppId = 'home'|'about'|'work'|'experience'|'cv'|'extra'|'contact';
const APPS: AppId[] = ['about','work','experience','cv','extra','contact'];
const VALID: AppId[] = ['home',...APPS];
const labels = {
 en:{enter:'Enter workspace',classic:'Classic view',cinema:'Immersive view',back:'Back to intro',scroll:'Scroll to enter',home:'Home',cv:'Résumé',extra:'Lab & interests',desk:'Workspace',phone:'Mobile workspace',choose:'Explore my workspace',hint:'Open an app to explore my experience, projects and interests.',direct:'Skip animation',close:'Close window',available:'Six apps · one portfolio'},
 it:{enter:'Entra nel workspace',classic:'Vista classica',cinema:'Vista immersiva',back:'Torna all’intro',scroll:'Scorri per entrare',home:'Home',cv:'Curriculum',extra:'Lab e interessi',desk:'Workspace',phone:'Workspace mobile',choose:'Esplora il mio workspace',hint:'Apri un’app per esplorare i miei progetti, il percorso e gli interessi.',direct:'Salta animazione',close:'Chiudi finestra',available:'Sei app · un portfolio'}
};
function Glyph({id}:{id:AppId}){
 const paths:Record<AppId,React.ReactNode>={
  home:<><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-6h6v6"/></>,
  about:<><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
  work:<><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 12h18M10 12v2h4v-2"/></>,
  experience:<><path d="M5 3v18M5 6h6m-6 6h10m-10 6h6"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></>,
  cv:<><path d="M5 3h10l4 4v14H5Z M15 3v5h4M8 12h8m-8 4h8"/></>,
  extra:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 4 3-4 3m6 1h4"/></>,
  contact:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}
function hashApp():AppId {const h=location.hash.slice(1) as AppId;return VALID.includes(h)?h:'home'}
export function Workspace({lang,cv,children}:{lang:Lang;cv:string;children:React.ReactNode}){
 const t=copy[lang], w=labels[lang];
 const [classic,setClassic]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [ready,setReady]=useState(false);
 const [introVisible,setIntroVisible]=useState(true);
 const [active,setActive]=useState<AppId>(hashApp);
 const introRef=useRef<HTMLDivElement>(null);
 const stage=useRef<HTMLDivElement>(null),sticky=useRef<HTMLDivElement>(null),screen=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null);
 const entered=useRef(false), initial=useRef(false), focusApp=useRef(false), activeRef=useRef(active);
 const names:Record<AppId,string>={home:w.home,about:t.nav[0],work:t.nav[1],experience:t.nav[2],cv:w.cv,extra:w.extra,contact:t.nav[3]};
 const kids=React.Children.toArray(children);const ids:AppId[]=['about','work','experience','extra','contact'];
 function jump(end:boolean){const s=stage.current, v=sticky.current;if(!s||!v)return;const nav=document.querySelector('header.nav')?.getBoundingClientRect().height||0;const top=s.getBoundingClientRect().top+window.scrollY-nav;window.scrollTo({top:Math.max(0,top+(end?Math.max(0,s.offsetHeight-v.offsetHeight):0)),behavior:'instant'});}
 function select(id:AppId,updateHash=true,focus=false){activeRef.current=id;setActive(id);focusApp.current=focus;if(updateHash&&location.hash!==`#${id}`)window.history.replaceState(null,'',`#${id}`);if(classic){requestAnimationFrame(()=>document.getElementById(id==='home'?'main':id)?.scrollIntoView({block:'start',behavior:'instant'}));}else if(!entered.current||(stage.current&&sticky.current&&stage.current.getBoundingClientRect().bottom<sticky.current.getBoundingClientRect().height+(document.querySelector('header.nav')?.getBoundingClientRect().height||0)-2)){jump(true)}else if(body.current){body.current.scrollTop=0;if(focus)requestAnimationFrame(()=>body.current?.focus({preventScroll:true}));}}
 function back(){focusApp.current=false;window.history.replaceState(null,'','#main');activeRef.current='home';setActive('home');jump(false);requestAnimationFrame(()=>document.getElementById('intro-title')?.focus({preventScroll:true}));}
 function changeMode(){const next=!classic;setClassic(next);window.history.replaceState(null,'','#main');activeRef.current='home';setActive('home');requestAnimationFrame(()=>{if(next){window.scrollTo({top:0,behavior:'instant'});}else{jump(false);}});}
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const cb=()=>{setReduced(m.matches);if(m.matches)setClassic(true)};m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb)},[]);
 useLayoutEffect(()=>{
  if(classic){entered.current=false;setReady(false);setIntroVisible(true);return;}
  const s=stage.current,v=sticky.current,d=screen.current;if(!s||!v||!d)return;
  let frame=0;let lastReady=false;let lastIntro:boolean|undefined;
  const draw=()=>{frame=0;const nav=document.querySelector('header.nav')?.getBoundingClientRect().height||0;s.style.setProperty('--nav-h',`${nav}px`);const width=v.clientWidth,height=v.clientHeight;const distance=Math.max(1,s.offsetHeight-height);const p=reduced?1:clamp((nav-s.getBoundingClientRect().top)/distance,0,1);const introBottom=(introRef.current?.offsetTop||0)+(introRef.current?.offsetHeight||0);const f=scene(width,height,p,introBottom);
   d.style.setProperty('--device-w',`${f.width}px`);d.style.setProperty('--device-h',`${f.height}px`);d.style.setProperty('--device-x',`${f.x}px`);d.style.setProperty('--device-y',`${f.y}px`);d.style.setProperty('--device-radius',`${f.radius}px`);d.style.setProperty('--bezel',`${f.bezel}px`);d.style.setProperty('--stand',`${f.fade}`);v.style.setProperty('--intro-opacity',`${f.fade}`);v.style.setProperty('--intro-shift',`${f.shift}px`);v.style.setProperty('--progress',`${p*100}%`);
   const now=f.ready;if(now!==lastReady||entered.current!==now){lastReady=now;entered.current=now;setReady(now);}if(f.introVisible!==lastIntro){lastIntro=f.introVisible;setIntroVisible(f.introVisible);}

  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(draw)};const ro=new ResizeObserver(queue);ro.observe(v);if(introRef.current)ro.observe(introRef.current);const nav=document.querySelector('header.nav');if(nav)ro.observe(nav);window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);draw();return()=>{if(frame)cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);};
 },[classic,reduced]);
 useLayoutEffect(()=>{if(!classic&&body.current)body.current.scrollTop=0;},[active,classic]);
 useEffect(()=>{if(ready&&focusApp.current){focusApp.current=false;body.current?.focus({preventScroll:true})}},[ready,active]);
 useEffect(()=>{const navigate=(e:Event)=>{const id=(e as CustomEvent<AppId>).detail;if(VALID.includes(id))select(id,false,true)};const hash=()=>{const id=hashApp();if(location.hash==='#main'){if(!classic)back();return;}if(VALID.includes(location.hash.slice(1) as AppId))select(id,false);};window.addEventListener('portfolio:navigate',navigate);window.addEventListener('hashchange',hash);return()=>{window.removeEventListener('portfolio:navigate',navigate);window.removeEventListener('hashchange',hash)}},[classic]);
 useEffect(()=>{if(initial.current)return;initial.current=true;if(location.hash&&location.hash!=='#main'&&VALID.includes(location.hash.slice(1) as AppId))requestAnimationFrame(()=>select(hashApp(),false));},[]);
 const intro=<div className="ws-intro" ref={introRef} aria-hidden={!classic&&!introVisible} inert={!classic&&!introVisible}><span className="eyebrow">FULL-STACK DEVELOPER / FRONT-END FOCUS</span><h1 id="intro-title" tabIndex={-1}>Salvatore Bosco<span>.</span></h1><h2>{t.hero}</h2><p>{t.intro}</p><div className="ws-intro-actions"><button className="primary" onClick={()=>{if(classic){setClassic(false);requestAnimationFrame(()=>jump(true))}else jump(true)}}>{w.enter} ↗</button><a className="secondary" href={cv} download>{t.cv} ↓</a><button className="ws-text-btn" onClick={changeMode}>{classic?w.cinema:w.classic}</button></div></div>;
 return <div className={`workspace-stage ${classic?'ws-classic':''} ${reduced?'ws-reduced':''}`} ref={stage}><div className="ws-sticky" ref={sticky}>
  {intro}
  {!classic&&<><div className="ws-ambient" aria-hidden="true"><span className="ws-float ws-left"><small>01 / LOCATION</small><strong>Como, Italy</strong><small>45° 48′ N</small></span><span className="ws-float ws-right"><small>02 / TECH STACK</small><strong>React · TypeScript</strong><small>Laravel · Expo</small></span><span className="ws-float ws-bottom-left"><small>03 / EXPERIENCE</small><strong>2022 —</strong><small>DESIGN × CODE</small></span></div><div className="ws-progress" aria-hidden="true"><span>{w.scroll} ↓</span><i/></div></>}
  <div className="ws-device" ref={screen} data-ready={ready||classic}>
   {!classic&&!ready&&<div className="ws-preview" aria-hidden="true"><div className="ws-preview-bar"><span>SB / OS</span><span>● ● ●</span></div><div className="ws-preview-grid"><div className="ws-preview-orb"><span>&lt;/&gt;</span></div><div className="ws-preview-title">Digital<br/>workspace<span>.</span></div><div className="ws-preview-icons">{APPS.map(id=><span key={id}><Glyph id={id}/></span>)}</div></div><div className="ws-preview-bottom">DESIGN × ENGINEERING <span>01</span></div></div>}
   <div className="ws-interface" hidden={!classic&&!ready}>
    {!classic&&<><div className="ws-osbar"><button className="ws-brand" onClick={()=>select('home',true,true)}><b>SB<span>.</span></b><small>{w.desk}</small></button><div className="ws-os-actions"><button onClick={back}>{w.back} ↑</button><button onClick={changeMode}>{w.classic}</button></div></div><div className="ws-windowbar" hidden={active==='home'}><span><Glyph id={active}/>{names[active]}</span><button aria-label={w.close} onClick={()=>select('home',true,true)}>×</button></div></>}
    <div className="ws-body" ref={body} tabIndex={-1} aria-label={classic?t.about:names[active]}>
     {!classic&&<div className="ws-home" hidden={active!=='home'}><div className="ws-home-heading"><span className="eyebrow">SB / WORKSPACE — 2026</span><h2>{w.choose}<span>.</span></h2><p>{w.hint}</p></div><div className="ws-apps">{APPS.map(id=><button className={`ws-app ws-app-${id}`} key={id} onClick={()=>select(id,true,true)}><span className="ws-app-icon"><Glyph id={id}/></span><strong>{names[id]}</strong><span aria-hidden="true">↗</span></button>)}</div><span className="ws-home-note">{w.available}</span></div>}
     {kids.map((child,i)=><div className="ws-panel" key={ids[i]} hidden={!classic&&active!==ids[i]}>{child}</div>)}
     <div id="cv" className="ws-panel" hidden={!classic&&active!=='cv'}><section className="section ws-cv"><div className="section-top"><span className="eyebrow">PDF / RÉSUMÉ</span><h2>{t.cv}<span className="accent">.</span></h2></div><div className="card"><h3>Salvatore Bosco — 2026</h3><p>{t.intro}</p><div className="buttons"><a className="primary" href={`${import.meta.env.BASE_URL}cv/cv-en.pdf`} download>English ↓</a><a className="secondary" href={`${import.meta.env.BASE_URL}cv/cv-it.pdf`} download>Italiano ↓</a></div></div></section></div>
    </div>
    {!classic&&<nav className="ws-dock" aria-label={w.desk}>{VALID.map(id=><button key={id} aria-current={active===id?'page':undefined} onClick={()=>select(id,true,true)} title={names[id]}><Glyph id={id}/><span>{names[id]}</span></button>)}</nav>}
   </div>
  </div>
 </div></div>;
}
