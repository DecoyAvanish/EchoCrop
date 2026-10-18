import {useEffect,useRef,useState,type CSSProperties} from 'react';

const siteOfTheYearUrl='/threeui/3d-paper-runtime.html';
const chamberUrl='/threeui/3d-paper-chamber.html';

type PaperClause={category:string;severity:string;originalText:string};
export type ThreeDPaperRuntimeProps={className?:string;style?:CSSProperties;reduced?:boolean;mode?:'hero'|'chamber';clauses?:PaperClause[];onClauseSelect?:(index:number)=>void;zoom?:number;focusIndex?:number};

/**
 * Runtime-optimized mount for the selected registered ThreeUI source.
 * The authored HTML, Three.js r149 runtime, shaders, and interactions remain
 * untouched; Vite serves the large document from public/ instead of parsing
 * it into the development module graph or watching it for HMR.
 */
export function ThreeDPaperRuntime({className='',style,reduced=false,mode='hero',clauses=[],onClauseSelect,zoom=1,focusIndex=-1}:ThreeDPaperRuntimeProps){
  const hostRef=useRef<HTMLDivElement>(null);
  const frameRef=useRef<HTMLIFrameElement>(null);
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
    const receive=(event:MessageEvent)=>{
      if(event.source!==frameRef.current?.contentWindow||event.origin!==location.origin)return;
      if(event.data?.type==='threeui-clause-select'&&Number.isInteger(event.data.index))onClauseSelect?.(event.data.index);
    };
    addEventListener('message',receive);
    return()=>removeEventListener('message',receive);
  },[onClauseSelect]);

  useEffect(()=>{
    if(!ready||mode!=='chamber')return;
    frameRef.current?.contentWindow?.postMessage({type:'threeui-paper-view',zoom,focusIndex},location.origin);
  },[ready,mode,zoom,focusIndex]);

  useEffect(()=>{
    const update=()=>setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange',update);
    return()=>document.removeEventListener('visibilitychange',update);
  },[]);

  const mounted=hostVisible&&documentVisible;
  useEffect(()=>setReady(false),[mounted]);
  const query=new URLSearchParams();
  if(reduced)query.set('reduced','1');
  if(mode==='chamber'){
    query.set('v','texture-2');
    query.set('mode','chamber');
    query.set('clauses',JSON.stringify(clauses.slice(0,8).map(({category,severity,originalText})=>({category,severity,originalText:originalText.slice(0,220)}))));
  }
  const runtimeUrl=mode==='chamber'?chamberUrl:siteOfTheYearUrl;
  const sourceUrl=`${runtimeUrl}${query.size?`?${query.toString()}`:''}`;

  return <div ref={hostRef} className={`threeui-background three-d-paper${className?` ${className}`:''}`} role="group" aria-label="Interactive translucent 3D paper certificate" data-state={!mounted?'paused':ready?'ready':'loading'} style={{position:'relative',overflow:'hidden',background:'#08080a',pointerEvents:'auto',...style}}>
    {mounted?<iframe ref={frameRef} title={mode==='chamber'?'3D Paper — Analyzed clauses':'3D Paper — Site of the Year'} src={sourceUrl} sandbox="allow-scripts allow-same-origin" loading="eager" onLoad={()=>setReady(true)} style={{position:'absolute',inset:0,display:'block',width:'100%',height:'100%',border:0,background:'#08080a',opacity:ready?1:0,pointerEvents:ready&&!reduced?'auto':'none',transition:reduced?'none':'opacity 240ms ease-out'}}/>:null}
  </div>;
}
