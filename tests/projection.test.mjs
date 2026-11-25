import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenMatrix,projectScreenPoint,orbitStrength} from '../src/screenProjection.ts';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('screen projection preserves all four physical monitor corners',()=>{
 for(const [w,h] of [[1440,720],[390,720],[1920,1080]]){
  for(const q of [[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}],[{x:70,y:120},{x:420,y:87},{x:470,y:360},{x:49,y:400}],[{x:125,y:60},{x:490,y:135},{x:480,y:510},{x:108,y:460}]]){
   const m=screenMatrix(w,h,q);
   [[0,0],[w,0],[w,h],[0,h]].forEach(([x,y],i)=>{const p=projectScreenPoint(m,x,y);close(p.x,q[i].x);close(p.y,q[i].y)});
  }
 }
});
test('fullscreen quad produces an identity transform',()=>{
 const m=screenMatrix(1440,720,[{x:0,y:0},{x:1440,y:0},{x:1440,y:720},{x:0,y:720}]);
 const q=projectScreenPoint(m,362,617);close(q.x,362);close(q.y,617);
});
test('orbit fades smoothly to zero before the screen is interactive',()=>{
 let old=1;for(let i=0;i<=100;i++){const n=orbitStrength(i/100);assert.ok(n<=old+1e-12&&n>=0);old=n;}
 assert.equal(orbitStrength(1),0);assert.equal(orbitStrength(.88),0);
});
