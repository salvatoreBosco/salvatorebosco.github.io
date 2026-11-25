import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {checkpoints,spawn,movePlayer,nearestCheckpoint,approachPoint,type Position} from './journeyLogic';
type Station={title:string;date:string;organization:string};
export interface JourneyEngine{
 setActive(active:boolean):void;
 setDirection(x:number,z:number):void;
 go(index:number):void;
 reset():void;
 dispose():void;
}
export function createJourney(host:HTMLElement,stations:Station[],onNear:(index:number)=>void,onLost:()=>void):JourneyEngine{
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const lost=(e:Event)=>{e.preventDefault();onLost()};renderer.domElement.addEventListener('webglcontextlost',lost);
 const world=new T.Scene();world.background=new T.Color(0x151826);world.fog=new T.Fog(0x151826,17,43);
 const camera=new T.PerspectiveCamera(48,1,.1,85);
 const materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 const mat=(color:number,roughness=.7,metalness=0,emissive=0,emissiveIntensity=0)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity});materials.add(m);return m};
 const dark=mat(0x232735),floor=mat(0x292c3c,.75),trim=mat(0x4d5168,.32,.55),white=mat(0xe2dfeb,.7),black=mat(0x121522,.55),wood=mat(0x695044,.7);
 const colors=[0xf4bf83,0x84aaf7,0x72d6c3,0xb5a0ff];
 function box(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,r=0){
  const mesh=new T.Mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.45,h*.45,d*.45)):new T.BoxGeometry(w,h,d),m);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;
 }
 function sphere(p:T.Object3D,r:number,x:number,y:number,z:number,m:T.Material){const a=new T.Mesh(new T.SphereGeometry(r,20,14),m);a.position.set(x,y,z);a.castShadow=true;p.add(a);return a}
 function label(p:T.Object3D,lines:string[],color:string,x:number,y:number,z:number,w:number,h:number){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
  ctx.fillStyle='#171a28';ctx.fillRect(0,0,1024,512);ctx.fillStyle=color;ctx.fillRect(0,0,1024,12);
  ctx.font='600 42px system-ui';ctx.fillText(lines[0],58,84,908);
  ctx.fillStyle='#f0eef9';ctx.font='700 76px system-ui';ctx.fillText(lines[1],58,211,908);
  ctx.fillStyle='#b9bdd0';ctx.font='400 44px system-ui';ctx.fillText(lines[2],58,330,908);
  ctx.fillStyle=color;ctx.font='600 32px system-ui';ctx.fillText('SB.OS / JOURNEY',58,457);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);
  const m=new T.MeshBasicMaterial({map:tex,toneMapped:false});materials.add(m);
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),m);mesh.position.set(x,y,z);p.add(mesh);
 }
 box(world,11,.25,34,0,-.13,-6,floor,.07);
 box(world,.22,5.4,34,-5.5,2.6,-6,dark);box(world,.22,5.4,34,5.5,2.6,-6,dark);
 box(world,11,5.4,.22,0,2.6,-23,dark);
 // Continuous illuminated pathway with real depth and separate exhibits.
 box(world,1.7,.018,27,0,.01,-6,mat(0x34384b,.55),.007);
 const rail=mat(0x716ca9,.35,.2,0x7961bc,.65);
 for(const x of [-.89,.89])box(world,.035,.025,27,x,.025,-6,rail);
 for(let z=6;z>=-19;z-=1.5)box(world,.16,.012,.28,0,.03,z,trim);
 for(let z=7;z>=-22;z-=6){
  box(world,10.8,.17,.27,0,4.85,z,trim);
  box(world,4.8,.04,.10,0,4.73,z,mat(0xcdd5ff,.5,0,0x899adf,1.1));
 }
 const stationGroups:T.Group[]=[];
 checkpoints.forEach((c,i)=>{
  const group=new T.Group();group.position.set(c.x,0,c.z);world.add(group);stationGroups.push(group);
  const accent=mat(colors[i],.45,.1,colors[i],.34);
  box(group,3.35,.12,3.5,0,.04,0,dark,.05);
  box(group,3.35,.025,.045,0,.113,1.73,accent);
  box(group,3.12,2.55,.18,0,1.37,-1.47,dark,.08);
  box(group,3.18,.05,.24,0,2.68,-1.47,accent);
  label(group,[stations[i].date,stations[i].title,stations[i].organization],'#'+colors[i].toString(16).padStart(6,'0'),0,1.98,-1.365,2.89,1.45);
  box(group,2.35,.12,.83,0,.86,-.62,wood,.035);
  for(const x of [-1.02,1.02])box(group,.095,.78,.70,x,.45,-.62,trim,.015);
  if(i===0){
   // Electronics workbench.
   box(group,.91,.09,.53,-.37,.97,-.59,mat(0x266b59),.012);
   for(let k=0;k<6;k++)box(group,.07,.08,.08,-.70+k*.13,1.05,-.59,trim,.008);
   box(group,.32,.08,.25,-.25,1.05,-.59,black,.015);
   box(group,.48,.30,.32,.68,1.07,-.62,black,.025);
   box(group,.35,.19,.018,.68,1.10,-.448,accent);
  }else if(i===1){
   // Books, notebook and a laptop.
   for(let k=0;k<4;k++)box(group,.47,.065,.37,-.65,.95+k*.07,-.6,mat([0x4d668d,0xc49a6c,0x535f83,0x838caa][k]),.008);
   box(group,.77,.04,.52,.38,.95,-.56,trim,.016);
   const lid=box(group,.77,.48,.035,.38,1.18,-.80,black,.012);lid.rotation.x=-.16;
   box(group,.56,.28,.012,.38,1.19,-.775,accent);
  }else{
   // Two distinct software-development exhibits.
   for(const x of i===3?[-.56,.56]:[0]){
    box(group,i===3?.86:1.25,.62,.09,x,1.35,-.78,black,.035);
    box(group,i===3?.76:1.14,.52,.015,x,1.35,-.725,mat(0x343a55,.5,0,colors[i],.18));
    for(let k=0;k<4;k++)box(group,(i===3?.48:.75)-k*.07,.021,.006,x-.04,1.49-k*.085,-.713,accent);
    box(group,.08,.19,.12,x,.99,-.78,trim);
    box(group,.39,.025,.34,x,.945,-.70,black);
   }
   box(group,.66,.035,.22,0,.95,-.10,trim,.008);
  }
  const portal=new T.Mesh(new T.TorusGeometry(.31,.027,10,42),accent);portal.rotation.x=-Math.PI/2;portal.position.set(-Math.sign(c.x)*1.24,.16,.65);group.add(portal);
 });
 const player=new T.Group();world.add(player);
 const jacket=mat(0x54426d,.68),skin=mat(0xd4a184,.78),hair=mat(0x27222b,.9),pants=mat(0x292c3a,.82);
 box(player,.49,.56,.29,0,.91,0,jacket,.10);
 box(player,.44,.24,.28,0,.55,0,pants,.06);
 sphere(player,.205,0,1.39,0,skin);
 const cap=sphere(player,.216,0,1.47,-.026,hair);cap.scale.set(1,.70,1);
 const limbs:T.Group[]=[];
 for(const side of [-1,1]){
  const arm=new T.Group();arm.position.set(side*.30,1.12,0);player.add(arm);limbs.push(arm);
  box(arm,.17,.37,.20,0,-.17,0,jacket,.06);sphere(arm,.083,0,-.38,0,skin);
  const leg=new T.Group();leg.position.set(side*.13,.52,0);player.add(leg);limbs.push(leg);
  box(leg,.19,.39,.20,0,-.18,0,pants,.06);box(leg,.21,.13,.33,0,-.43,.06,black,.045);
 }
 // The face points along local +Z; camera follows behind the avatar.
 for(const side of [-1,1])sphere(player,.019,side*.072,1.41,.19,black);
 const shadow=new T.Mesh(new T.CircleGeometry(.43,32),new T.MeshBasicMaterial({color:0x070912,transparent:true,opacity:.25,depthWrite:false}));materials.add(shadow.material);shadow.rotation.x=-Math.PI/2;shadow.position.y=.135;world.add(shadow);
 world.add(new T.HemisphereLight(0xd3d9ff,0x4c3d45,2.1));
 const sun=new T.DirectionalLight(0xe3e6ff,2.25);sun.position.set(5,9,9);world.add(sun);
 const fill=new T.DirectionalLight(0xa88fef,.6);fill.position.set(-5,3,-8);world.add(fill);
 renderer.shadowMap.enabled=false; // use local contact shadow; avoids expensive moving shadow maps in small windows.
 let pos:Position={...spawn},direction={x:0,z:0},destination:Position|null=null,active=false,disposed=false,raf=0,last=0,near=-2,phase=0,yaw=Math.PI;
 const follow=new T.Vector3(0,4.4,11.2),look=new T.Vector3(0,1,-.8);
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 function render(time:number){
  raf=0;if(!active||disposed)return;const dt=last?Math.min(.05,(time-last)/1000):1/60;last=time;
  let {x,z}=direction;
  if(destination){x=destination.x-pos.x;z=destination.z-pos.z;if(Math.hypot(x,z)<.16){destination=null;x=z=0}}
  const moving=Math.hypot(x,z)>.01;
  if(moving){pos=movePlayer(pos,x,z,dt);const angle=Math.atan2(x,z);const diff=Math.atan2(Math.sin(angle-yaw),Math.cos(angle-yaw));yaw+=diff*Math.min(1,dt*12);phase+=dt*10;}
  player.position.set(pos.x,0,pos.z);player.rotation.y=yaw;
  limbs.forEach((l,i)=>{const swing=moving?Math.sin(phase)*(i===0||i===3?1:-1)*.56:0;l.rotation.x=T.MathUtils.lerp(l.rotation.x,swing,Math.min(1,dt*15))});
  player.position.y=moving?Math.abs(Math.sin(phase))*.025:0;
  shadow.position.x=pos.x;shadow.position.z=pos.z;
  const cameraTarget=new T.Vector3(pos.x*.52,4.4,pos.z+5.5);
  follow.lerp(cameraTarget,1-Math.exp(-dt*5));
  look.lerp(new T.Vector3(pos.x*.67,1.0,pos.z-1.5),1-Math.exp(-dt*7));
  camera.position.copy(follow);camera.lookAt(look);
  const n=nearestCheckpoint(pos);if(n!==near){near=n;onNear(n)}
  renderer.render(world,camera);raf=requestAnimationFrame(render);
 }
 function setActive(value:boolean){active=value;if(!value){direction={x:0,z:0};destination=null;if(raf)cancelAnimationFrame(raf);raf=0;last=0}else if(!raf){resize();raf=requestAnimationFrame(render)}}
 function setDirection(x:number,z:number){direction={x,z};if(x||z)destination=null}
 function go(index:number){if(index>=0&&index<checkpoints.length){direction={x:0,z:0};destination=approachPoint(index)}}
 function reset(){pos={...spawn};destination=null;direction={x:0,z:0};yaw=Math.PI;follow.set(0,4.4,11.2);look.set(0,1,4.5)}
 function dispose(){disposed=true;setActive(false);ro.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);world.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}
 return {setActive,setDirection,go,reset,dispose};
}
