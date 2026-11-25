export type Position={x:number;z:number};
export const checkpoints=[{id:'school',x:-2.65,z:2},{id:'university',x:2.65,z:-4},{id:'internship',x:-2.65,z:-10},{id:'developer',x:2.65,z:-16}] as const;
export const spawn:Position={x:0,z:6};
// Footprint of the display boards and desks, expanded by the avatar radius.
export function canStand(p:Position){
 return !checkpoints.some(c=>Math.abs(p.x-c.x)<1.48&&(Math.abs(p.z-(c.z-.62))<.70||Math.abs(p.z-(c.z-1.47))<.36));
}
export function routeTo(p:Position,index:number):Position[]{
 const end=approachPoint(index);
 return [{x:0,z:p.z},{x:0,z:end.z},end];
}
export function movePlayer(p:Position,dx:number,dz:number,dt:number,speed=3.6):Position{
 const len=Math.hypot(dx,dz),step=Math.max(0,Math.min(.1,dt))*speed;
 if(!len)return {...p};
 const next={...p};
 const x=Math.max(-3.8,Math.min(3.8,p.x+dx/len*step));
 const z=Math.max(-18,Math.min(7,p.z+dz/len*step));
 if(canStand({x,z:p.z}))next.x=x;
 if(canStand({x:next.x,z}))next.z=z;
 return next;
}
export function nearestCheckpoint(p:Position,radius=2.2){
 let index=-1,best=radius;
 checkpoints.forEach((c,i)=>{const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<best){best=d;index=i}});
 return index;
}
export function approachPoint(i:number):Position{
 const c=checkpoints[i];return {x:c.x*.52,z:c.z+.65};
}

export const roomSpawn:Position={x:0,z:3.5};
export const roomPoints:Position[]=[{x:-2.65,z:-.9},{x:2.65,z:-.9},{x:0,z:-3.15}];
export function roomCanStand(p:Position){
 return Math.abs(p.x)<=4.25&&p.z>=-4.2&&p.z<=4.4&&
 !roomPoints.some(c=>Math.abs(p.x-c.x)<1.12&&Math.abs(p.z-(c.z-.85))<.67);
}
export function moveRoomPlayer(p:Position,dx:number,dz:number,dt:number):Position{
 const len=Math.hypot(dx,dz);if(!len)return {...p};
 const step=Math.max(0,Math.min(.1,dt))*3.6;
 const next={...p},x=Math.max(-4.25,Math.min(4.25,p.x+dx/len*step)),z=Math.max(-4.2,Math.min(4.4,p.z+dz/len*step));
 if(roomCanStand({x,z:p.z}))next.x=x;
 if(roomCanStand({x:next.x,z}))next.z=z;
 return next;
}
export function nearestRoomPoint(p:Position,radius=1.65){
 let found=-1,best=radius;roomPoints.forEach((c,i)=>{const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<best){best=d;found=i}});return found;
}
