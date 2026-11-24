export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const ease=(v:number)=>{const n=clamp(v,0,1);return n*n*(3-2*n)};
export function scene(width:number,height:number,progress:number,introBottom:number){
 const p=clamp(progress,0,1),mobile=width<=700;
 const available=Math.max(1,height-introBottom-45);
 const initialWidth=mobile?Math.min(224,width*.57,height*.31,available/1.79):Math.min(650,width*.52,height*.76,available/.59);
 const initialHeight=initialWidth*(mobile?1.79:.59);
 const startY=clamp(Math.max(height*.51,introBottom+12),0,Math.max(0,height-initialHeight-31));
 const z=ease(p/.98),fade=1-ease((p-.03)/.55);
 return {width:lerp(initialWidth,width,z),height:lerp(initialHeight,height,z),x:lerp((width-initialWidth)/2,0,z),y:lerp(startY,0,z),radius:lerp(mobile?27:14,0,z),bezel:lerp(mobile?6:8,0,z),fade,shift:-55*ease(p),progress:p,ready:p>=.98,introVisible:p<.58};
}
