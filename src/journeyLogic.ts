export type Position={x:number;z:number};
export const checkpoints=[{id:'school',x:-2.65,z:2},{id:'university',x:2.65,z:-4},{id:'internship',x:-2.65,z:-10},{id:'developer',x:2.65,z:-16}] as const;
export const spawn:Position={x:0,z:6};
export function movePlayer(p:Position,dx:number,dz:number,dt:number,speed=3.6):Position{
 const len=Math.hypot(dx,dz),step=Math.max(0,Math.min(.1,dt))*speed;
 if(!len)return {...p};
 return {x:Math.max(-3.8,Math.min(3.8,p.x+dx/len*step)),z:Math.max(-18,Math.min(7,p.z+dz/len*step))};
}
export function nearestCheckpoint(p:Position,radius=2.2){
 let index=-1,best=radius;
 checkpoints.forEach((c,i)=>{const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<best){best=d;index=i}});
 return index;
}
export function approachPoint(i:number):Position{
 const c=checkpoints[i];return {x:c.x*.52,z:c.z+.65};
}
