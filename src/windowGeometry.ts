export type Rect={x:number;y:number;w:number;h:number};
const limit=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function fitWindow(r:Rect,minW=.28,minH=.30):Rect{
 const w=limit(r.w,minW,1),h=limit(r.h,minH,1);
 return {x:limit(r.x,0,1-w),y:limit(r.y,0,1-h),w,h};
}
export function moveWindow(r:Rect,dx:number,dy:number){return fitWindow({...r,x:r.x+dx,y:r.y+dy})}
export function resizeWindow(r:Rect,dx:number,dy:number){return {...r,w:limit(r.w+dx,.28,1-r.x),h:limit(r.h+dy,.30,1-r.y)}}
