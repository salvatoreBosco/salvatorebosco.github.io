import React from 'react';
/** One photographic environment; the screen is the existing, live React desktop. */
export function Studio(){
 const base=import.meta.env.BASE_URL;
 return <><div className="studio-3d-host" aria-hidden="true"/><div className="studio-room cinematic-room" aria-hidden="true" style={{'--studio-desktop':`url("${base}studio/room-desktop.webp")`,'--studio-mobile':`url("${base}studio/room-mobile.webp")`} as React.CSSProperties}/></>;
}
