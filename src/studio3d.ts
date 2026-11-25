import * as T from 'three';
import {screenMatrix,orbitStrength,type Quad} from './screenProjection';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {scene} from './scene';

type Frame=ReturnType<typeof scene>;
export interface StudioRenderer {
 render(w:number,h:number,f:Frame,nx:number,ny:number,time:number):string;
 dispose():void;
}
const standard=(color:number,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
function texture(w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');draw(ctx);
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;
}
export function createStudio(host:HTMLElement,onLost:()=>void):StudioRenderer{
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const lost=(e:Event)=>{e.preventDefault();onLost()};renderer.domElement.addEventListener('webglcontextlost',lost);
 const world=new T.Scene();world.background=new T.Color(0x141019);
 const camera=new T.PerspectiveCamera(44,1,.025,100);
 const wall=standard(0x39313a,.95),floor=standard(0x211c21,.86),black=standard(0x17171d,.48,.2),metal=standard(0x33313b,.3,.7),key=standard(0x28252d,.67),felt=standard(0x252127,.98);
 let seed=73;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const woodTex=texture(1024,512,c=>{
  c.fillStyle='#61402c';c.fillRect(0,0,1024,512);
  for(let i=0;i<1250;i++){const y=rnd()*512;c.strokeStyle=rnd()>.5?'rgba(235,179,120,.055)':'rgba(22,10,6,.105)';c.lineWidth=.4+rnd()*2;c.beginPath();c.moveTo(-20,y);c.bezierCurveTo(300,y+15*Math.sin(i),650,y-12*Math.cos(i),1050,y+6);c.stroke()}
  for(let y=0;y<512;y+=128){c.fillStyle='rgba(8,3,1,.18)';c.fillRect(0,y,1024,2)}
 });
 const wood=standard(0xffffff,.42);wood.map=woodTex;
 const mats=new Set<T.Material>([wall,floor,black,metal,key,felt,wood]);
 function box(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,r=0){
  mats.add(mat);
  const mesh=new T.Mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.48,h*.48,d*.48)):new T.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function cyl(parent:T.Object3D,rt:number,rb:number,h:number,x:number,y:number,z:number,mat:T.Material){
  mats.add(mat);const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,32),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 }
 function rod(parent:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,mat:T.Material){
  const mid=a.clone().add(b).multiplyScalar(.5);const m=cyl(parent,r,r,a.distanceTo(b),mid.x,mid.y,mid.z,mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
 }
 box(world,14,7,.22,0,3,-1.48,wall);
 box(world,14,.16,11,0,-.08,2,floor);
 box(world,.18,7,8,-6.9,3,2,wall);box(world,.18,7,8,6.9,3,2,wall);
 // Real desk with a solid top and supporting legs.
 box(world,6.7,.15,2.15,0,.86,.15,wood,.035);
 for(const x of [-2.92,2.92])for(const z of [-.65,.94])box(world,.13,.82,.13,x,.41,z,metal,.012);
 box(world,6.05,.12,.13,0,.32,-.64,metal,.01);
 // Acoustic treatment, visually integrated into the back wall.
 const slat=standard(0x51362e,.84);
 for(const side of [-1,1])for(let i=0;i<13;i++)box(world,.073,3.55,.10,side*(3.55+i*.14),2.75,-1.30,slat,.008);
 const desk=new T.Group();world.add(desk);
 const keyboard=new T.Group();desk.add(keyboard);keyboard.position.set(-.12,.96,.80);
 box(keyboard,1.45,.065,.47,0,0,0,black,.025);
 for(let row=0;row<5;row++)for(let col=0;col<15;col++){
  if(row===4&&col>=4&&col<=9)continue;
  box(keyboard,.081,.03,.071,(col-7)*.092,.047,(row-2)*.085,key,.008);
 }
 box(keyboard,.54,.03,.071,-.03,.047,.17,key,.008);
 box(desk,2.65,.012,.78,.20,.941,.78,felt,.005);
 const mouse=new T.Mesh(new T.SphereGeometry(1,24,14),black);mouse.scale.set(.13,.077,.22);mouse.position.set(1.02,.99,.78);mouse.castShadow=true;desk.add(mouse);
 box(desk,.018,.014,.09,1.02,1.064,.70,metal,.004);
 // Speakers: recessed cones and outer cabinet with readable depth.
 const cone=standard(0x44414a,.6,.2);
 for(const side of [-1,1]){
  const speaker=new T.Group();speaker.position.set(side*2.02,.94,-.29);world.add(speaker);
  box(speaker,.51,.90,.48,0,.45,0,black,.045);
  for(const [y,r] of [[.30,.186],[.70,.083]]){
   const ring=new T.Mesh(new T.TorusGeometry(r,.018,12,44),metal);ring.position.set(0,y,.245);speaker.add(ring);
   const driver=cyl(speaker,r*.90,r*.62,.055,0,y,.248,cone);driver.rotation.x=Math.PI/2;
   const cap=new T.Mesh(new T.SphereGeometry(r*.42,24,16),black);cap.scale.z=.30;cap.position.set(0,y,.29);speaker.add(cap);
  }
  box(speaker,.025,.025,.01,.16,.10,.245,new T.MeshBasicMaterial({color:0xebb16c}),.004);
 }
 // Articulated brass lamp and warm spot light.
 const brass=standard(0x866040,.34,.65);
 cyl(world,.25,.26,.065,-2.83,.97,.20,black);
 const a=new T.Vector3(-2.83,1.0,.20),b=new T.Vector3(-2.83,1.84,.0),c=new T.Vector3(-2.37,2.38,.12);
 rod(world,a,b,.035,brass);rod(world,b,c,.034,brass);
 const shade=cyl(world,.105,.27,.24,c.x,c.y-.08,c.z,black);shade.rotation.z=-.28;
 const lampGlow=new T.MeshBasicMaterial({color:0xffd4a1});cyl(world,.22,.22,.015,c.x,c.y-.205,c.z,lampGlow);
 const lamp=new T.SpotLight(0xffc58a,32,7,Math.PI/4,.65,1.5);lamp.position.copy(c);lamp.target.position.set(-1.9,.91,.36);world.add(lamp,lamp.target);
 // Coffee mug with handle, notebook and a small pen.
 const ceramic=standard(0xc5b29b,.32),coffee=standard(0x38231b,.23);
 cyl(world,.12,.10,.18,2.67,1.035,.58,ceramic);
 cyl(world,.106,.106,.007,2.67,1.128,.58,coffee);
 const handle=new T.Mesh(new T.TorusGeometry(.074,.018,12,28),ceramic);handle.position.set(2.79,1.05,.58);world.add(handle);
 const book=new T.Group();book.position.set(-2.13,.95,.84);book.rotation.y=.13;world.add(book);
 box(book,.50,.065,.65,0,0,0,standard(0x28212b,.85),.013);
 box(book,.47,.044,.62,0,.004,.007,standard(0xb8a58d,.85));
 box(book,.012,.071,.65,-.23,0,0,black);
 const pen=cyl(book,.012,.012,.29,.12,.052,0,metal);pen.rotation.x=Math.PI/2;pen.rotation.z=.25;
 // Burgundy electric guitar on a floor stand; extruded body, neck and strings.
 const guitar=new T.Group();guitar.position.set(3.8,.40,-.33);guitar.rotation.z=-.12;guitar.rotation.y=-.17;world.add(guitar);
 const s=new T.Shape();s.moveTo(0,-.39);s.bezierCurveTo(-.38,-.44,-.54,-.12,-.32,.12);s.bezierCurveTo(-.48,.39,-.27,.57,-.12,.28);s.lineTo(.12,.28);s.bezierCurveTo(.28,.52,.46,.30,.31,.09);s.bezierCurveTo(.53,-.12,.37,-.43,0,-.39);
 const burgundy=standard(0x692136,.27,.24);mats.add(burgundy);
 const body=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.09,bevelEnabled:true,bevelThickness:.035,bevelSize:.028,bevelSegments:3,steps:1,curveSegments:16}),burgundy);body.castShadow=true;guitar.add(body);
 box(guitar,.13,1.18,.075,0,.81,.045,wood,.01);
 box(guitar,.16,.27,.075,.035,1.48,.04,black,.025);
 for(let i=0;i<16;i++)box(guitar,.137,.005,.009,0,.29+i*.061,.092,metal);
 for(const y of [-.06,.12])box(guitar,.27,.095,.045,0,y,.14,black,.012);
 box(guitar,.28,.035,.025,0,-.19,.15,metal);
 for(let i=0;i<6;i++)rod(guitar,new T.Vector3((i-2.5)*.018,-.19,.17),new T.Vector3((i-2.5)*.015,1.53,.105),.0018,metal);
 for(const x of [-.22,.22])rod(world,new T.Vector3(3.8+x,.04,.05),new T.Vector3(3.8+x*.6,.60,-.42),.023,black);
 // Lit, physically positioned studio branding.
 const signTexture=texture(1536,320,c=>{
  c.clearRect(0,0,1536,320);c.textAlign='center';c.textBaseline='middle';
  c.font='600 112px system-ui,sans-serif';c.fillStyle='#ffe5c8';c.shadowColor='#e5a167';c.shadowBlur=23;
  c.fillText('SALVATORE BOSCO',768,114);c.shadowBlur=8;
  c.font='400 46px system-ui,sans-serif';c.fillStyle='#e7d4cc';c.fillText('FULL-STACK DEVELOPER / FRONT-END FOCUS',768,238);
 });
 const signMat=new T.MeshBasicMaterial({map:signTexture,transparent:true,depthWrite:false,toneMapped:false});mats.add(signMat);
 const sign=new T.Mesh(new T.PlaneGeometry(4.35,.90),signMat);sign.position.set(0,3.1,-1.345);world.add(sign);
 const signLight=new T.PointLight(0xffac6d,2.5,4,2);signLight.position.set(0,3.15,-1.07);world.add(signLight);
 // The real screen is a DOM quad; the monitor's housing and stand are real geometry.
 const display=new T.Group();world.add(display);
 const frameMat=standard(0x16151b,.31,.55);
 const screenMat=new T.MeshBasicMaterial({color:0x0d101b});mats.add(screenMat);
 const housing=box(display,1,1,.11,0,0,-.055,frameMat,.035);
 const panel=box(display,1,1,.005,0,0,.006,screenMat);
 const stand=box(world,.25,.40,.13,0,1.12,-.17,metal,.025);
 const base=box(world,.87,.075,.56,0,.974,-.10,metal,.025);
 const rim=new T.PointLight(0x9670ff,9,5,2);rim.position.set(0,1.8,-.32);world.add(rim);
 const ambient=new T.HemisphereLight(0xd8d5fa,0x604137,1.35);world.add(ambient);
 const main=new T.DirectionalLight(0xffe2cc,2.05);main.position.set(-3,6,5);main.castShadow=true;
 main.shadow.mapSize.set(1536,1536);Object.assign(main.shadow.camera,{left:-6,right:6,top:5,bottom:-4,near:.5,far:20});main.shadow.normalBias=.025;main.shadow.bias=-.00015;world.add(main);
 const fill=new T.DirectionalLight(0x8d9fff,.52);fill.position.set(4,3,3);world.add(fill);
 let lastW=0,lastH=0,screenW=3.25,screenH=1.7,screenY=2;
 function resize(w:number,h:number){
  const mobile=w<=700;screenW=mobile?.67:3.25;screenH=screenW*h/w;
  // For very short landscape viewports, maintain a usable physical desk layout.
  screenY=1.18+screenH/2;
  display.position.set(0,screenY,0);
  housing.scale.set(screenW+.105,screenH+.105,1);panel.scale.set(screenW,screenH,1);
  stand.scale.set(mobile?.43:1,1,1);base.scale.set(mobile?.6:1,1,1);
  sign.position.y=screenY+screenH/2+(mobile?.40:.57);
  sign.scale.setScalar(mobile?.36:1);
  keyboard.visible=!mobile;mouse.visible=!mobile;desk.visible=!mobile;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  renderer.shadowMap.needsUpdate=true;lastW=w;lastH=h;
 }
 function render(w:number,h:number,f:Frame,nx:number,ny:number,time:number){
  if(w!==lastW||h!==lastH)resize(w,h);
  if(f.ready){host.style.visibility='hidden';return 'none'}
  host.style.visibility='visible';
  const strength=orbitStrength(f.progress);
  const scale=f.width/w,halfFov=T.MathUtils.degToRad(camera.fov/2);
  const distance=screenH/(2*Math.tan(halfFov)*scale);
  const centerY=f.y+f.height/2;
  const targetY=screenY+(centerY-h/2)*2*Math.tan(halfFov)*distance/h;
  const mobile=w<=700,orbit=mobile?.23:1;
  const px=nx*strength*orbit,py=ny*strength*orbit;
  camera.position.set(px*.84,targetY+py*.42,.012+distance);
  camera.lookAt(px*.12,targetY+py*.045,.012);
  camera.updateMatrixWorld();
  rim.intensity=9+Math.sin(time*.0009)*.8*strength;
  renderer.render(world,camera);
  const corners=[[-screenW/2,screenY+screenH/2],[screenW/2,screenY+screenH/2],[screenW/2,screenY-screenH/2],[-screenW/2,screenY-screenH/2]];
  const q=corners.map(([x,y])=>{const v=new T.Vector3(x,y,.012).project(camera);return {x:(v.x+1)*w/2,y:(1-v.y)*h/2}}) as Quad;
  return 'matrix3d('+screenMatrix(w,h,q).join(',')+')';
 }
 function dispose(){
  renderer.domElement.removeEventListener('webglcontextlost',lost);
  world.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()});
  for(const m of mats)m.dispose();woodTex.dispose();signTexture.dispose();
  renderer.dispose();renderer.domElement.remove();
 }
 return {render,dispose};
}
