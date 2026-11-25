import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roomSpawn,roomPoints,roomCanStand,moveRoomPlayer,nearestRoomPoint} from '../src/journeyLogic.ts';
test('room spawn and all exhibit interaction zones are accessible',()=>{
 assert.ok(roomCanStand(roomSpawn));assert.equal(nearestRoomPoint(roomSpawn),-1);
 roomPoints.forEach((p,i)=>{assert.ok(roomCanStand(p));assert.equal(nearestRoomPoint(p),i);let q={...roomSpawn};for(const target of [{x:p.x,z:2},p]){for(let k=0;k<350&&Math.hypot(target.x-q.x,target.z-q.z)>.08;k++)q=moveRoomPlayer(q,target.x-q.x,target.z-q.z,.02);assert.ok(Math.hypot(target.x-q.x,target.z-q.z)<=.08)}});
});
test('room walls and exhibit desks constrain movement',()=>{
 let q={...roomSpawn};for(let k=0;k<300;k++)q=moveRoomPlayer(q,1,0,.1);assert.equal(q.x,4.25);
 for(const p of roomPoints){let q={...p};for(let k=0;k<200;k++)q=moveRoomPlayer(q,0,-1,.05);assert.ok(roomCanStand(q));assert.ok(q.z>=p.z-.18-1e-8)}
});
