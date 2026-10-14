import {useEffect,useRef,useState,type CSSProperties} from 'react';

const siteOfTheYearUrl='/threeui/3d-paper-runtime.html';

export type ThreeDPaperRuntimeProps={className?:string;style?:CSSProperties;reduced?:boolean};

/**
 * Runtime-optimized mount for the selected registered ThreeUI source.
 * The authored HTML, Three.js r149 runtime, shaders, and interactions remain
 * untouched; Vite serves the large document from public/ instead of parsing
 * it into the development module graph or watching it for HMR.
 */
export function ThreeDPaperRuntime({className='',style,reduced=false}:ThreeDPaperRuntimeProps){
  const hostRef=useRef<HTMLDivElement>(null);
  const[documentVisible,setDocumentVisible]=useState(()=>typeof document==='undefined'||!document.hidden);
  const[hostVisible,setHostVisible]=useState(true);
  const[ready,setReady]=useState(false);

  useEffect(()=>{
    const host=hostRef.current;
    if(!host||typeof IntersectionObserver==='undefined')return;
    const observer=new IntersectionObserver(([entry])=>setHostVisible(entry?.isIntersecting??true),{rootMargin:'80px'});
    observer.observe(host);
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const update=()=>setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange',update);
    return()=>document.removeEventListener('visibilitychange',update);
  },[]);

  const mounted=hostVisible&&documentVisible;
  useEffect(()=>setReady(false),[mounted]);

  return <div ref={hostRef} className={`threeui-background three-d-paper${className?` ${className}`:''}`} role="group" aria-label="Interactive translucent 3D paper certificate" data-state={!mounted?'paused':ready?'ready':'loading'} style={{position:'relative',overflow:'hidden',background:'#08080a',pointerEvents:'auto',...style}}>
    {mounted?<iframe title="3D Paper — Site of the Year" src={`${siteOfTheYearUrl}${reduced?'?reduced=1':''}`} sandbox="allow-scripts allow-same-origin" loading="eager" onLoad={()=>setReady(true)} style={{position:'absolute',inset:0,display:'block',width:'100%',height:'100%',border:0,background:'#08080a',opacity:ready?1:0,pointerEvents:ready&&!reduced?'auto':'none',transition:reduced?'none':'opacity 240ms ease-out'}}/>:null}
  </div>;
}
