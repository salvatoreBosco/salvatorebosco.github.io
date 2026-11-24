import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {copy, type Lang} from './data';
import './workspace.css';
import {scene, clamp, studioImageFrame, pointerCamera, smoothPointer} from './scene';
import {Studio} from './Studio';
import {fitWindow,moveWindow,resizeWindow,type Rect} from './windowGeometry';

type AppId = 'home'|'about'|'work'|'experience'|'cv'|'terminal'|'music'|'contact';
const APPS: AppId[] = ['about','work','experience','cv','terminal','music','contact'];
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
  terminal:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 4 3-4 3m6 1h4"/></>,
  music:<><path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3h3m11 1a3 3 0 1 1-3-3h3"/></>,
  contact:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}
function hashApp():AppId {const h=location.hash.slice(1);return h==='extra'?'terminal':VALID.includes(h as AppId)?h as AppId:'home'}
type WindowState={id:AppId;rect:Rect;minimized:boolean;maximized:boolean};
const initialWindow=(id:AppId,index=0):WindowState=>({id,rect:fitWindow(id==='terminal'?{x:.34,y:.19,w:.56,h:.60}:{x:.19+index*.035,y:.07+index*.025,w:.75,h:.83}),minimized:false,maximized:false});
export function Workspace({lang,cv,children}:{lang:Lang;cv:string;children:React.ReactNode}){
 const t=copy[lang], w=labels[lang];
 const [classic,setClassic]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [ready,setReady]=useState(false);
 const [introVisible,setIntroVisible]=useState(true);
 const [mobile,setMobile]=useState(()=>window.innerWidth<=700);
 const [active,setActive]=useState<AppId>(()=>hashApp()!=='home'?hashApp():window.innerWidth<=700?'home':'terminal');
 const [windows,setWindows]=useState<WindowState[]>(()=>{const id=hashApp()!=='home'?hashApp():window.innerWidth<=700?'home':'terminal';return id==='home'?[]:[initialWindow(id)]});
 const [clock,setClock]=useState(()=>new Date());
 const desktop=useRef<HTMLDivElement>(null);
 const gesture=useRef<{id:AppId;mode:'move'|'resize';x:number;y:number;rect:Rect;w:number;h:number}|null>(null);
 useEffect(()=>{const timer=window.setInterval(()=>setClock(new Date()),30000);const resize=()=>setMobile(window.innerWidth<=700);window.addEventListener('resize',resize);return()=>{clearInterval(timer);window.removeEventListener('resize',resize)}},[]);
 const introRef=useRef<HTMLDivElement>(null);
 const stage=useRef<HTMLDivElement>(null),sticky=useRef<HTMLDivElement>(null),screen=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null);
 const entered=useRef(false), initial=useRef(false), focusApp=useRef(false), activeRef=useRef(active);
 const names:Record<AppId,string>={home:w.home,about:t.nav[0],work:t.nav[1],experience:t.nav[2],cv:w.cv,terminal:'Terminal',music:lang==='it'?'Musica':'Music',contact:t.nav[3]};
 const kids=React.Children.toArray(children);const ids=['about','work','experience','extra','contact'];
 const extra=React.isValidElement<{children?:React.ReactNode}>(kids[3])?React.Children.toArray(kids[3].props.children):[];
 function raise(id:AppId){setActive(id);activeRef.current=id;setWindows(old=>{const found=old.find(a=>a.id===id);return [...old.filter(a=>a.id!==id),found?{...found,minimized:false}:initialWindow(id,old.length%4)]})}
 function closeWindow(id:AppId,minimize=false){const remaining=windows.filter(a=>a.id!==id&&!a.minimized);setWindows(old=>minimize?old.map(a=>a.id===id?{...a,minimized:true}:a):old.filter(a=>a.id!==id));if(active===id){const next=mobile?'home':remaining.at(-1)?.id||'home';setActive(next);activeRef.current=next;window.history.replaceState(null,'',`#${next}`)}}
 function toggleMax(id:AppId){setWindows(old=>old.map(a=>a.id===id?{...a,maximized:!a.maximized}:a))}
 function startGesture(e:React.PointerEvent<HTMLElement>,win:WindowState,mode:'move'|'resize'){if(mobile||win.maximized||!desktop.current||e.button!==0)return;const box=desktop.current.getBoundingClientRect();gesture.current={id:win.id,mode,x:e.clientX,y:e.clientY,rect:win.rect,w:box.width,h:box.height};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault()}
 function updateGesture(e:React.PointerEvent<HTMLElement>){const g=gesture.current;if(!g)return;const dx=(e.clientX-g.x)/g.w,dy=(e.clientY-g.y)/g.h;const rect=g.mode==='move'?moveWindow(g.rect,dx,dy):resizeWindow(g.rect,dx,dy);setWindows(old=>old.map(a=>a.id===g.id?{...a,rect}:a))}
 function endGesture(){gesture.current=null}
 function jump(end:boolean){const s=stage.current, v=sticky.current;if(!s||!v)return;const nav=document.querySelector('header.nav')?.getBoundingClientRect().height||0;const top=s.getBoundingClientRect().top+window.scrollY-nav;window.scrollTo({top:Math.max(0,top+(end?Math.max(0,s.offsetHeight-v.offsetHeight):0)),behavior:'instant'});}
 function select(id:AppId,updateHash=true,focus=false){activeRef.current=id;setActive(id);if(!classic&&id!=='home')raise(id);else if(!classic&&!mobile)setWindows(old=>old.map(a=>({...a,minimized:true})));focusApp.current=focus;if(updateHash&&location.hash!==`#${id}`)window.history.replaceState(null,'',`#${id}`);if(classic){requestAnimationFrame(()=>document.getElementById(id==='home'?'main':id==='terminal'||id==='music'?'extra':id)?.scrollIntoView({block:'start',behavior:'instant'}));}else if(!entered.current||(stage.current&&sticky.current&&stage.current.getBoundingClientRect().bottom<sticky.current.getBoundingClientRect().height+(document.querySelector('header.nav')?.getBoundingClientRect().height||0)-2)){jump(true)}else if(body.current){body.current.scrollTop=0;if(focus)requestAnimationFrame(()=>body.current?.focus({preventScroll:true}));}}
 function back(){focusApp.current=false;window.history.replaceState(null,'','#main');activeRef.current=mobile?'home':'terminal';setActive(activeRef.current);setWindows(mobile?[]:[initialWindow('terminal')]);jump(false);requestAnimationFrame(()=>document.getElementById('intro-title')?.focus({preventScroll:true}));}
 function changeMode(){const next=!classic;setClassic(next);window.history.replaceState(null,'','#main');activeRef.current=mobile?'home':'terminal';setActive(activeRef.current);setWindows(mobile?[]:[initialWindow('terminal')]);requestAnimationFrame(()=>{if(next){window.scrollTo({top:0,behavior:'instant'});}else{jump(false);}});}
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const cb=()=>{setReduced(m.matches);if(m.matches)setClassic(true)};m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb)},[]);
 useLayoutEffect(()=>{
  if(classic){entered.current=false;setReady(false);setIntroVisible(true);return;}
  const s=stage.current,v=sticky.current,d=screen.current;if(!s||!v||!d)return;
  let frame=0;let lastReady=false;let lastIntro:boolean|undefined;
  // A separate, on-demand RAF updates only compositor-friendly camera properties.
  // The scroll geometry remains the single source of truth for screen alignment.
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  let cameraFrame=0,lastCameraTime=0,cameraWidth=0,cameraHeight=0,cameraProgress=0;
  let targetX=0,targetY=0,currentX=0,currentY=0;
  const cameraEnabled=()=>!reduced&&fine.matches&&cameraWidth>700&&cameraProgress<.78;
  const drawCamera=(time:number)=>{
   cameraFrame=0;
   const enabled=cameraEnabled();
   if(!enabled){targetX=targetY=currentX=currentY=0;}
   else{
    const dt=lastCameraTime?Math.min(50,Math.max(0,time-lastCameraTime)):16.7;
    currentX=smoothPointer(currentX,targetX,dt);currentY=smoothPointer(currentY,targetY,dt);
   }
   lastCameraTime=time;
   const c=pointerCamera(cameraWidth,cameraHeight,cameraProgress,currentX,currentY,enabled);
   v.style.setProperty('--camera-x',`${c.x}px`);
   v.style.setProperty('--camera-y',`${c.y}px`);
   v.style.setProperty('--camera-scale',String(c.scale));
   v.style.setProperty('--foreground-x',`${c.foregroundX}px`);
   v.style.setProperty('--foreground-y',`${c.foregroundY}px`);
   v.style.setProperty('--sign-x',`${c.signX}px`);
   v.style.setProperty('--sign-y',`${c.signY}px`);
   v.style.setProperty('--camera-light-x',`${50+currentX*22}%`);
   v.style.setProperty('--camera-light-y',`${50+currentY*16}%`);
   v.style.setProperty('--camera-light-opacity',String(c.strength*(.055+Math.hypot(currentX,currentY)*.018)));
   if(enabled&&(Math.abs(currentX-targetX)>.001||Math.abs(currentY-targetY)>.001))cameraFrame=requestAnimationFrame(drawCamera);
   else lastCameraTime=0;
  };
  const queueCamera=()=>{if(!cameraFrame)cameraFrame=requestAnimationFrame(drawCamera)};
  const pointerMove=(e:PointerEvent)=>{
   if(e.pointerType!=='mouse'||!cameraEnabled())return;
   const bounds=v.getBoundingClientRect();
   if(!bounds.width||!bounds.height)return;
   targetX=clamp(2*(e.clientX-bounds.left)/bounds.width-1,-1,1);
   targetY=clamp(2*(e.clientY-bounds.top)/bounds.height-1,-1,1);
   queueCamera();
  };
  const resetPointer=()=>{targetX=targetY=0;queueCamera()};
  const motionChanged=()=>{targetX=targetY=0;queueCamera()};
  const draw=()=>{frame=0;const nav=document.querySelector('header.nav')?.getBoundingClientRect().height||0;s.style.setProperty('--nav-h',`${nav}px`);const width=v.clientWidth,height=v.clientHeight;if(!width||!height)return;const distance=Math.max(1,s.offsetHeight-height);const p=reduced?1:clamp((nav-s.getBoundingClientRect().top)/distance,0,1);const introBottom=(introRef.current?.offsetTop||0)+(introRef.current?.offsetHeight||0);const f=scene(width,height,p,introBottom);cameraWidth=width;cameraHeight=height;cameraProgress=p;queueCamera();
   v.style.setProperty('--room-transform',`translate(${f.roomX}px,${f.roomY}px) scale(${f.roomScale})`);const bg=studioImageFrame(width,height,f.initialWidth,f.initialHeight,f.startY);v.style.setProperty('--studio-bg-w',`${bg.width}px`);v.style.setProperty('--studio-bg-h',`${bg.height}px`);v.style.setProperty('--studio-bg-x',`${bg.x}px`);v.style.setProperty('--studio-bg-y',`${bg.y}px`);v.style.setProperty('--studio-phone-bottom',`${f.startY+f.initialHeight}px`);v.style.setProperty('--desk-y',`${Math.min(height-22,f.startY+f.initialHeight+23)}px`);v.style.setProperty('--monitor-width',`${f.initialWidth}px`);
   d.style.setProperty('--logical-w',`${width}px`);d.style.setProperty('--logical-h',`${height}px`);d.style.setProperty('--screen-sx',`${Math.max(1,f.width-2*f.bezel)/width}`);d.style.setProperty('--screen-sy',`${Math.max(1,f.height-2*f.bezel)/height}`);
   d.style.setProperty('--device-w',`${f.width}px`);d.style.setProperty('--device-h',`${f.height}px`);d.style.setProperty('--device-x',`${f.x}px`);d.style.setProperty('--device-y',`${f.y}px`);d.style.setProperty('--device-radius',`${f.radius}px`);d.style.setProperty('--bezel',`${f.bezel}px`);d.style.setProperty('--stand',`${f.fade}`);v.style.setProperty('--intro-opacity',`${f.fade}`);v.style.setProperty('--intro-shift',`${f.shift}px`);v.style.setProperty('--progress',`${p*100}%`);
   const now=f.ready;if(now!==lastReady||entered.current!==now){lastReady=now;entered.current=now;setReady(now);}if(f.introVisible!==lastIntro){lastIntro=f.introVisible;setIntroVisible(f.introVisible);}

  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(draw)};const ro=new ResizeObserver(queue);ro.observe(v);if(introRef.current)ro.observe(introRef.current);const nav=document.querySelector('header.nav');if(nav)ro.observe(nav);window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);
  v.addEventListener('pointermove',pointerMove,{passive:true});v.addEventListener('pointerleave',resetPointer);window.addEventListener('blur',resetPointer);fine.addEventListener('change',motionChanged);
  draw();return()=>{if(frame)cancelAnimationFrame(frame);if(cameraFrame)cancelAnimationFrame(cameraFrame);ro.disconnect();window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);v.removeEventListener('pointermove',pointerMove);v.removeEventListener('pointerleave',resetPointer);window.removeEventListener('blur',resetPointer);fine.removeEventListener('change',motionChanged);
   for(const key of ['--camera-x','--camera-y','--camera-scale','--foreground-x','--foreground-y','--sign-x','--sign-y','--camera-light-x','--camera-light-y','--camera-light-opacity'])v.style.removeProperty(key);
  };
 },[classic,reduced]);
 useLayoutEffect(()=>{if(!classic&&ready&&focusApp.current&&body.current){body.current.scrollTop=0;body.current.focus({preventScroll:true});focusApp.current=false}},[active,classic,ready]);
 useEffect(()=>{if(ready&&focusApp.current){focusApp.current=false;body.current?.focus({preventScroll:true})}},[ready,active]);
 useEffect(()=>{const navigate=(e:Event)=>{const id=(e as CustomEvent<AppId>).detail;if(VALID.includes(id))select(id,false,true)};const hash=()=>{const id=hashApp();if(location.hash==='#main'){if(!classic)back();return;}if(VALID.includes(location.hash.slice(1) as AppId))select(id,false);};window.addEventListener('portfolio:navigate',navigate);window.addEventListener('hashchange',hash);return()=>{window.removeEventListener('portfolio:navigate',navigate);window.removeEventListener('hashchange',hash)}},[classic,mobile]);
 useEffect(()=>{if(initial.current)return;initial.current=true;if(location.hash&&location.hash!=='#main'&&VALID.includes(location.hash.slice(1) as AppId))requestAnimationFrame(()=>select(hashApp(),false));},[]);
 const introControls=<div className="ws-intro-actions"><button className="primary" onClick={()=>{if(classic){setClassic(false);requestAnimationFrame(()=>jump(true))}else jump(true)}}>{w.enter} ↗</button><a className="secondary" href={cv} download>{t.cv} ↓</a><button className="ws-text-btn" onClick={changeMode}>{classic?w.cinema:w.classic}</button></div>;
 const intro=<div className="ws-intro" ref={introRef} aria-hidden={!classic&&!introVisible} inert={!classic&&!introVisible}><span className="eyebrow">FULL-STACK DEVELOPER / FRONT-END FOCUS</span><h1 id="intro-title" tabIndex={-1}>Salvatore Bosco<span>.</span></h1><h2>{t.hero}</h2><p>{t.intro}</p>{classic&&introControls}</div>;
 const cvContent=<section className="section ws-cv"><div className="section-top"><span className="eyebrow">PDF / RÉSUMÉ</span><h2>{t.cv}<span className="accent">.</span></h2></div><div className="card"><h3>Salvatore Bosco — 2026</h3><p>{t.intro}</p><div className="buttons"><a className="primary" href={`${import.meta.env.BASE_URL}cv/cv-en.pdf`} download>English ↓</a><a className="secondary" href={`${import.meta.env.BASE_URL}cv/cv-it.pdf`} download>Italiano ↓</a></div></div></section>;
 const content:Partial<Record<AppId,React.ReactNode>>={about:kids[0],work:kids[1],experience:kids[2],terminal:extra[0],music:<div className="os-music">{extra.slice(1)}</div>,contact:kids[4],cv:cvContent};
 const windowLabels={close:lang==='it'?'Chiudi':'Close',min:lang==='it'?'Minimizza':'Minimize',max:lang==='it'?'Massimizza / ripristina':'Maximize / restore'};
 return <div className={`workspace-stage ${classic?'ws-classic':''} ${reduced?'ws-reduced':''}`} ref={stage}><div className="ws-sticky" ref={sticky}>
  {!classic&&<div className="cinematic-actions" aria-hidden={!introVisible} inert={!introVisible}>{introControls}</div>}
  {!classic&&<div className="ws-progress" aria-hidden="true"><span>{w.scroll} ↓</span><i/></div>}
  <div className="ws-camera">
  {classic?intro:<><Studio/><div className="studio-sign">{intro}</div></>}
  <div className="ws-device" ref={screen} data-ready={ready||classic}>
   {classic?<div className="ws-interface"><div className="ws-body" ref={body} tabIndex={-1}>{kids.map((child,i)=><div className="ws-panel" key={ids[i]}>{child}</div>)}<div id="cv" className="ws-panel">{cvContent}</div></div></div>:
   <div className="ws-interface os-screen" inert={!ready} aria-hidden={!ready}>
    <div className="os-top"><button className="os-brand" onClick={()=>select('home',true,true)}>SB<span>.</span>OS</button><span className="os-top-app">{active==='home'?w.desk:names[active]}</span><div className="os-top-right"><button onClick={back}>{w.back} ↑</button><button onClick={changeMode}>{w.classic}</button><span>{lang.toUpperCase()}</span><time>{clock.toLocaleTimeString(lang==='it'?'it-IT':'en-GB',{hour:'2-digit',minute:'2-digit'})}</time></div></div>
    <div className="os-desktop" ref={desktop}>
     <div className="os-wallpaper" aria-hidden="true"><svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="ribbonA" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#171027"/><stop offset=".35" stopColor="#543091"/><stop offset=".63" stopColor="#a477ef"/><stop offset=".78" stopColor="#37205e"/><stop offset="1" stopColor="#0c1021"/></linearGradient><linearGradient id="ribbonB" x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#0b0c1a"/><stop offset=".35" stopColor="#33265d"/><stop offset=".58" stopColor="#7757bb"/><stop offset=".80" stopColor="#262343"/><stop offset="1" stopColor="#12121e"/></linearGradient><linearGradient id="ribbonC" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#12162c"/><stop offset=".43" stopColor="#47386d"/><stop offset=".72" stopColor="#3f7289"/><stop offset="1" stopColor="#12121e"/></linearGradient><filter id="ribbonShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="30" stdDeviation="28" floodColor="#02020a" floodOpacity=".65"/></filter></defs><path d="M-100 650 C220 650 310 180 560 195 C820 210 815 660 1300 345 L1300 520 C850 810 780 390 575 356 C310 310 190 800 -100 790 Z" fill="url(#ribbonC)" filter="url(#ribbonShadow)"/><path d="M-100 570 C260 550 285 95 520 120 C780 145 820 600 1300 155 L1300 330 C870 760 680 320 514 288 C290 245 300 710 -100 750 Z" fill="url(#ribbonA)" filter="url(#ribbonShadow)"/><path d="M-100 735 C260 770 420 380 630 395 C860 410 910 690 1300 465 L1300 800 L-100 800 Z" fill="url(#ribbonB)" filter="url(#ribbonShadow)"/><path d="M-100 570 C260 550 285 95 520 120 C780 145 820 600 1300 155" fill="none" stroke="#d0b3ff" strokeOpacity=".38" strokeWidth="2"/></svg></div>
     <div className="os-icons">{APPS.map(id=><button className={`os-icon ws-app-${id==='terminal'||id==='music'?'extra':id}`} key={id} onClick={()=>select(id,true,true)}><span className="ws-app-icon"><Glyph id={id}/></span><strong>{names[id]}</strong></button>)}</div>
     {windows.map((win,i)=>{const visible=!win.minimized&&(!mobile||active===win.id);const r=win.maximized?{x:0,y:0,w:1,h:1}:win.rect;return <section key={win.id} className={`os-window ${active===win.id?'is-front':''}`} hidden={!visible} aria-label={names[win.id]} style={{left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.w*100}%`,height:`${r.h*100}%`,zIndex:10+i}} onPointerDown={()=>{if(active!==win.id)raise(win.id)}}>
      <header className="os-window-title" onPointerDown={e=>startGesture(e,win,'move')} onPointerMove={updateGesture} onPointerUp={endGesture} onPointerCancel={endGesture} onDoubleClick={()=>toggleMax(win.id)}><div className="os-controls" onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()}><button className="os-close" title={windowLabels.close} aria-label={windowLabels.close} onClick={()=>closeWindow(win.id)}>×</button><button className="os-min" title={windowLabels.min} aria-label={windowLabels.min} onClick={()=>closeWindow(win.id,true)}>−</button><button className="os-max" title={windowLabels.max} aria-label={windowLabels.max} onClick={()=>toggleMax(win.id)}>+</button></div><span><Glyph id={win.id}/>{names[win.id]}</span><small>SB.OS</small></header>
      <div className={`os-window-body ${win.id==='terminal'?'os-terminal-body':''}`} tabIndex={0} ref={active===win.id?body:undefined}><div className="ws-panel">{content[win.id]}</div></div>
      {!win.maximized&&<div className="os-resize" aria-hidden="true" onPointerDown={e=>startGesture(e,win,'resize')} onPointerMove={updateGesture} onPointerUp={endGesture} onPointerCancel={endGesture}/>}
     </section>})}
    </div>
    <nav className="os-dock" aria-label={w.desk}>{VALID.map(id=><button key={id} className={`ws-app-${id==='terminal'||id==='music'?'extra':id}`} aria-current={active===id?'page':undefined} onClick={()=>select(id,true,true)} title={names[id]}><span className="ws-app-icon"><Glyph id={id}/></span><span className="os-dock-label">{names[id]}</span><i className={windows.some(a=>a.id===id)?'running':''}/></button>)}</nav>
   </div>}
  </div>
  </div>
 </div></div>;
}
