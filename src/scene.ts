export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const ease=(v:number)=>{const n=clamp(v,0,1);return n*n*(3-2*n)};
// Calibrated edges of the actual front-facing monitor in the desktop room asset.
export const STUDIO_FRAME={width:1536,height:1024,x:403,y:304,w:729,h:363};
export function studioImageFrame(width:number,_height:number,initialWidth:number,initialHeight:number,startY:number){
 const a=STUDIO_FRAME;
 const sx=initialWidth/a.w,sy=initialHeight/a.h;
 return {width:a.width*sx,height:a.height*sy,x:(width-initialWidth)/2-a.x*sx,y:startY-a.y*sy};
}
export function scene(width:number,height:number,progress:number,introBottom:number){
 const p=clamp(progress,0,1),mobile=width<=700;
 const available=Math.max(1,height-introBottom-58);
 const initialScale=Math.min(mobile?.50:.48,available/height,mobile?240/width:1);
 const initialWidth=width*initialScale,initialHeight=height*initialScale;
 const startY=clamp(Math.max(height*(mobile?.27:.25),introBottom+10),0,Math.max(0,height-initialHeight-48));
 const z=ease(p/.98),fade=1-ease((p-.25)/.65);
 const scale=lerp(initialScale,1,z),w=width*scale,h=height*scale;
 const x=(width-w)/2,y=lerp(startY,0,z);
 return {width:w,height:h,x,y,radius:lerp(mobile?25:5,0,z),bezel:lerp(Math.min(mobile?5:4,initialWidth*.035),0,z),fade,shift:-55*ease(p),progress:p,ready:p>=.98,introVisible:p<.58,initialWidth,initialHeight,startY,scale,roomScale:scale/initialScale,roomX:x-(width-initialWidth)/2*(scale/initialScale),roomY:y-startY*(scale/initialScale)};
}
