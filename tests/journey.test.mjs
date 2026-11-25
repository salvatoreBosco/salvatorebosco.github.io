import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkpoints,spawn,movePlayer,nearestCheckpoint,approachPoint} from '../src/journeyLogic.ts';
test('diagonal movement has same speed as straight movement',()=>{
 const a=movePlayer(spawn,1,0,.1),b=movePlayer(spawn,1,-1,.1);
 assert.ok(Math.abs(Math.hypot(a.x-spawn.x,a.z-spawn.z)-Math.hypot(b.x-spawn.x,b.z-spawn.z))<1e-10);
});
test('movement stays within gallery bounds',()=>{
 let p={...spawn};for(let i=0;i<1000;i++)p=movePlayer(p,1,-1,.1);
 assert.deepEqual(p,{x:3.8,z:-18});
 for(let i=0;i<1000;i++)p=movePlayer(p,-1,1,.1);
 assert.deepEqual(p,{x:-3.8,z:7});
});
test('all chronological stations have reachable interaction points',()=>{
 assert.equal(nearestCheckpoint(spawn),-1);
 checkpoints.forEach((c,i)=>{assert.equal(nearestCheckpoint(approachPoint(i)),i);let p={...spawn},a=approachPoint(i);for(let step=0;step<300&&Math.hypot(a.x-p.x,a.z-p.z)>.16;step++)p=movePlayer(p,a.x-p.x,a.z-p.z,.02);assert.equal(nearestCheckpoint(p),i)});
});
