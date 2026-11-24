import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scene} from '../src/scene.ts';
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
