import {test} from 'node:test';import assert from 'node:assert/strict';import {fitWindow,moveWindow,resizeWindow} from '../src/windowGeometry.ts';
const rect={x:.2,y:.1,w:.6,h:.7};
const within=r=>r.x>=0&&r.y>=0&&r.w>=.28&&r.h>=.3&&r.x+r.w<=1.000001&&r.y+r.h<=1.000001;
test('window moves within desktop bounds',()=>{for(const dx of [-5,-.1,0,.1,5])for(const dy of [-5,-.1,0,.1,5])assert.ok(within(moveWindow(rect,dx,dy)))});
test('resize preserves position and minimum dimensions',()=>{for(const dx of [-5,-.1,0,.1,5])for(const dy of [-5,-.1,0,.1,5]){const r=resizeWindow(rect,dx,dy);assert.equal(r.x,rect.x);assert.equal(r.y,rect.y);assert.ok(within(r))}});
test('initial rectangle fits after stagger',()=>assert.ok(within(fitWindow({x:.9,y:.9,w:.75,h:.83}))));
