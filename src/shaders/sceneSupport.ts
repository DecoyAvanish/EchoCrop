import {useEffect, useRef, useState} from 'react';

let webglAvailable:boolean|undefined;

/** Probe once, and release the probe context before opening any scene. */
export function supportsWebGL(){
  if(webglAvailable!==undefined)return webglAvailable;
  try{
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2')||canvas.getContext('webgl');
    webglAvailable=!!context;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }catch{webglAvailable=false}
  return webglAvailable;
}

/** Paint useful HTML first; request graphics only near the viewport and at idle. */
export function useDeferredScene(){
  const hostRef=useRef<HTMLDivElement>(null);
  const [enabled,setEnabled]=useState(false);
  const [unavailable,setUnavailable]=useState(false);
  useEffect(()=>{
    let cancelled=false,idle:number|undefined,timer:ReturnType<typeof setTimeout>|undefined;
    const activate=()=>{
      if(cancelled)return;
      if(!supportsWebGL()){setUnavailable(true);return}
      const start=()=>{if(!cancelled)setEnabled(true)};
      if('requestIdleCallback' in window)idle=window.requestIdleCallback(start,{timeout:1800});
      else timer=setTimeout(start,180);
    };
    let observer:IntersectionObserver|undefined;
    const host=hostRef.current;
    if(host&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){observer?.disconnect();activate()}
      },{rootMargin:'160px'});
      observer.observe(host);
    }else activate();
    return()=>{cancelled=true;observer?.disconnect();if(idle!==undefined)window.cancelIdleCallback(idle);if(timer)clearTimeout(timer)};
  },[]);
  return {hostRef,enabled,unavailable};
}
