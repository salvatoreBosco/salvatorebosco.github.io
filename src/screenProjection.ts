export type Point={x:number;y:number};
export type Quad=[Point,Point,Point,Point];
// Project the live DOM rectangle onto the four corners of the physical display.
// The homogeneous denominator is shared by both coordinates.
export function screenMatrix(w:number,h:number,q:Quad):number[]{
 const [a,b,c,d]=q;
 const dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x;
 const dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y;
 const det=dx1*dy2-dx2*dy1;
 if(w<=0||h<=0||Math.abs(det)<1e-9)throw Error('Degenerate screen');
 const g=(dx3*dy2-dx2*dy3)/det,j=(dx1*dy3-dx3*dy1)/det;
 return [(b.x-a.x+g*b.x)/w,(b.y-a.y+g*b.y)/w,0,g/w,(d.x-a.x+j*d.x)/h,(d.y-a.y+j*d.y)/h,0,j/h,0,0,1,0,a.x,a.y,0,1];
}
export function projectScreenPoint(m:number[],x:number,y:number):Point{
 const z=m[3]*x+m[7]*y+1;
 return {x:(m[0]*x+m[4]*y+m[12])/z,y:(m[1]*x+m[5]*y+m[13])/z};
}
export function orbitStrength(p:number){const t=Math.max(0,Math.min(1,(p-.10)/.78));return 1-t*t*(3-2*t);}
