import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {useDeferredScene} from '../sceneSupport';
import '../scene-performance.css';

type PaperClause={category:string;severity:string;originalText:string};
export type ThreeDPaperRuntimeProps={
  className?:string;style?:CSSProperties;reduced?:boolean;mode?:'hero'|'chamber';
  clauses?:PaperClause[];onClauseSelect?:(index:number)=>void;zoom?:number;focusIndex?:number;
  pageNumber?:number;pageCount?:number;totalClauses?:number;clauseOffset?:number;documentTitle?:string;
};

function PaperPoster({mode,clauses,pageNumber,pageCount,clauseOffset,onClauseSelect,documentTitle,failed}:Pick<ThreeDPaperRuntimeProps,'mode'|'clauses'|'pageNumber'|'pageCount'|'clauseOffset'|'onClauseSelect'|'documentTitle'>&{failed:boolean}){
  if(mode!=='chamber')return <div className="paper-poster" aria-hidden="true"><img src="/threeui/lease-poster.svg" alt="" width="1200" height="1656" fetchPriority="high"/></div>;
  return <div className="paper-poster"><article className="paper-fallback-sheet" aria-label="Document reading preview">
    <header><small>FINE PRINT X-RAY · LOCAL ANALYSIS</small><h2>{documentTitle||'Your document'}</h2><small>PAGE {pageNumber} / {pageCount}</small></header>
    <div className="paper-fallback-content"><p>Clauses are marked directly in the document.</p>{clauses?.map((clause,index)=><button key={`${clauseOffset}-${index}`} className={clause.severity} onClick={()=>onClauseSelect?.(index)}><b>{String((clauseOffset??0)+index+1).padStart(2,'0')} · {clause.category} · {clause.severity==='neutral'?'Not flagged':clause.severity}</b>{clause.originalText}</button>)}<p className="paper-fallback-note">{failed?'Reading preview · every clause remains available without 3D.':'Preparing the interactive paper…'}</p></div>
  </article></div>;
}

/** A readable first paint, then the authored paper scene when graphics are ready. */
export function ThreeDPaperRuntime({className='',style,reduced=false,mode='hero',clauses=[],onClauseSelect,zoom=1,focusIndex=-1,pageNumber=1,pageCount=1,totalClauses=clauses.length,clauseOffset=0,documentTitle='Your document'}:ThreeDPaperRuntimeProps){
  const {hostRef,enabled,unavailable}=useDeferredScene();
  const frameRef=useRef<HTMLIFrameElement>(null);
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const content=useRef({clauses,pageNumber,pageCount,totalClauses,clauseOffset,documentTitle,zoom,focusIndex});
  content.current={clauses,pageNumber,pageCount,totalClauses,clauseOffset,documentTitle,zoom,focusIndex};
  const selectRef=useRef(onClauseSelect);selectRef.current=onClauseSelect;
  const postContent=()=>frameRef.current?.contentWindow?.postMessage({type:'threeui-paper-content',...content.current},location.origin);

  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.source!==frameRef.current?.contentWindow||event.origin!==location.origin)return;
      if(event.data?.type==='threeui-paper-ready'){
        if(mode==='chamber')postContent();else setReady(true);
      }
      if(event.data?.type==='threeui-paper-content-ready')setReady(true);
      if(event.data?.type==='threeui-paper-error'){setFailed(true);setReady(false)}
      if(event.data?.type==='threeui-clause-select'&&Number.isInteger(event.data.index)&&event.data.index>=0&&event.data.index<content.current.clauses.length)selectRef.current?.(event.data.index);
    };
    addEventListener('message',receive);return()=>removeEventListener('message',receive);
  },[mode]);

  useEffect(()=>{
    if(ready&&mode==='chamber')postContent();
  },[ready,mode,clauses,pageNumber,pageCount,totalClauses,clauseOffset,documentTitle]);
  useEffect(()=>{
    if(ready&&mode==='chamber')frameRef.current?.contentWindow?.postMessage({type:'threeui-paper-view',zoom,focusIndex},location.origin);
  },[ready,mode,zoom,focusIndex]);
  useEffect(()=>{
    if(!enabled||ready||failed)return;
    const timeout=setTimeout(()=>setFailed(true),15000);return()=>clearTimeout(timeout);
  },[enabled,ready,failed]);
  useEffect(()=>{
    const sendVisibility=(visible:boolean)=>frameRef.current?.contentWindow?.postMessage({type:'threeui-paper-visibility',visible:visible&&!document.hidden},location.origin);
    const update=()=>sendVisibility(!document.hidden);
    document.addEventListener('visibilitychange',update);
    const host=hostRef.current;
    const observer=host&&typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>sendVisibility(entries.some(entry=>entry.isIntersecting)),{rootMargin:'100px'}):null;
    if(host)observer?.observe(host);
    return()=>{document.removeEventListener('visibilitychange',update);observer?.disconnect()};
  },[enabled,ready,hostRef]);

  const sourceUrl=`/threeui/3d-paper-${mode==='chamber'?'chamber':'runtime'}.html${reduced?'?reduced=1':''}`;
  return <div ref={hostRef} className={`threeui-background three-d-paper${className?` ${className}`:''}`} role="group" aria-label={mode==='hero'?'Interactive residential lease paper':'Interactive analyzed document paper'} data-state={failed?'fallback':ready?'ready':'loading'} style={{position:'relative',overflow:'hidden',background:'transparent',pointerEvents:'auto',...style}}>
    <PaperPoster mode={mode} clauses={clauses} pageNumber={pageNumber} pageCount={pageCount} clauseOffset={clauseOffset} documentTitle={documentTitle} onClauseSelect={onClauseSelect} failed={failed||unavailable}/>
    {enabled&&!failed?<iframe ref={frameRef} title={mode==='chamber'?'3D paper — analyzed clauses':'3D paper — residential lease'} src={sourceUrl} loading="lazy" tabIndex={-1} aria-hidden="true" onError={()=>setFailed(true)} style={{position:'absolute',inset:0,display:'block',width:'100%',height:'100%',border:0,background:'transparent',opacity:ready?1:0,pointerEvents:ready&&!reduced?'auto':'none',transition:reduced?'none':'opacity 240ms ease-out'}}/>:null}
  </div>;
}
