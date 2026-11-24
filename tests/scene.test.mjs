import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scene, studioImageFrame, STUDIO_FRAME, pointerCamera, smoothPointer} from '../src/scene.ts';
for(const [width,height,introBottom] of [[1440,720,260],[1024,700,260],[390,720,205],[320,500,175],[844,330,115]]){
 test(`geometry stays within viewport at ${width}×${height}`,()=>{
  let previous=scene(width,height,0,introBottom);
  assert.ok(Math.abs(previous.x-(width-previous.width)/2)<1e-8);
  assert.ok(previous.y>=introBottom);
  for(let i=0;i<=100;i++){
   const f=scene(width,height,i/100,introBottom);
   assert.ok(f.x>=-1e-8&&f.y>=-1e-8&&f.x+f.width<=width+1e-8&&f.y+f.height<=height+1e-8);
   assert.ok(f.width>=previous.width-1e-8&&f.height>=previous.height-1e-8);previous=f;
  }
  const end=scene(width,height,1,introBottom);assert.deepEqual([end.x,end.y,end.width,end.height,end.radius,end.bezel,end.ready],[0,0,width,height,0,0,true]);
  const forward=Array.from({length:101},(_,i)=>scene(width,height,i/100,introBottom));
  const backward=Array.from({length:101},(_,i)=>scene(width,height,(100-i)/100,introBottom));
  assert.deepEqual(backward.reverse(),forward);
 });
}
test('clamped progress, ready and intro state',()=>{assert.equal(scene(400,700,-1,220).progress,0);assert.equal(scene(400,700,4,220).progress,1);assert.equal(scene(400,700,.5,220).ready,false);assert.equal(scene(400,700,.5,220).introVisible,true);assert.equal(scene(400,700,.8,220).introVisible,false)});
test('camera stays aligned with actual screen at every scroll position',()=>{
 for(const [w,h,b] of [[1440,720,170],[390,720,110],[320,500,140]]){
  const initial=scene(w,h,0,b);
  for(let i=0;i<=100;i++){
   const f=scene(w,h,i/100,b);
   assert.ok(Math.abs(initial.x*f.roomScale+f.roomX-f.x)<1e-7);
   assert.ok(Math.abs(initial.y*f.roomScale+f.roomY-f.y)<1e-7);
   assert.ok(Math.abs(initial.width*f.roomScale-f.width)<1e-7);
   assert.ok(Math.abs(f.width/f.height-w/h)<1e-7);
  }
 }
});

test('photographic screen opening aligns at every tested desktop viewport',()=>{
 for(const [w,h,b] of [[1440,720,130],[1920,950,150],[1024,700,120],[844,330,100]]){
  const f=scene(w,h,0,b),a=STUDIO_FRAME,r=studioImageFrame(w,h,f.initialWidth,f.initialHeight,f.startY);
  assert.ok(Math.abs(r.x+a.x*r.width/a.width-f.x)<1e-7);
  assert.ok(Math.abs(r.y+a.y*r.height/a.height-f.y)<1e-7);
  assert.ok(Math.abs(a.w*r.width/a.width-f.width)<1e-7);
  assert.ok(Math.abs(a.h*r.height/a.height-f.height)<1e-7);
 }
});

test('pointer camera overscan covers viewport and disables before workspace interaction',()=>{
 for(const [w,h] of [[1440,720],[1920,1080],[1024,600],[844,330]]){
  for(const p of [0,.1,.3,.5,.7,.78,1])for(const nx of [-2,-1,0,1,2])for(const ny of [-1,0,1]){
   const c=pointerCamera(w,h,p,nx,ny,true);
   assert.ok(Math.abs(c.x)<=(c.scale-1)*w/2+1e-9);
   assert.ok(Math.abs(c.y)<=(c.scale-1)*h/2+1e-9);
   assert.ok(c.strength>=0&&c.strength<=1);
   if(p>=.78)assert.ok(c.scale===1&&c.x===0&&c.y===0&&c.foregroundX===0&&c.foregroundY===0&&c.signX===0&&c.signY===0);
  }
 }
 for(const [w,enabled] of [[390,true],[1440,false]]){
  const c=pointerCamera(w,720,0,1,1,enabled);
  assert.equal(c.scale,1);assert.equal(c.strength,0);assert.ok(c.x===0&&c.y===0&&c.foregroundX===0&&c.signX===0);
 }
});
test('pointer smoothing converges without overshoot and returns to neutral',()=>{
 let x=0;for(let i=0;i<100;i++){const next=smoothPointer(x,1,16.7);assert.ok(next>=x&&next<=1);x=next}
 assert.equal(x,1);
 for(let i=0;i<100;i++){const next=smoothPointer(x,0,16.7);assert.ok(next<=x&&next>=0);x=next}
 assert.equal(x,0);
 assert.ok(Math.abs(smoothPointer(smoothPointer(0,1,20),1,20)-smoothPointer(0,1,40))<1e-12);
});
